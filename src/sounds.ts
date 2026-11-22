let context:AudioContext|null=null;
export function quizSound(correct:boolean){
 try{
  const AudioCtx=window.AudioContext;
  if(!AudioCtx)return;
  context??=new AudioCtx();
  const base=context.currentTime+.015;
  const sequence=correct?[[659.25,0],[783.99,.13],[1046.50,.26]]:[[349.23,0],[329.63,.18]];
  for(const [freq,delay] of sequence){
   const osc=context.createOscillator(),gain=context.createGain(),start=base+delay;
   osc.type=correct?'sine':'triangle';osc.frequency.setValueAtTime(freq,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.16,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+.19);osc.connect(gain);gain.connect(context.destination);osc.start(start);osc.stop(start+.21);
  }
 }catch{/* Audio is optional; never block question flow */}
}
