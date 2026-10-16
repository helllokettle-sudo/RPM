import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {COLORS} from './config.js';
import {BRANDS} from './catalogue.js';

// Procedural concept geometry. Production replaces this with approved glTF assets.
const textureCache=new Map();
const viewers=new Set();
const productPhotos=new Map(),productRequests=new Set();
let lamborghiniBadge=null,badgeRequested=false;
function ensureBadge(){if(badgeRequested)return;badgeRequested=true;new THREE.TextureLoader().load('assets/lamborghini-badge.svg',t=>{t.colorSpace=THREE.SRGBColorSpace;lamborghiniBadge=t;for(const v of viewers)if(v.config.brand==='Lamborghini')v.update(v.config);},undefined,()=>{});}
const hubRegions={Mercedes:[438,489,386,386],Audi:[466,540,348,348],Volkswagen:[582,956,360,360],Porsche:[700,695,675,675],Tesla:[395,464,296,278],Toyota:[431,414,260,232],Nissan:[330,527,308,308]};
function ensureProduct(brand){if(!hubRegions[brand]||productRequests.has(brand))return;productRequests.add(brand);new THREE.TextureLoader().load(`assets/${BRANDS[brand].slug}-product.webp`,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;productPhotos.set(brand,t);for(const v of viewers)if(v.config.brand===brand)v.update(v.config);},undefined,()=>{});}
function productRegion(brand,x,y,w,h){const source=productPhotos.get(brand),t=source.clone(),iw=source.image.width,ih=source.image.height;t.offset.set(x/iw,1-(y+h)/ih);t.repeat.set(w/iw,h/ih);t.needsUpdate=true;return t;}
let bmwPhoto=null,photoRequested=false;
function ensurePhoto(){if(photoRequested)return;photoRequested=true;new THREE.TextureLoader().load('assets/wheel-cutout.webp',t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;bmwPhoto=t;for(const v of viewers)v.update(v.config);},undefined,()=>{});}
function photoRegion(x,y,w,h){const t=bmwPhoto.clone();t.offset.set(x/1254,1-(y+h)/1254);t.repeat.set(w/1254,h/1254);t.needsUpdate=true;return t;}
function photoControl(side){
  const region=side<0?[135,570,260,245]:[862,572,255,244];
  const map=photoRegion(...region),mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false});mat.userData.ownedMap=true;
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(.62,.584),mat);panel.position.set(side*.855,-.11,.207);return panel;
}
const controlRegions={Mercedes:[[234,598,180,117],[850,598,177,117]],Audi:[[256,636,172,98],[840,614,172,98]],Porsche:[[400,827,280,112],[1370,811,285,112]],Tesla:[[217,477,108,96],[726,477,108,96]],Nissan:[[185,614,131,83],[663,614,131,83]]};
function brandControl(brand,side){const map=productRegion(brand,...controlRegions[brand][side<0?0:1]),mat=new THREE.MeshBasicMaterial({map});mat.userData.ownedMap=true;const face=new THREE.Mesh(new THREE.PlaneGeometry(.53,.31),mat);face.position.set(side*.79,.04,.209);return face;}
const seeded=()=>{let n=747;return()=>{n=(n*16807)%2147483647;return(n-1)/2147483646;};};
function canvasTexture(key,draw,width=512,height=512){
  if(textureCache.has(key))return textureCache.get(key);
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  draw(canvas.getContext('2d'),512);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textureCache.set(key,t);return t;
}
function materialTexture(type){return canvasTexture(type,(ctx,s)=>{
  const random=seeded();
  if(type==='carbon'){
    ctx.fillStyle='#20232a';ctx.fillRect(0,0,s,s);
    for(let y=0;y<s;y+=16)for(let x=0;x<s;x+=16){const flip=((x/16+y/16)%4)<2;const g=ctx.createLinearGradient(x,y,x+(flip?16:0),y+(flip?0:16));g.addColorStop(0,'#16191e');g.addColorStop(.4,'#73777c');g.addColorStop(.55,'#40464e');g.addColorStop(1,'#1a1d24');ctx.fillStyle=g;ctx.fillRect(x,y,15,15);ctx.strokeStyle='#ffffff18';for(let k=3;k<16;k+=3){ctx.beginPath();ctx.moveTo(x+(flip?k:1),y+(flip?1:k));ctx.lineTo(x+(flip?k:14),y+(flip?14:k));ctx.stroke();}}
  }else if(type==='forged'){
    ctx.fillStyle='#171b20';ctx.fillRect(0,0,s,s);
    for(let i=0;i<1300;i++){const x=random()*s,y=random()*s,grey=40+Math.floor(random()*68);ctx.fillStyle=`rgb(${grey},${grey+2},${grey+5})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+random()*20,y+random()*7);ctx.lineTo(x+random()*12,y+5+random()*12);ctx.lineTo(x-5-random()*10,y+random()*14);ctx.fill();}
  }else{
    ctx.fillStyle=type==='alcantara'?'#929292':'#acacac';ctx.fillRect(0,0,s,s);
    for(let i=0;i<20000;i++){const g=Math.floor(80+random()*150);ctx.fillStyle=`rgb(${g},${g},${g})`;ctx.fillRect(random()*s,random()*s,1+random()*2,1);}
    if(type==='leather')for(let y=0;y<s;y+=28)for(let x=0;x<s;x+=28){ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x+(y%56?14:0),y,2.6,0,Math.PI*2);ctx.fill();}
  }
});}
const physical=(options)=>new THREE.MeshPhysicalMaterial(options);
function box(w,h,d,mat,x=0,y=0,z=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);return mesh;}
function roundedShape(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function plate(w,h,d,r,mat,x,y,z){const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,steps:1,curveSegments:10}),mat);mesh.position.set(x,y,z);return mesh;}
function textPlane(key,text,w,h,color='#f3f4f5',bg=null){const texture=canvasTexture(key,ctx=>{ctx.clearRect(0,0,512,512);if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,512);}ctx.fillStyle=color;ctx.font='600 120px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,256);});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:!bg,depthWrite:false}));return mesh;}
function ringPoint(angle,flat,r=1.23){let y=Math.sin(angle)*r;if(flat)y=Math.max(y,-1.09);return new THREE.Vector3(Math.cos(angle)*r,y,0);}
function curve(start,end,flat,r=1.23){const points=[];for(let i=0;i<=64;i++)points.push(ringPoint(start+(end-start)*i/64,flat,r));return new THREE.CatmullRomCurve3(points);}
const deg=d=>d*Math.PI/180;
function sculptedRim(start,end,flat,mat,grip=false){
  const path=curve(start,end,flat),positions=[],uv=[],indices=[],segments=120,sides=24;
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=path.getPoint(t),tangent=path.getTangent(t),n=new THREE.Vector3(tangent.y,-tangent.x,0).normalize();
    const thickness=grip ? .18+.016*Math.sin(t*Math.PI) : .169;
    for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,q=p.clone().addScaledVector(n,Math.cos(a)*thickness);q.z=Math.sin(a)*.143;positions.push(q.x,q.y,q.z);uv.push(t,j/sides);}
  }
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return new THREE.Mesh(g,mat);
}
function projectBMWPhoto(mesh){const position=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;for(let i=0;i<position.count;i++)uv.setXY(i,(625+position.getX(i)*425)/1254,(603+position.getY(i)*425)/1254);uv.needsUpdate=true;return mesh;}
function badgeTexture(brand){return canvasTexture(`badge-${brand}`,ctx=>{
  ctx.clearRect(0,0,512,512);ctx.strokeStyle='#d9dce2';ctx.fillStyle='#cdd1d8';ctx.lineWidth=17;ctx.textAlign='center';ctx.textBaseline='middle';
  const circle=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();};
  if(brand==='BMW'){
    ctx.fillStyle='#11151a';ctx.beginPath();ctx.arc(256,256,222,0,Math.PI*2);ctx.fill();circle(256,256,222);circle(256,256,151);
    for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#f4f4f0':'#2384c2';ctx.beginPath();ctx.moveTo(256,256);ctx.arc(256,256,141,i*Math.PI/2,(i+1)*Math.PI/2);ctx.fill();}
    ctx.fillStyle='#e8eaf0';ctx.font='bold 66px Arial';ctx.fillText('B',135,122);ctx.fillText('M',256,75);ctx.fillText('W',374,120);
  }else if(brand==='Mercedes'){
    circle(256,256,220);for(const a of [-Math.PI/2,Math.PI/6,5*Math.PI/6]){ctx.beginPath();ctx.moveTo(256,256);ctx.lineTo(256+207*Math.cos(a),256+207*Math.sin(a));ctx.lineTo(256+38*Math.cos(a+.75),256+38*Math.sin(a+.75));ctx.closePath();ctx.fill();}
  }else if(brand==='Audi'){ctx.lineWidth=20;for(let i=0;i<4;i++)circle(108+i*99,256,84);}
  else if(brand==='Volkswagen'){circle(256,256,220);ctx.lineWidth=28;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(160,107);ctx.lineTo(256,283);ctx.lineTo(352,107);ctx.moveTo(110,206);ctx.lineTo(174,394);ctx.lineTo(256,274);ctx.lineTo(338,394);ctx.lineTo(402,206);ctx.stroke();}
  else if(brand==='Toyota'){ctx.lineWidth=21;for(const [rx,ry,x,y] of [[221,150,256,256],[65,150,256,256],[161,62,256,195]]){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();}}
  else if(brand==='Nissan'){circle(256,256,213);ctx.fillStyle='#131820';ctx.fillRect(20,210,472,98);ctx.fillStyle='#e3e5e9';ctx.font='bold 86px Arial';ctx.fillText('NISSAN',256,260);}
  else if(brand==='Tesla'){ctx.fillStyle='#e7e9ed';ctx.beginPath();ctx.moveTo(50,87);ctx.quadraticCurveTo(256,17,462,87);ctx.lineTo(431,125);ctx.quadraticCurveTo(256,72,81,125);ctx.fill();ctx.beginPath();ctx.moveTo(133,135);ctx.quadraticCurveTo(256,101,379,135);ctx.lineTo(288,187);ctx.lineTo(256,448);ctx.lineTo(224,187);ctx.closePath();ctx.fill();}
  else{
    ctx.fillStyle=brand==='Porsche'?'#ad9255':'#11151b';ctx.strokeStyle='#c3a65a';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(71,63);ctx.quadraticCurveTo(256,16,441,63);ctx.lineTo(420,277);ctx.quadraticCurveTo(403,397,256,483);ctx.quadraticCurveTo(109,397,92,277);ctx.closePath();ctx.fill();ctx.stroke();
    if(brand==='Porsche'){ctx.fillStyle='#702f30';for(let i=0;i<3;i++){ctx.fillRect(101,160+i*57,95,25);ctx.fillRect(316,160+i*57,95,25);}ctx.fillStyle='#14181e';ctx.font='bold 44px Arial';ctx.fillText('PORSCHE',256,98);ctx.font='bold 162px Georgia';ctx.fillText('♞',256,285);}
    else{ctx.fillStyle='#c6ab67';ctx.font='bold 38px Arial';ctx.fillText('LAMBORGHINI',256,105);ctx.font='bold 168px Georgia';ctx.fillText('♉',256,280);}
  }
});}
function airbag(c,material){
  const brand=c.brand,n=brand==='Tesla'?4:brand==='Toyota'?3:2;
  const rx=brand==='Tesla' ? .55 : .535,ry=brand==='Tesla' ? .34 : brand==='Toyota' ? .45 : .535;
  const verts=[],uvs=[],indices=[],rings=24,sides=80;
  for(let i=0;i<=rings;i++)for(let j=0;j<=sides;j++){
    const r=i/rings,a=j/sides*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
    const x=Math.sign(ca)*Math.pow(Math.abs(ca),2/n)*rx*r,y=Math.sign(sa)*Math.pow(Math.abs(sa),2/n)*ry*r;
    verts.push(x,y-.08,.17+.115*(1-r*r));uvs.push(x/(2*rx)+.5,y/(2*ry)+.5);
  }
  for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
  let m=material;
  if(productPhotos.has(brand)){
    const map=productRegion(brand,...hubRegions[brand]);m=new THREE.MeshBasicMaterial({map});m.userData.ownedMap=true;
    m.onBeforeCompile=shader=>{shader.uniforms.rpmThread={value:new THREE.Color(COLORS[c.stitch].hex)};shader.uniforms.rpmCropOffset={value:map.offset};shader.uniforms.rpmCropRepeat={value:map.repeat};shader.fragmentShader='uniform vec3 rpmThread;\nuniform vec2 rpmCropOffset;\nuniform vec2 rpmCropRepeat;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      vec2 localUv=(vMapUv-rpmCropOffset)/rpmCropRepeat;
      float edge=distance(localUv,vec2(0.5));
      if(edge>0.32 && edge<0.49 && diffuseColor.r>diffuseColor.g*2.2 && diffuseColor.r>diffuseColor.b*1.8) diffuseColor.rgb=rpmThread*(0.7+diffuseColor.r*0.65);
    `);};
  }
  if(brand==='BMW'&&bmwPhoto){
    const map=photoRegion(391,410,450,450);m=new THREE.MeshBasicMaterial({map});m.userData.ownedMap=true;
    m.onBeforeCompile=shader=>{shader.uniforms.rpmThread={value:new THREE.Color(COLORS[c.stitch].hex)};shader.fragmentShader='uniform vec3 rpmThread;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
      float edge=distance(vMapUv,vec2(0.491,0.493));
      bool colorThread=(diffuseColor.b>diffuseColor.r*1.4 && diffuseColor.b>diffuseColor.g*1.12)||(diffuseColor.r>diffuseColor.g*1.5 && diffuseColor.r>diffuseColor.b*1.2);
      if(edge>0.137 && edge<0.179 && colorThread) diffuseColor.rgb=rpmThread*(0.7+max(diffuseColor.r,diffuseColor.b)*0.65);
    `);};
  }
  return new THREE.Mesh(g,m);
}
function wheel(c){
  const group=new THREE.Group(),flat=c.shape!=='round',yoke=c.shape==='yoke';
  const carbon=physical({color:'#979da3',map:materialTexture(c.rim==='forged'?'forged':'carbon'),metalness:.08,roughness:.42,clearcoat:.45,clearcoatRoughness:.25});
  const leather=physical({color:COLORS[c.gripColor].hex,roughness:c.grip==='alcantara'?.93:.65,bumpMap:materialTexture(c.grip),bumpScale:c.grip==='alcantara'?.006:.01,metalness:.02});
  const rimLeather=physical({color:'#1c2027',roughness:.68,bumpMap:materialTexture('leather'),bumpScale:.018});
  const dark=physical({color:'#090c11',roughness:.84,bumpMap:materialTexture('alcantara'),bumpScale:.014});
  const metal=physical({color:'#9097a0',metalness:1,roughness:.32});
  const black=physical({color:'#0e131a',roughness:.4,metalness:.3});
  const lightMetal=physical({color:'#b9bec6',metalness:1,roughness:.28});
  const rimMat=c.rim==='leather'?rimLeather:carbon;
  const photographRim=c.brand==='BMW'&&bmwPhoto&&flat&&c.rim==='carbon';
  const photographGrip=photographRim&&c.grip==='alcantara'&&c.gripColor==='black';
  const photoMat=(photographRim||photographGrip)?new THREE.MeshBasicMaterial({map:bmwPhoto,transparent:true,alphaTest:.08}):null;
  if(photoMat)photoMat.onBeforeCompile=shader=>{shader.uniforms.rpmThread={value:new THREE.Color(COLORS[c.stitch].hex)};shader.uniforms.rpmMarker={value:new THREE.Color(COLORS[c.marker].hex)};shader.fragmentShader='uniform vec3 rpmThread;\nuniform vec3 rpmMarker;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    bool colored=(diffuseColor.b>diffuseColor.r*1.5 && diffuseColor.b>diffuseColor.g*1.2)||(diffuseColor.r>diffuseColor.g*1.8 && diffuseColor.r>diffuseColor.b*1.3);
    if(colored && abs(vMapUv.x-0.498)>0.12 && vMapUv.y<0.82) diffuseColor.rgb=rpmThread*(0.7+max(diffuseColor.r,diffuseColor.b)*0.65);
    if(colored && abs(vMapUv.x-0.498)<0.016 && vMapUv.y>0.83 && vMapUv.y<0.9) diffuseColor.rgb=rpmMarker;
  `);};
  (yoke?[[-45,18,leather],[162,225,leather],[225,315,rimMat]]:[[-45,45,leather],[45,135,rimMat],[135,225,leather],[225,315,rimMat]]).forEach(([a,b,mat])=>{const isGrip=mat===leather,usePhoto=isGrip?photographGrip:photographRim;const mesh=sculptedRim(deg(a),deg(b),flat,usePhoto?photoMat:mat,isGrip);group.add(usePhoto?projectBMWPhoto(mesh):mesh);});
  if(!yoke&&!photographGrip)for(const side of [-1,1]){const thumb=new THREE.Mesh(new THREE.SphereGeometry(.19,32,20),leather);thumb.scale.set(.64,1.05,.7);thumb.position.set(side*.99,.64,.015);thumb.rotation.z=side*.35;group.add(thumb);}
  // Inner seam. Each stitch is actual geometry and follows the selected profile.
  const stitches=[];
  for(let i=0;i<142;i++){const a=i/142*Math.PI*2;if(yoke&&a>deg(18)&&a<deg(162))continue;const p=ringPoint(a,flat,1.23);const tangent=ringPoint(a+.009,flat,1.23).sub(p).normalize();const inner=new THREE.Vector3(-Math.cos(a),-Math.sin(a),0).multiplyScalar(.1);p.add(inner);p.z=.168;const q=p.clone().add(tangent.multiplyScalar(.022)).add(new THREE.Vector3(Math.cos(a)*.045,Math.sin(a)*.045,.006));stitches.push(p.x,p.y,p.z,q.x,q.y,q.z);}
  const seamGeo=new THREE.BufferGeometry();seamGeo.setAttribute('position',new THREE.Float32BufferAttribute(stitches,3));group.add(new THREE.LineSegments(seamGeo,new THREE.LineBasicMaterial({color:COLORS[c.stitch].hex})));
  const marker=new THREE.Mesh(new THREE.TubeGeometry(curve(deg(87.5),deg(92.5),flat),10,.171,16,false),physical({color:COLORS[c.marker].hex,roughness:.45}));if(!yoke)group.add(marker);
  // Three spokes and the airbag carrier.
  const spoke=(points,mat,z,depth=.11)=>{const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.018,bevelThickness:.02,bevelSegments:2}),mat);mesh.position.z=z;group.add(mesh);return mesh;};
  spoke([[-1.15,.15],[-.32,.10],[-.3,-.25],[-1.08,-.20]],rimMat,-.08);
  spoke([[1.15,.15],[.32,.10],[.3,-.25],[1.08,-.20]],rimMat,-.08);
  spoke([[-.24,-.23],[.24,-.23],[.17,flat?-1.09:-1.15],[-.17,flat?-1.09:-1.15]],metal,-.09);
  spoke([[-.17,-.28],[.17,-.28],[.10,flat?-1.07:-1.13],[-.10,flat?-1.07:-1.13]],rimMat,.025,.065);
  const photoControls=c.brand==='BMW'&&bmwPhoto;
  if(!photoControls){group.add(plate(.59,.32,.1,.07,black,-.78,.055,.035));group.add(plate(.59,.32,.1,.07,black,.78,.055,.035));}
  const buttons=[['◀','▶'],['+','−']];
  if(photoControls){group.add(photoControl(-1),photoControl(1));}
  else if(productPhotos.has(c.brand)&&controlRegions[c.brand]){group.add(brandControl(c.brand,-1),brandControl(c.brand,1));}
  else for(const side of [-1,1])for(let r=0;r<2;r++)for(let col=0;col<2;col++){
    const x=side*.79+(col-.5)*.21,y=.12-r*.13;
    group.add(plate(.18,.095,.015,.022,dark,x,y,.157));const label=textPlane(`button-${side}-${r}-${col}`,side===-1?buttons[r][col]:[['MODE','OK'],['+','−']][r][col],.145,.09,'#b4b9c1');label.position.set(x,y,.197);group.add(label);
  }
  group.add(airbag(c,dark));
  if(!(c.brand==='BMW'&&bmwPhoto)&&!productPhotos.has(c.brand)){
    const logo=new THREE.Mesh(new THREE.PlaneGeometry(c.brand==='Audi' ? .36 : .29,c.brand==='Audi' ? .15 : .29),new THREE.MeshBasicMaterial({map:c.brand==='Lamborghini'&&lamborghiniBadge?lamborghiniBadge:badgeTexture(c.brand),transparent:true,depthWrite:false}));logo.position.set(0,-.07,.289);group.add(logo);
    const label=textPlane('airbag-label','AIRBAG',.21,.045,'#59616a');label.position.set(0,-.40,.228);group.add(label);
  }
  if(photoControls){const map=photoRegion(495,852,254,337),mat=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false});mat.userData.ownedMap=true;const trim=new THREE.Mesh(new THREE.PlaneGeometry(.60,.795),mat);trim.position.set(0,-.87,.151);group.add(trim);}
  else{const m=textPlane('m-trim','///',.17,.1,COLORS[c.stitch].hex);m.position.set(0,-.76,.133);group.add(m);}
  if(c.paddles){const paddleMat=physical({color:'#30343b',map:materialTexture(c.rim==='forged'?'forged':'carbon'),roughness:.58,metalness:.08,clearcoat:.25});for(const side of [-1,1]){const paddle=plate(.22,.82,.065,.05,paddleMat,side*.91,.2,-.28);paddle.rotation.z=-side*.13;group.add(paddle);const sign=textPlane(`paddle-${side}`,side<0?'−':'+',.12,.14);sign.position.set(side*.94,.46,-.18);group.add(sign);}}
  if(c.led){
    const top=yoke?.46:1.24;
    group.add(plate(.81,.18,.105,.05,black,0,top,.03));
    for(let i=0;i<10;i++){const color=i<4?'#46dd98':i<7?'#efd856':'#fa594c';group.add(box(.045,.029,.016,new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.6}),-.31+i*.069,top+.047,.171));}
    const digits=textPlane('rpm-digits','3200',.28,.08,'#87dcff');digits.position.set(0,top-.03,.17);group.add(digits);
  }
  return group;
}
function disposeObject(object){object.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.ownedMap)m.map?.dispose();m.dispose();}}});}

export class WheelViewer{
  constructor(host,{config,hero=false,mode='studio'}){
    this.host=host;this.hero=hero;this.config=config;this.mode=mode;this.night=false;
    if(config.brand==='BMW')ensurePhoto();else ensureProduct(config.brand);if(config.brand==='Lamborghini')ensureBadge();
    this.backplate=document.createElement('img');this.backplate.className='cockpit-backplate';this.backplate.alt='';this.backplate.setAttribute('aria-hidden','true');host.append(this.backplate);
    this.backplate.addEventListener('load',()=>{this.backplate.classList.add('loaded');this.render();});
    this.updateBackplate();
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(40,1,.1,60);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;
    this.renderer.domElement.setAttribute('aria-hidden','true');host.append(this.renderer.domElement);
    const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();
    this.env=pmrem.fromScene(room,.04);this.scene.environment=this.env.texture;this.scene.environmentIntensity=.6;pmrem.dispose();room.dispose();
    this.scene.add(new THREE.HemisphereLight('#e5efff','#171b26',.7));
    this.key=new THREE.DirectionalLight('#ffffff',3);this.key.position.set(-3,5,5);this.scene.add(this.key);
    this.fill=new THREE.DirectionalLight('#8cbbff',1.1);this.fill.position.set(4,1,2);this.scene.add(this.fill);
    this.rimLight=new THREE.DirectionalLight('#ffab7d',1.3);this.rimLight.position.set(-3,-1,-3);this.scene.add(this.rimLight);
    this.model=wheel(config);this.scene.add(this.model);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enablePan=false;this.controls.enableDamping=false;this.controls.rotateSpeed=.55;this.controls.zoomSpeed=.7;
    this.controls.addEventListener('change',()=>this.render());
    this.host.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();if(['+','-','='].includes(e.key))this.zoom(e.key==='-'?1.1:.9);else this.turn(e.key);}});
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);
    this.setView(mode);this.resize();
    viewers.add(this);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.parentElement.classList.add('viewer-failed');if(!host.querySelector('.fallback'))host.insertAdjacentHTML('beforeend','<div class="fallback"><p>3D preview paused. Reload to restore it. Your saved build is retained.</p></div>');});
    this.renderer.domElement.addEventListener('webglcontextrestored',()=>{host.querySelector('.fallback')?.remove();host.parentElement.classList.remove('viewer-failed');this.render();});
  }
  update(config){this.config=config;if(config.brand==='BMW')ensurePhoto();else ensureProduct(config.brand);if(config.brand==='Lamborghini')ensureBadge();this.updateBackplate();this.scene.remove(this.model);disposeObject(this.model);this.model=wheel(config);this.scene.add(this.model);this.render();}
  updateBackplate(){const b=BRANDS[this.config.brand];if(this.photoBrand!==b.slug){this.photoBrand=b.slug;this.backplate.classList.remove('loaded');this.backplate.src=`assets/${b.slug}.webp`;}}
  matchBackplate(){
    if(this.mode!=='driver'){this.camera.clearViewOffset();return;}
    const w=this.host.offsetWidth,h=this.host.offsetHeight;if(!w||!h)return;
    const [u,v]=BRANDS[this.config.brand].mount,iw=this.backplate.naturalWidth||1536,ih=this.backplate.naturalHeight||1024,scale=Math.max(w/iw,h/ih),rw=iw*scale,rh=ih*scale;
    // Keep the wheel mount centered when a portrait viewport crops the cabin.
    const cropX=rw>w?THREE.MathUtils.clamp((u*rw-w*.5)/(rw-w),0,1):.5;
    this.backplate.style.objectPosition=`${cropX*100}% 50%`;
    const x=(u*rw-(rw-w)*cropX)/w,y=(v*rh-(rh-h)/2)/h;
    this.camera.setViewOffset(w,h,w*(.5-x),h*(.5-y+.015),w,h);
    this.backplate.style.transformOrigin=`${x*100}% ${y*100}%`;
    this.backplate.style.transform=`scale(${Math.max(1,this.baseDistance/this.camera.position.distanceTo(this.controls.target))})`;
  }
  setView(mode){
    this.mode=mode;
    this.host.classList.toggle('mode-driver',mode==='driver');
    if(mode==='driver'){
      this.baseDistance=Math.max(5.4,4.5/(this.host.offsetWidth/this.host.offsetHeight||1));
      this.camera.fov=43;this.controls.target.set(0,0,0);this.camera.position.set(0,.1,this.baseDistance);
      this.controls.minDistance=this.baseDistance*.85;this.controls.maxDistance=this.baseDistance*1.19;this.controls.minAzimuthAngle=-.18;this.controls.maxAzimuthAngle=.18;this.controls.minPolarAngle=1.35;this.controls.maxPolarAngle=1.8;
    }else{
      this.camera.fov=40;this.controls.target.set(0,0,0);this.camera.position.set(this.hero ? .8 : .4,this.hero ? .34 : .18,this.hero ? 5.1 : 5.25);
      this.controls.minDistance=3.9;this.controls.maxDistance=8;this.controls.minAzimuthAngle=-Infinity;this.controls.maxAzimuthAngle=Infinity;this.controls.minPolarAngle=.35;this.controls.maxPolarAngle=2.7;
    }
    this.camera.updateProjectionMatrix();this.controls.update();this.setNight(this.night);this.render();
  }
  setNight(night){this.night=night;this.host.classList.toggle('night-lighting',night);this.renderer.toneMappingExposure=night ? .65 : 1;this.key.intensity=night ? .75 : 3;this.fill.intensity=night?1.5:1.1;this.key.color.set(night?'#8bb1e8':'#ffffff');this.render();}
  zoom(factor){const offset=this.camera.position.clone().sub(this.controls.target);const distance=THREE.MathUtils.clamp(offset.length()*factor,this.controls.minDistance,this.controls.maxDistance);this.camera.position.copy(this.controls.target).add(offset.setLength(distance));this.controls.update();this.render();}
  turn(key='ArrowRight'){
    const spherical=new THREE.Spherical().setFromVector3(this.camera.position.clone().sub(this.controls.target));
    if(key==='ArrowRight'||key==='ArrowLeft')spherical.theta+=key==='ArrowRight'?.22:-.22;
    else spherical.phi+=key==='ArrowUp'?-.12:.12;
    spherical.theta=THREE.MathUtils.clamp(spherical.theta,this.controls.minAzimuthAngle,this.controls.maxAzimuthAngle);spherical.phi=THREE.MathUtils.clamp(spherical.phi,this.controls.minPolarAngle,this.controls.maxPolarAngle);
    this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(spherical));this.controls.update();this.render();
  }
  resize(){const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;if(this.mode==='driver'){const base=Math.max(5.4,4.5/this.camera.aspect),offset=this.camera.position.clone().sub(this.controls.target);this.camera.position.copy(this.controls.target).add(offset.multiplyScalar(base/this.baseDistance));this.baseDistance=base;this.controls.minDistance=base*.85;this.controls.maxDistance=base*1.19;}this.camera.updateProjectionMatrix();this.render();}
  render(){if(this.host.offsetWidth&&this.host.offsetHeight){this.matchBackplate();this.renderer.render(this.scene,this.camera);}}
  dispose(){viewers.delete(this);this.resizeObserver.disconnect();this.controls.dispose();disposeObject(this.model);this.env.dispose();this.renderer.dispose();this.renderer.domElement.remove();this.backplate.remove();}
}
