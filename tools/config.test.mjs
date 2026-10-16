import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,DEFAULT,PRESETS,vehicle,total,encode,decode,VEHICLES} from '../src/config.js';
import {BRANDS,VEHICLE_COUNT} from '../src/catalogue.js';
test('vehicle switches constrain years, trims and incompatible heating',()=>{
  const c=normalize({...DEFAULT,brand:'Mercedes',model:'w205',year:2025,trim:'M340i',heating:true});
  assert.equal(c.year,2021);assert.equal(c.trim,'AMG Line');assert.equal(vehicle(c).id,'w205');
  assert.equal(normalize({...c,brand:'Nissan',model:'skyline-r32',heating:true}).heating,false);
});
test('all catalogue records have unique IDs, valid defaults and stable share round trips',()=>{
  assert.equal(Object.keys(BRANDS).length,9);assert.equal(VEHICLE_COUNT,129);
  for(const [brand,list] of Object.entries(VEHICLES)){
    assert.equal(new Set(list.map(v=>v.id)).size,list.length);
    for(const v of list){const c=normalize({brand,model:v.id,year:-1,trim:'invalid'});
      assert.equal(c.model,v.id);assert.equal(c.year,v.years[1]);assert.equal(c.trim,v.trims[0]);assert.deepEqual(decode(encode(c)),c);
      assert.ok(v.years[0]<=v.years[1]);assert.ok(v.trims.length);
    }
  }
});
test('untrusted shared options are whitelisted and bounded',()=>{
  const c=normalize({brand:'<script>',rim:'invalid',model:'unknown',led:'true',gripColor:'url(x)'});
  assert.equal(c.brand,'BMW');assert.equal(c.rim,'carbon');assert.equal(c.led,false);assert.equal(c.gripColor,'black');
  assert.equal(decode('not json'),null);assert.equal(decode('x'.repeat(2000)),null);
});
test('demo pricing sums visible upgrades and round trips share data',()=>{
  assert.equal(total(DEFAULT),11690);assert.equal(total(PRESETS.midnight),12190);
  assert.deepEqual(decode(encode(PRESETS.midnight)),PRESETS.midnight);assert.equal(total(PRESETS.heritage),11690);
});
test('Tesla yoke remains selectable and resets safely when brand changes',()=>{
  const c=normalize({...DEFAULT,brand:'Tesla',shape:'yoke'});assert.equal(c.shape,'yoke');assert.equal(normalize({...c,brand:'BMW'}).shape,'flat');
});
