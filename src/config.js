import {VEHICLES} from './catalogue.js';
export {VEHICLES};
export const COLORS = {
  black:{hex:'#23262c',name:'Onyx black'}, red:{hex:'#be3f36',name:'Racing red'},
  blue:{hex:'#68bddb',name:'Ice blue'}, cream:{hex:'#d5c5a4',name:'Warm ivory'},
  brown:{hex:'#9b6441',name:'Cognac'}, yellow:{hex:'#e9c650',name:'Signal yellow'}
};
export const LABELS = { rim:{carbon:'Twill carbon',forged:'Forged carbon',leather:'Smooth leather'}, grip:{leather:'Perforated leather',alcantara:'Alcantara'}, shape:{flat:'Flat bottom',round:'Round',yoke:'Yoke'} };
export const DEFAULT = Object.freeze({ brand:'BMW', model:'g20', year:2022, trim:'M340i', shape:'flat', rim:'carbon', grip:'alcantara', gripColor:'black', stitch:'blue', marker:'blue', led:true, paddles:true, heating:false });
export const PRESETS = {
  signature:{...DEFAULT,grip:'leather',stitch:'red',marker:'red',led:false,paddles:false},
  midnight:{...DEFAULT,rim:'forged',grip:'alcantara',stitch:'blue',marker:'blue',led:true,paddles:true},
  heritage:{...DEFAULT,rim:'carbon',grip:'alcantara',stitch:'blue',marker:'blue',led:true,paddles:true}
};
export function vehicle(c) { return VEHICLES[c.brand].find(v=>v.id===c.model); }
export function normalize(input={}) {
  const c={...DEFAULT};
  if(Object.hasOwn(VEHICLES,input.brand)) c.brand=input.brand;
  const v=VEHICLES[c.brand].find(v=>v.id===input.model)||VEHICLES[c.brand][0];
  c.model=v.id; c.year=Number.isInteger(input.year)&&input.year>=v.years[0]&&input.year<=v.years[1]?input.year:v.years[1];
  c.trim=v.trims.includes(input.trim)?input.trim:v.trims[0];
  for(const key of ['rim','grip','shape']) if(Object.hasOwn(LABELS[key],input[key])) c[key]=input[key];
  if(c.shape==='yoke'&&c.brand!=='Tesla')c.shape='flat';
  for(const key of ['gripColor','stitch','marker']) if(Object.hasOwn(COLORS,input[key])) c[key]=input[key];
  for(const key of ['led','paddles','heating']) c[key]=input[key]===true;
  if(!v.heating)c.heating=false;
  return c;
}
export function pricing(c) {
  return [
    {label:'Custom wheel base',amount:6490},
    {label:LABELS.rim[c.rim],amount:{carbon:2000,forged:2500,leather:0}[c.rim]},
    ...(c.grip==='alcantara'?[{label:'Alcantara grips',amount:500}]:[]),
    ...(c.led?[{label:'LED display',amount:1800}]:[]),
    ...(c.paddles?[{label:'Magnetic paddles',amount:900}]:[]),
    ...(c.heating?[{label:'Heating option',amount:700}]:[])
  ];
}
export const total=c=>pricing(c).reduce((sum,item)=>sum+item.amount,0);
export const money=amount=>'NOK '+new Intl.NumberFormat('en-US').format(amount);
export function rows(c) { return [
  ['Vehicle',`${c.brand} ${vehicle(c).label}`],['Year / trim',`${c.year} · ${c.trim}`],
  ['Shape',LABELS.shape[c.shape]],['Rim',LABELS.rim[c.rim]],
  ['Grips',`${COLORS[c.gripColor].name} · ${LABELS.grip[c.grip]}`],
  ['Stitching',COLORS[c.stitch].name],['Center marker',c.shape==='yoke'?'Not applicable':COLORS[c.marker].name],
  ['Upgrades',[c.led&&'LED',c.paddles&&'Magnetic paddles',c.heating&&'Heating'].filter(Boolean).join(' · ')||'None'],
  ['Demo estimate',money(total(c))]
]; }
export function encode(c){return btoa(JSON.stringify(normalize(c))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export function decode(value){
  if(!value||value.length>1600)return null;
  try {const data=JSON.parse(atob(value.replaceAll('-','+').replaceAll('_','/')));return data&&typeof data==='object'&&!Array.isArray(data)?normalize(data):null;}catch{return null;}
}
