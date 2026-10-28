/* Original Maiat + Dojo figure: a quote card passes a mechanical approval stamp,
   then becomes an illustrated receipt. It never signs, approves or pays anything. */
const AGP={paper:{l:'#fff9e9',m:'#e6dbc5',d:'#c3b69c'},green:{l:'#739d7e',m:'#427657',d:'#24533d'},lilac:{l:'#b7a5cb',m:'#9381ad',d:'#66567d'},metal:{l:'#c5d0bf',m:'#9eae93',d:'#6e8467'},ink:{l:'#5d6c60',m:'#46584b',d:'#2b4033'}};
const agClamp=v=>Math.max(0,Math.min(1,v));
const agEase=v=>{const k=agClamp(v);return k*k*(3-2*k);};
function agPose(t){
 const arrival=agEase((t-.4)/1.8),exit=agEase((t-4.8)/2.2);
 const down=agEase((t-2.6)/.7),up=agEase((t-3.7)/.7);
 return {x:24+90*arrival+64*exit,stroke:24.8*down*(1-up),approved:t>=3.3};
}
function agScene(t,inventory=null){
 const parts=[],pose=agPose(t),items=[];
 const b=(name,x,y,z,w,d,h,m)=>{parts.push({name,x,y,z,w,d,h});items.push({at:[x+w/2,y+d/2,z+h/2],svg:box(x,y,z,x+w,y+d,z+h,m,toneI,.7)});};
 const c=(name,x,y,z0,z1,r,m)=>{parts.push({name,x:x-r,y:y-r,z:z0,w:r*2,d:r*2,h:z1-z0,shape:'cylinder'});items.push({at:[x,y,(z0+z1)/2],svg:cyl(x,y,z0,z1,r,m,toneI,.7,20)});};
 // Four feet meet the underside at z0; all other fixed parts contact the z6 top.
 let s='';for(const [x,y] of [[8,8],[196,8],[8,98],[196,98]]){parts.push({name:'platform foot',x,y,z:-6,w:12,d:12,h:6});s+=box(x,y,-6,x+12,y+12,0,AGP.ink,toneI,.7);}
 parts.push({name:'platform',x:0,y:0,z:0,w:216,d:118,h:6});s+=board(0,0,216,118,6,6,AGP.paper);
 b('quote bed',12,48,6,156,38,4,AGP.metal);
 b('receipt tray floor',168,48,6,44,38,4,AGP.metal);
 for(const y of [44,86])b('continuous card guide',12,y,6,200,4,8,AGP.green);
 for(const x of [12,208])b('track end stop',x,48,10,4,38,5,AGP.lilac);
 // The two feet support columns, which support the beam and forward cantilever.
 for(const x of [94,146])b('column mounting foot',x,26,6,16,20,4,AGP.metal);
 for(const x of [98,150])b('column',x,30,10,8,12,72,AGP.lilac);
 b('cross beam',98,30,82,60,12,8,AGP.lilac);
 b('stamp cantilever',122,42,82,12,30,6,AGP.lilac);
 c('telescoping ram',128,66,51-pose.stroke,82,4,AGP.metal);
 b('moving stamp head',110,50,42-pose.stroke,36,32,9,AGP.lilac);
 b('pad backing',110,50,39-pose.stroke,36,32,3,AGP.metal);
 b('rubber stamp face',110,50,36-pose.stroke,36,32,3,AGP.green);
 for(const [x,y] of [[115,55],[141,55],[115,77],[141,77]])c('head retaining screw',x,y,51-pose.stroke,52-pose.stroke,1.1,AGP.ink);
 for(const x of [97,107,149,159])for(const y of [29,43])c('mounting screw',x,y,10,10.6,.9,AGP.ink);
 for(const x of [20,65,115,200])for(const y of [46,88])c('guide retaining screw',x,y,14,14.6,.9,AGP.ink);
 // Three sheet edges stay together throughout translation; their top is z11.2.
 let paper='';for(let i=0;i<3;i++){parts.push({name:'quote card sheet',x:pose.x,y:54,z:10+i*.4,w:28,d:24,h:.4});paper+=box(pose.x,54,10+i*.4,pose.x+28,78,10+(i+1)*.4,AGP.paper,toneI,.5);}
 for(let i=0;i<3;i++)paper+=shape(on(PZ(11.25),rectUV(pose.x+5,59+i*4,pose.x+22,59.8+i*4)),i===0?'#66567d':'#9eae93',0);
 if(pose.approved){const x=pose.x+18;paper+=ink(pd([[x,72,11.3],[x+2,74,11.3],[x+7,68,11.3]]),1.3).replace(INK,'#427657');}
 items.push({at:[pose.x+14,66,11],svg:paper});
 // Indicators are fixed to the +x-facing column surface, not floating above it.
 for(let i=0;i<3;i++){parts.push({name:'column indicator',x:158,y:34,z:55+i*9,w:1,d:4,h:4,shape:'cylinder-x'});items.push({at:[158.5,36,57+i*9],svg:cylX(158,159,36,57+i*9,2,pose.approved&&i===2?AGP.green:AGP.metal,toneI,.6,16)});}
 s+=byDepth(items);
 for(const [x,label] of [[42,'QUOTE'],[128,'CONSENT'],[187,'RECEIPT']])s+=txY(x,118.1,2.7,label,3.3,'#46584b',700);
 if(inventory)inventory.push(...parts);
 return s.replaceAll(INK,'#293d38');
}
