/* Small, original synthesized soundscape. Audio starts only after a gesture. */
window.Sound = (() => {
  let ctx, master, enabled = true, timer, note = 0,region='village';
  const motifs={harbor:[60,67,69,64,62,67,64,60],heights:[62,65,69,72,69,65,64,62],refuge:[60,63,67,70,67,63,62,60],crossing:[57,60,64,67,64,60,59,57]};
  const melody = [60,64,67,71,69,67,64,62,60,64,67,72,71,67,64,62];
  function tone(freq, duration=.2, type='sine', volume=.08, delay=0) {
    if (!ctx || !enabled) return;
    const o=ctx.createOscillator(), g=ctx.createGain(), t=ctx.currentTime+delay;
    o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.018);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.02);
  }
  function start(){
    try {
      if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination);}
      ctx.resume().catch(()=>{});
      if(!timer)timer=setInterval(()=>{if(document.hidden)return;const notes=motifs[region]||melody,m=notes[note++%notes.length];tone(440*2**((m-69)/12),1.8,'sine',.035);if(note%4===0)tone(130.81,2.7,'triangle',.016);},850);
    }catch{/* Audio is optional. */}
  }
  return {start,suspend(){if(ctx)ctx.suspend().catch(()=>{});},resume(){if(ctx)ctx.resume().catch(()=>{});},ambience(id){region=id;if(id==='harbor'){tone(330,1.2,'sine',.012);tone(392,1.4,'sine',.008,.4);}if(id==='refuge')tone(196,2,'triangle',.012);},toggle(){enabled=!enabled;return enabled;},get enabled(){return enabled;},fx(name){
    if(name==='step')tone(115,.05,'triangle',.025);
    if(name==='hit'){tone(110,.11,'triangle',.13);tone(65,.15,'sine',.1);}
    if(name==='swing')tone(230,.09,'triangle',.055);
    if(name==='hurt')tone(92,.22,'sawtooth',.045);
    if(name==='pick'){tone(659,.25,'sine',.1);tone(880,.35,'sine',.08,.09);}
    if(name==='talk')tone(440,.07,'sine',.03);
    if(name==='win')[523,659,784,1046].forEach((f,i)=>tone(f,1.5,'sine',.08,i*.18));
  }};
})();
