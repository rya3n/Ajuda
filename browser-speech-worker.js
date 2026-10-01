// O áudio permanece no navegador. A rede é usada somente para baixar o modelo.
let recognizerPromise;
async function prepare() {
  if (!recognizerPromise) {
    recognizerPromise = (async () => {
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      env.allowLocalModels = false;
      env.backends.onnx.wasm.numThreads = 1;
      env.backends.onnx.wasm.proxy = false;
      return pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
        device: 'wasm', dtype: 'q8',
        progress_callback: progress => {
          if (progress.status === 'progress') self.postMessage({ type: 'progress', progress: Math.round(progress.progress || 0) });
        }
      });
    })();
    recognizerPromise.catch(() => { recognizerPromise = null; });
  }
  return recognizerPromise;
}
let queue = Promise.resolve();
self.onmessage = event => {
  const { id, type, samples } = event.data;
  queue = queue.then(async () => {
    try {
      const recognizer = await prepare();
      if (type === 'prepare') { self.postMessage({ id, text: '', ready: true }); return; }
      let energy = 0;
      for (const sample of samples) energy += sample * sample;
      if (!samples.length || Math.sqrt(energy / samples.length) < .001) { self.postMessage({ id, text: '' }); return; }
      const result = await recognizer(samples, { language: 'portuguese', task: 'transcribe', return_timestamps: false });
      self.postMessage({ id, text: result.text.trim() });
    } catch (_) { self.postMessage({ id, error: 'Não foi possível preparar ou reconhecer a voz neste navegador.' }); }
  });
};
