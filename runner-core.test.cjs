const assert=require('node:assert/strict');
const {Runner,VALUES,TRACK}=require('./runner-core.js');
const tests=[];function test(name,fn){fn();tests.push(name)}
function empty(){const r=new Runner(()=>.5);r.reset();r.items=[];r.spawnClock=999;return r}
function tick(r,seconds){for(let i=0;i<Math.ceil(seconds*60);i++)r.step(1/60)}
test('Pause freezes distance, inputs, and obstacle positions',()=>{const r=empty();r.add('car',0,40);tick(r,.3);r.pause();const snap=r.snapshot();r.action('right');tick(r,2);assert.deepEqual(r.snapshot(),snap);r.resume();tick(r,.1);assert(r.distance>snap.distance)});
test('All four rewards score once and disappear',()=>{for(const [type,value]of Object.entries(VALUES)){const r=empty();r.add(type,1,.1);r.step(.02);assert.equal(r.bonus,value);assert.equal(r.items.length,0);tick(r,1);assert.equal(r.bonus,value)}});
test('Wrong lane never collects reward',()=>{const r=empty();r.add('milk',0,.1);r.step(.02);assert.equal(r.bonus,0)});
test('Lane movement is bounded and collision uses actual position',()=>{const r=empty();for(let i=0;i<4;i++)r.action('left');assert.equal(r.lane,0);r.add('car',1,.1);r.step(.02);assert.equal(r.lives,2);tick(r,.5);assert(r.x<.01);for(let i=0;i<8;i++)r.action('right');assert.equal(r.lane,2)});
test('Jump clears low barrier; ground collision costs one life',()=>{let r=empty();r.action('jump');tick(r,.3);r.add('barrier',1,.1);r.step(.02);assert.equal(r.lives,3);r=empty();r.add('barrier',1,.1);r.step(.02);assert.equal(r.lives,2)});
test('Slide clears overhead sign; jump cannot clear vehicles',()=>{const r=empty();r.action('slide');r.add('gate',1,.1);r.step(.02);assert.equal(r.lives,3);const s=empty();s.action('jump');tick(s,.3);s.add('car',1,.1);s.step(.02);assert.equal(s.lives,2)});
test('Actions cannot stack, and they recover after completion',()=>{const r=empty();r.action('jump');r.action('slide');assert.equal(r.slide,0);tick(r,1.2);r.action('slide');assert(r.slide>0);r.action('jump');assert.equal(r.jump,0)});
test('Invulnerability prevents stacked hits; third separate collision ends run',()=>{const r=empty();for(let i=0;i<3;i++){r.add('car',1,.1);r.add('bike',1,.1);r.step(.02);assert.equal(r.lives,2-i);if(i<2)tick(r,1.6)}assert.equal(r.mode,'over');const snap=r.snapshot();tick(r,2);assert.deepEqual(r.snapshot(),snap);r.reset();assert.equal(r.lives,3);assert.equal(r.mode,'running');assert.equal(r.score,0)});
test('Every generated wave leaves a clear lane',()=>{for(const n of [0,.33,.66,.999]){const r=new Runner(()=>n);r.reset();r.items=[];r.distance=600;for(let k=0;k<20;k++){r.items=[];r.spawn();const blocked=new Set(r.items.filter(o=>!VALUES[o.type]).map(o=>o.lane));assert(blocked.size<=2);for(const reward of r.items.filter(o=>VALUES[o.type]))assert(!blocked.has(reward.lane))}}});
test('Outer lane centres clear the road dividers at near, middle and far depths',()=>{
 // Divider locations measured on the supplied 540x900 background.
 for(const [z,leftDivider,rightDivider] of [[0,168,373],[18,221,318],[54,247,292],[126,259,281]]){
  const a=TRACK.project(0,z),b=TRACK.project(1,z),c=TRACK.project(2,z);
  assert(a.x<leftDivider);assert(c.x>rightDivider);assert.equal(b.x,270);assert.equal(a.y,b.y);assert.equal(b.y,c.y);
 }
 // At the collision plane, car sprites remain inside the visible playfield.
 assert(TRACK.project(0).x-62>=0);assert(TRACK.project(2).x+62<=540);
});
console.log(`${tests.length} tests passed:\n`+tests.map(t=>'✓ '+t).join('\n'));
