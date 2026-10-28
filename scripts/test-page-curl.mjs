import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const window={};vm.runInNewContext(fs.readFileSync(new URL('../page-curl.js',import.meta.url),'utf8'),{window});
const {segments,sample}=window.bookCurl;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≈ ${b}`);
const checks=[];
for(const length of [273,600,740])for(const reverse of [false,true])for(const vertical of [false,true]){
 for(const progress of [0,.12,.25,.5,.75,.88,1]){
  const poses=sample(progress,length,reverse,vertical),step=length/segments;
  assert.equal(poses.length,segments);
  for(const pose of poses){assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.z>=-1e-7);assert.ok(pose.shade>=-1e-7&&pose.shade<=.23);}
  for(let i=0;i<segments-1;i++){
   const a=poses[i],b=poses[i+1],theta=a.angle*Math.PI/180;
   if(!reverse){near((vertical?a.y:a.x)+Math.cos(theta)*step,vertical?b.y:b.x);near(a.z+(vertical?1:-1)*Math.sin(theta)*step,b.z);}
   else{const thetaB=b.angle*Math.PI/180;near((vertical?b.y:b.x)+Math.cos(thetaB)*step,vertical?a.y:a.x);near(b.z+(vertical?1:-1)*Math.sin(thetaB)*step,a.z);}
  }
 }
 const flatStart=sample(0,length,reverse,vertical),flatEnd=sample(1,length,reverse,vertical);
 flatStart.forEach(p=>{near(p.z,0);near(p.angle,0);near(p.shade,0);});flatEnd.forEach(p=>{near(p.z,0);near(Math.abs(p.angle),180);near(p.shade,0);});
}
checks.push('84 forward/reverse/horizontal/vertical curve states preserve connected material strips with no penetration');
const middle=sample(.5,600);assert.ok(Math.abs(middle[0].angle-middle.at(-1).angle)>100);assert.ok(middle.some(p=>p.z>200));checks.push('mid-turn sheet has a visibly curved profile and distinct panel normals');
const start=sample(0,600),end=sample(1,600),early=sample(.001,600),late=sample(.999,600);for(let i=0;i<segments;i++){assert.ok(Math.abs(early[i].x-start[i].x)<.01);assert.ok(Math.abs(late[i].x-end[i].x)<.01);assert.ok(Math.abs(early[i].z)<.01);assert.ok(Math.abs(late[i].z)<.01);}checks.push('lift-off and landing approach the flat page continuously');
near(sample(-1,600)[0].angle,0);near(Math.abs(sample(2,600)[0].angle),180);checks.push('progress clamps to stable start/end poses');
let maxGap=0;const frames=window.bookCurl.keyframes;
for(const length of [273,600,740])for(const reverse of [false,true])for(const vertical of [false,true])for(let frame=0;frame<frames;frame++){
 const a=sample(frame/frames,length,reverse,vertical),b=sample((frame+1)/frames,length,reverse,vertical);
 const poses=a.map((pose,i)=>Object.fromEntries(Object.keys(pose).map(key=>[key,(pose[key]+b[i][key])/2])));
 for(let i=0;i<segments-1;i++){
  const first=reverse?poses[i+1]:poses[i],second=reverse?poses[i]:poses[i+1],theta=first.angle*Math.PI/180;
  const dx=(vertical?first.y:first.x)+Math.cos(theta)*length/segments-(vertical?second.y:second.x),dz=first.z+(vertical?1:-1)*Math.sin(theta)*length/segments-second.z;
  maxGap=Math.max(maxGap,Math.hypot(dx,dz));
 }
}
assert.ok(maxGap<.35,`interpolated joint error ${maxGap} fits the .35px paint overlap`);checks.push('native keyframe interpolation keeps joint error within the seam overlap');
console.log(JSON.stringify({passed:checks.length,maxInterpolatedGap:maxGap,checks},null,2));
