/* Áudio local: separa frases por pausas e prepara WAV para o servidor Python. */
(function (global) {
  'use strict';

  function resamplePCM(samples, inputRate, outputRate = 16000) {
    if (!Number.isFinite(inputRate) || inputRate <= 0 || !Number.isFinite(outputRate) || outputRate <= 0) throw new Error('Taxa de áudio inválida.');
    if (inputRate === outputRate) return new Float32Array(samples);
    const length = Math.round(samples.length * outputRate / inputRate);
    const output = new Float32Array(length);
    const ratio = inputRate / outputRate;
    // Média por intervalo evita descartar a maior parte das amostras de 48 kHz.
    for (let i = 0; i < length; i++) {
      const start = i * ratio, end = Math.min(samples.length, (i + 1) * ratio);
      let sum = 0, weight = 0;
      for (let j = Math.floor(start); j < Math.ceil(end); j++) {
        const part = Math.min(end, j + 1) - Math.max(start, j);
        if (j < samples.length && part > 0) { sum += samples[j] * part; weight += part; }
      }
      output[i] = weight ? sum / weight : 0;
    }
    return output;
  }

  function encodeWav(samples, sampleRate = 16000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const word = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
    word(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); word(8, 'WAVE');
    word(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    word(36, 'data'); view.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i] || 0));
      view.setInt16(44 + i * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true);
    }
    return buffer;
  }

  class UtteranceSegmenter {
    constructor({ sampleRate = 16000, onSpeech, onLevel = () => {} }) {
      this.sampleRate = sampleRate;
      this.onSpeech = onSpeech;
      this.onLevel = onLevel;
      this.enabled = false;
      this.noiseFloor = .002;
      this.reset();
    }
    reset() {
      this.chunks = []; this.preRoll = []; this.preSamples = 0;
      this.active = false; this.totalSamples = 0; this.voicedSamples = 0; this.silentSamples = 0;
    }
    setEnabled(enabled) { this.enabled = enabled; this.reset(); if (!enabled) this.onLevel(0); }
    push(samples) {
      if (!this.enabled || !samples.length) return;
      let energy = 0;
      for (const sample of samples) energy += sample * sample;
      const rms = Math.sqrt(energy / samples.length);
      this.onLevel(Math.min(1, rms * 8));
      const voiced = rms >= Math.max(.008, Math.min(.035, this.noiseFloor * 2.8));
      if (!this.active) {
        if (!voiced) {
          this.noiseFloor = this.noiseFloor * .96 + Math.min(rms, .015) * .04;
          this.preRoll.push(new Float32Array(samples)); this.preSamples += samples.length;
          while (this.preRoll.length > 1 && this.preSamples > this.sampleRate * .15) this.preSamples -= this.preRoll.shift().length;
          return;
        }
        this.active = true;
        this.chunks = this.preRoll; this.totalSamples = this.preSamples;
        this.preRoll = []; this.preSamples = 0;
      }
      this.chunks.push(new Float32Array(samples)); this.totalSamples += samples.length;
      if (voiced) { this.voicedSamples += samples.length; this.silentSamples = 0; }
      else this.silentSamples += samples.length;
      if (this.silentSamples >= this.sampleRate * .75 || this.totalSamples >= this.sampleRate * 18) {
        const chunks = this.chunks, length = this.totalSamples;
        // Uma resposta curta ("sim", "é") também pode encerrar um turno.
        const useful = this.voicedSamples >= this.sampleRate * .12;
        this.reset();
        if (useful) {
          const phrase = new Float32Array(length);
          let offset = 0;
          for (const chunk of chunks) { phrase.set(chunk, offset); offset += chunk.length; }
          this.onSpeech(phrase);
        }
      }
    }
  }

  class LocalSpeechCapture {
    constructor({ onSpeech, onLevel, onError }) {
      this.onSpeech = onSpeech; this.onLevel = onLevel; this.onError = onError;
      this.enabled = false; this.stopped = false;
    }
    async start(stream) {
      const Context = global.AudioContext || global.webkitAudioContext;
      if (!Context) throw new Error('AudioContext indisponível.');
      this.context = new Context();
      await this.context.resume();
      this.segmenter = new UtteranceSegmenter({
        sampleRate: this.context.sampleRate, onLevel: this.onLevel,
        onSpeech: samples => this.onSpeech(resamplePCM(samples, this.context.sampleRate))
      });
      this.source = this.context.createMediaStreamSource(stream);
      if (this.context.audioWorklet && global.AudioWorkletNode) {
        await this.context.audioWorklet.addModule('audio-capture-worklet.js?v=local-voice-7');
        if (this.stopped) return;
        this.node = new global.AudioWorkletNode(this.context, 'microphone-pcm');
        this.node.port.onmessage = event => this.segmenter.push(event.data);
        this.node.onprocessorerror = () => this.onError?.(new Error('A captura de áudio parou.'));
      } else {
        // Compatibilidade com navegadores que oferecem Web Audio sem worklets.
        this.node = this.context.createScriptProcessor(2048, 1, 1);
        this.node.onaudioprocess = event => this.segmenter.push(event.inputBuffer.getChannelData(0));
      }
      if (this.stopped) return;
      this.silence = this.context.createGain(); this.silence.gain.value = 0;
      this.source.connect(this.node); this.node.connect(this.silence); this.silence.connect(this.context.destination);
      this.segmenter.setEnabled(this.enabled);
    }
    setEnabled(enabled) {
      this.enabled = enabled && !this.stopped;
      this.segmenter?.setEnabled(this.enabled);
      // resume() é necessário após alguns navegadores suspenderem áudio em segundo plano.
      if (this.enabled && this.context?.state === 'suspended') this.context.resume().catch(error => this.onError?.(error));
    }
    async stop() {
      this.stopped = true; this.setEnabled(false);
      if (this.node?.port) this.node.port.onmessage = null;
      if (this.node) this.node.onaudioprocess = this.node.onprocessorerror = null;
      for (const node of [this.source, this.node, this.silence]) { try { node?.disconnect(); } catch (_) {} }
      if (this.context && this.context.state !== 'closed') { try { await this.context.close(); } catch (_) {} }
    }
  }
  global.SpeechAudioUtils = { resamplePCM, encodeWav, UtteranceSegmenter };
  global.LocalSpeechCapture = LocalSpeechCapture;
})(window);
