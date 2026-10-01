(function (global) {
  'use strict';
  let worker, sequence = 0, ready, progressListener;
  const pending = new Map();
  function getWorker() {
    if (!worker) {
      worker = new Worker('browser-speech-worker.js?v=hosted-voice-8', { type: 'module' });
      worker.onmessage = event => {
        const data = event.data;
        if (data.type === 'progress') { progressListener?.(data.progress); return; }
        const item = pending.get(data.id);
        if (!item) return;
        item.cleanup(); pending.delete(data.id);
        if (data.error) item.reject(new Error(data.error)); else item.resolve(data.text || '');
      };
      worker.onerror = () => {
        for (const item of pending.values()) { item.cleanup(); item.reject(new Error('O reconhecimento de voz parou.')); }
        pending.clear(); worker.terminate(); worker = null; ready = null;
      };
    }
    return worker;
  }
  function request(type, samples, signal, timeout = 30000) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new Error('Captura cancelada.')); return; }
      const id = ++sequence;
      const cancel = () => { cleanup(); pending.delete(id); reject(new Error('Captura cancelada.')); };
      const timer = setTimeout(() => { cleanup(); pending.delete(id); reject(new Error('O reconhecimento demorou demais.')); }, timeout);
      const cleanup = () => { clearTimeout(timer); signal?.removeEventListener('abort', cancel); };
      pending.set(id, { resolve, reject, cleanup });
      signal?.addEventListener('abort', cancel, { once: true });
      try { getWorker().postMessage({ id, type, samples }); }
      catch (error) { cleanup(); pending.delete(id); reject(error); }
    });
  }
  global.BrowserSpeechRecognizer = {
    async prepare(onProgress) {
      progressListener = onProgress;
      if (!ready) {
        ready = request('prepare', null, null, 180000);
        ready.catch(() => { ready = null; });
      }
      await ready;
    },
    transcribe(samples, signal) { return request('transcribe', new Float32Array(samples), signal); }
  };
})(window);
