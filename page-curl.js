/* A paper cross-section sampled by arc length; each panel keeps its material width. */
(() => {
  const segments=18;
  function sample(progress,length,reverse=false,vertical=false){
    const p=Math.max(0,Math.min(1,progress)),u=p*p*(3-2*p);
    const bend=1.15*Math.sin(Math.PI*u),step=length/segments;
    let along=0,lift=0;
    return Array.from({length:segments},(_,i)=>{
      // The outer edge leads the spine: a travelling bend, rather than one rigid plane.
      const radians=Math.max(0,Math.min(Math.PI,Math.PI*u+bend*(2*(i+.5)/segments-1)));
      const start=along,startLift=lift;
      along+=Math.cos(radians)*step;lift+=Math.sin(radians)*step;
      const position=reverse?-along:start,z=reverse?lift:startLift;
      return{x:vertical?0:position,y:vertical?position:0,z,angle:radians*180/Math.PI*(reverse?1:-1)*(vertical?-1:1),shade:Math.sin(Math.PI*u)*(.06+.16*Math.sin(radians))};
    });
  }
  window.bookCurl={segments,keyframes:48,sample};
})();
