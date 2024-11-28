let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext {
  if (audioContext) {
    return audioContext;
  }

  audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  return audioContext;
}

export function playSound(buffer: AudioBuffer) {
  const context = getAudioContext();
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

