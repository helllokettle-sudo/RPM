import {VEHICLES,COLORS,LABELS,DEFAULT,PRESETS,vehicle,normalize,pricing,total,money,rows,encode,decode} from './config.js';
import {BRANDS,VEHICLE_COUNT} from './catalogue.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
$('.skip-link').addEventListener('click',e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView();});
let config={...DEFAULT},step=0,view='driver',night=false,hero,viewer,viewerModule,toastTimer;
let saved=null;
try {const raw=JSON.parse(localStorage.getItem('rpm-build-v1'));if(raw&&typeof raw==='object')saved=normalize(raw);}catch{}
const notify=message=>{clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);};
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const summary=c=>rows(c).map(([label,value])=>`<div class="review-row"><span>${label}</span><strong>${escape(value)}</strong></div>`).join('');
const pressed=(a,b)=>a===b?'true':'false';
const options=(items,selected)=>items.map(i=>`<option value="${escape(typeof i==='object'?i.id:i)}" ${selected===(typeof i==='object'?i.id:i)?'selected':''}>${escape(typeof i==='object'?i.label:i)}</option>`).join('');
function choices(key,values){return values.map(([id,label,chip])=>`<button class="option-card" data-choice="${key}" data-value="${id}" aria-pressed="${pressed(config[key],id)}">${chip?`<span class="material-chip ${chip}" aria-hidden="true"></span>`:''}${label}</button>`).join('');}
function swatches(key,ids){return ids.map(id=>`<button class="swatch" style="--swatch:${COLORS[id].hex};--tick:${['cream','yellow','blue'].includes(id)?'#15212c':'#fff'}" data-choice="${key}" data-value="${id}" aria-label="${key==='gripColor'?'Grip':key==='marker'?'Center marker':'Stitching'}: ${COLORS[id].name}" title="${COLORS[id].name}" aria-pressed="${pressed(config[key],id)}"></button>`).join('');}
function renderPanel(){
  const v=vehicle(config),content=$('#options-content');
  if(step===0){content.innerHTML=`<h2 class="step-title">Start with your car.</h2><p class="step-intro">9 brands. ${VEHICLE_COUNT} model & generation choices.</p><label class="field-label" for="car-brand">MAKE</label><select id="car-brand" data-field="brand">${options(Object.entries(BRANDS).map(([id,b])=>({id,label:b.label})),config.brand)}</select><label class="field-label" for="car-model">MODEL / GENERATION</label><select id="car-model" data-field="model">${options(VEHICLES[config.brand],config.model)}</select><div class="field-grid"><div><label class="field-label" for="car-year">YEAR</label><select id="car-year" data-field="year">${options(Array.from({length:v.years[1]-v.years[0]+1},(_,i)=>v.years[1]-i),config.year)}</select></div><div><label class="field-label" for="car-trim">TRIM</label><select id="car-trim" data-field="trim">${options(v.trims,config.trim)}</select></div></div><p class="fitment-note"><span>ⓘ</span>Based on RPM’s published platform families. Exact year, airbag, controls and upgrades require a fitment review.</p>`;}
  if(step===1){content.innerHTML=`<h2 class="step-title">Find your finish.</h2><p class="step-intro">A statement in every curve and texture.</p><div class="option-heading">WHEEL SHAPE</div><div class="option-grid two">${choices('shape',config.brand==='Tesla'?[['flat','Flat bottom'],['round','Round'],['yoke','Yoke']]:[['flat','Flat bottom'],['round','Round']])}</div><div class="option-heading">RIM FINISH</div><div class="option-grid">${choices('rim',[['carbon','Twill carbon','carbon'],['forged','Forged carbon','forged'],['leather','Leather','leather']])}</div><div class="option-heading">GRIP MATERIAL</div><div class="option-grid two">${choices('grip',[['leather','Perforated leather','leather'],['alcantara','Alcantara','alcantara']])}</div><div class="option-heading">GRIP COLOR <span>${COLORS[config.gripColor].name}</span></div><div class="swatches">${swatches('gripColor',['black','brown','red','cream'])}</div>`;}
  if(step===2){content.innerHTML=`<h2 class="step-title">The personal details.</h2><p class="step-intro">Small touches. A different kind of drive.</p><div class="option-heading">STITCHING <span>${COLORS[config.stitch].name}</span></div><div class="swatches">${swatches('stitch',['red','blue','cream','yellow','black'])}</div>${config.shape==='yoke'?'<p class="fitment-note">The open yoke has no center stripe.</p>':`<div class="option-heading">CENTER MARKER <span>${COLORS[config.marker].name}</span></div><div class="swatches">${swatches('marker',['red','blue','cream','yellow','black'])}</div>`}${[['led','LED shift display','Adds an illuminated display · + NOK 1,800'],['paddles','Magnetic paddles','Extended paddle design · + NOK 900'],['heating','Heated wheel',v.heating?'Specification only; no visual change · + NOK 700':'Unavailable for this demo platform']].map(([key,label,description])=>`<div class="toggle-row"><div><strong>${label}</strong><small>${description}</small></div><label class="toggle"><input type="checkbox" data-field="${key}" aria-label="${label}" ${config[key]?'checked':''} ${key==='heating'&&!v.heating?'disabled':''}><span aria-hidden="true"></span></label></div>`).join('')}`;}
  if(step===3){content.innerHTML=`<h2 class="step-title">Your signature build.</h2><p class="step-intro">Take a final look. Make every detail count.</p>${summary(config)}<details class="price-breakdown"><summary>See demo price breakdown</summary>${pricing(config).map(i=>`<div class="review-row"><span>${i.label}</span><strong>${money(i.amount)}</strong></div>`).join('')}</details><p class="review-hint">The wheel is a 3D concept; photographic interiors represent each brand. All compatibility, materials and prices require RPM Customs approval.</p><button class="review-edit" data-edit>← Refine your design</button>`;}
  $$('.step-tabs button').forEach((b,i)=>{b.setAttribute('aria-selected',i===step);b.tabIndex=i===step?0:-1;});
  content.setAttribute('aria-labelledby',`tab-${step}`);
  $('#next-step').innerHTML=step<3?`Next: ${['','Design','Details','Review'][step+1]} <span>→</span>`:'Save my build <span>↗</span>';
}
function update(){
  $('#build-price').textContent=money(total(config));
  $('#viewer-model').textContent=`${config.brand.toUpperCase()} / ${vehicle(config).id.toUpperCase()}`;
  $('#viewer-build').textContent=config.rim==='carbon'?'Signature Carbon':config.rim==='forged'?'Midnight Forged':'Heritage Leather';
  $('#spec-car').textContent=`${config.brand} ${vehicle(config).label}`;
  $('#spec-rim').textContent=LABELS.rim[config.rim];$('#spec-grip').textContent=LABELS.grip[config.grip];$('#spec-stitch').textContent=COLORS[config.stitch].name;
  $('#scene-disclaimer').textContent=view==='driver'?`Photo-based ${BRANDS[config.brand].interior} concept · Representative interior`:'Interactive 3D concept wheel · Final fitment requires review';
  viewer?.update(config);renderPanel();
}
async function makeViewer(host,settings){
  try {viewerModule ||= import('./viewer.js');const {WheelViewer}=await viewerModule;return new WheelViewer(host,settings);}
  catch(error){console.error('3D viewer unavailable',error);host.innerHTML='<div class="fallback"><img src="assets/wheel-cutout.webp" alt="RPM Customs wheel photograph — static fallback"><p>3D is unavailable on this browser. Configuration and saving still work.</p></div>';host.parentElement.classList.add('viewer-failed');notify('3D unavailable. Try a browser with WebGL enabled.');return null;}
}
async function route(){
  const hash=location.hash.slice(1),isBuild=hash.startsWith('build');
  $('#home-page').hidden=isBuild;$('#build-page').hidden=!isBuild;
  if(isBuild){
    const incoming=new URLSearchParams(hash.split('?')[1]||'').get('c');
    if(incoming){const decoded=decode(incoming);if(decoded){config=decoded;notify('Shared build loaded.');}else notify('This build link is invalid. Showing your current design.');}
    update();if(!viewer){viewer=await makeViewer($('#build-viewer'),{config,mode:view});viewer?.setNight(night);}else viewer.resize();
    document.title='Build your wheel — RPM Customs';
  }else{document.title='RPM Customs — Design your drive';hero?.resize();}
  if(!['collection','process','main'].includes(hash)) window.scrollTo({top:0,behavior:'instant'});
  else requestAnimationFrame(()=>$(`#${hash}`)?.scrollIntoView());
}
function startBuild(){if(location.hash==='#build'){$('#build-page').hidden=false;update();}else location.hash='build';}
function change(key,value){
  if(key==='brand')config=normalize({...config,brand:value,model:null,year:config.year,trim:null});
  else if(key==='model')config=normalize({...config,model:value,trim:null});
  else config=normalize({...config,[key]:value});
  update();
}
$('#options-content').addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(b){const key=b.dataset.choice,id=b.dataset.value;change(key,id);const next=$(`[data-choice="${key}"][data-value="${id}"]`);next?.focus({preventScroll:true});}if(e.target.closest('[data-edit]')){step=1;renderPanel();}});
$('#options-content').addEventListener('change',e=>{const el=e.target,key=el.dataset.field;if(key){change(key,el.type==='checkbox'?el.checked:key==='year'?Number(el.value):el.value);$(`[data-field="${key}"]`)?.focus({preventScroll:true});}});
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);renderPanel();}));
$('.step-tabs').addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();step=e.key==='Home'?0:e.key==='End'?3:(step+(e.key==='ArrowRight'?1:3))%4;renderPanel();$(`#tab-${step}`).focus();}});
$('#next-step').addEventListener('click',()=>{if(step<3){step++;renderPanel();$('#options-content').scrollTop=0;if(innerWidth<761) $('.config-panel').scrollIntoView({block:'start'});}else saveBuild();});
function saveBuild(){
  saved={...config};let persisted=true;try{localStorage.setItem('rpm-build-v1',JSON.stringify(saved));}catch{persisted=false;}
  $('.save-count').textContent='1';$('#dialog-summary').innerHTML=summary(saved);
  $('.dialog-intro').textContent=persisted?'Your configuration is saved on this device. Download a copy to show RPM Customs.':'Your configuration is ready. Download a copy to keep it; browser storage is unavailable.';
  $('#build-dialog').showModal();
}
$('.save-count').textContent=saved?'1':'0';
$('#saved-build').addEventListener('click',()=>{if(!saved){notify('Design your wheel, then save it in the Review step.');startBuild();return;}$('#dialog-summary').innerHTML=summary(saved);$('#build-dialog').showModal();});
$('.dialog-close').addEventListener('click',()=>$('#build-dialog').close());
$('#build-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#edit-build').addEventListener('click',()=>{$('#build-dialog').close();if(saved)config={...saved};step=3;startBuild();});
$('#download-build').addEventListener('click',()=>{const c=saved||config,payload={project:'RPM Customs design prototype',version:1,configuration:c,specification:Object.fromEntries(rows(c)),demoPriceBreakdown:pricing(c),notice:'Illustrative geometry and pricing. No order or quote submitted. Fitment requires RPM Customs approval.',createdAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RPM-${c.brand}-${c.model}-build.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notify('Your build file is downloaded.');});
$('#reset-build').addEventListener('click',()=>{config={...DEFAULT};step=0;update();notify('Configuration reset. Your saved build is retained.');});
$('#share-build').addEventListener('click',async()=>{const url=new URL(location.href);url.hash=`build?c=${encode(config)}`;$('.share-panel').hidden=false;$('#share-url').value=url.href;try{await navigator.clipboard.writeText(url.href);notify('Build link copied.');}catch{$('#share-url').focus();$('#share-url').select();notify('Select and copy your build link below the preview.');}});
function changeView(next){view=next;$('#preview-stage').classList.toggle('driver-view',view==='driver');$$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.view===view));viewer?.setView(view);$('#interaction-hint').textContent=view==='driver'?'Drag wheel to inspect · Scroll to zoom':'Drag to rotate · Scroll to zoom';$('#scene-disclaimer').textContent=view==='driver'?`Photo-based ${BRANDS[config.brand].interior} concept · Representative interior`:'Interactive 3D concept wheel · Final fitment requires review';}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>changeView(b.dataset.view)));
$('#lighting').addEventListener('click',()=>{night=!night;viewer?.setNight(night);$('#lighting').innerHTML=night?'☾ <span>Night</span>':'☀ <span>Day</span>';$('#lighting').setAttribute('aria-label',`Switch to ${night?'day':'night'} lighting`);});
function expandPreview(expanded){$('#preview-stage').classList.toggle('expanded',expanded);$('#fullscreen').setAttribute('aria-expanded',expanded);document.body.style.overflow=expanded?'hidden':'';viewer?.resize();if(expanded)$('#close-preview').focus();else $('#fullscreen').focus({preventScroll:true});}
$('#fullscreen').addEventListener('click',()=>expandPreview(!$('#preview-stage').classList.contains('expanded')));
$('#close-preview').addEventListener('click',()=>expandPreview(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#preview-stage').classList.contains('expanded'))expandPreview(false);});
$('#zoom-in').addEventListener('click',()=>viewer?.zoom(.87));$('#zoom-out').addEventListener('click',()=>viewer?.zoom(1.13));$('#reset-view').addEventListener('click',()=>viewer?.setView(view));
$('#hero-turn').addEventListener('click',async()=>{if(!hero){$('#hero-photograph').hidden=true;$('#hero-viewer').hidden=false;hero=await makeViewer($('#hero-viewer'),{config:{...PRESETS.signature,grip:'alcantara',stitch:'blue',marker:'blue',led:true,paddles:true},hero:true});$('#hero-mode').textContent='INTERACTIVE 3D DESIGN PREVIEW';$('#hero-turn').setAttribute('aria-label','Rotate hero wheel');$('.hero-drag').textContent='DRAG TO EXPLORE ↔';}else hero.turn();});
$$('[data-brand-start]').forEach(b=>b.addEventListener('click',()=>{config=normalize({...DEFAULT,brand:b.dataset.brandStart});step=0;startBuild();}));
$$('[data-preset]').forEach(b=>b.addEventListener('click',()=>{config={...PRESETS[b.dataset.preset]};step=1;startBuild();}));
$('[data-driver-start]').addEventListener('click',()=>changeView('driver'));
window.addEventListener('hashchange',route);
changeView(view);
route();
