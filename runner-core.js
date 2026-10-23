/* Pure runner simulation, shared by the game renderer and deterministic tests. */
(function(root){
'use strict';
const VALUES={heart:5,milk:8,rice:3,oyster:6};
const TRACK={
 // Calibrated to the supplied road: horizon y=230, player feet y=720.
 // Lane centres sit between the painted dividers and the outer road edges.
 project(lane,z=0){const scale=Math.min(1.25,18/(18+Math.max(-3.6,z)));return {x:270+(lane-1)*204*scale,y:230+490*scale,scale}}
};
class Runner{
 constructor(random=Math.random){this.random=random;this.reset();this.mode='ready'}
 reset(){this.mode='running';this.time=0;this.distance=0;this.bonus=0;this.lives=3;this.lane=1;this.x=1;this.jump=0;this.slide=0;this.invulnerable=0;this.spawnClock=1.5;this.items=[];this.events=[];this.nextId=0;this.wave=0;this.add('milk',1,42);this.add('rice',1,53);this.add('barrier',0,105)}
 get speed(){return Math.min(34,20+this.distance/180)}
 get score(){return Math.floor(this.distance)+this.bonus}
 get jumpHeight(){return this.jump>0?Math.sin(Math.PI*(1-this.jump/1.05))*110:0}
 add(type,lane,z){this.items.push({id:++this.nextId,type,lane,z,done:false})}
 action(a){if(this.mode!=='running')return;if(a==='left')this.lane=Math.max(0,this.lane-1);if(a==='right')this.lane=Math.min(2,this.lane+1);if(a==='jump'&&this.jump===0&&this.slide===0)this.jump=1.05;if(a==='slide'&&this.slide===0&&this.jump===0)this.slide=.9}
 pause(){if(this.mode==='running')this.mode='paused'}
 resume(){if(this.mode==='paused')this.mode='running'}
 spawn(){this.wave++;const safe=Math.floor(this.random()*3);const lanes=[0,1,2].filter(n=>n!==safe);const types=['car','bike','cow','barrier','gate'];const count=this.distance>250&&this.wave%3===0?2:1;for(let i=0;i<count;i++)this.add(types[(this.wave+i)%types.length],lanes[i],115);const reward=Object.keys(VALUES)[this.wave%4];this.add(reward,safe,115);this.add(reward,safe,124);}
 step(dt){this.events=[];if(this.mode!=='running')return;dt=Math.min(.05,Math.max(0,dt));this.time+=dt;this.distance+=this.speed*dt;this.x+=(this.lane-this.x)*Math.min(1,dt*14);this.jump=Math.max(0,this.jump-dt);this.slide=Math.max(0,this.slide-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);this.spawnClock-=dt;if(this.spawnClock<=0){this.spawn();this.spawnClock=1.6}for(const o of this.items){o.z-=this.speed*dt;if(o.z<=0&&!o.done){o.done=true;if(Math.abs(o.lane-this.x)<.53){if(VALUES[o.type]){this.bonus+=VALUES[o.type];o.collected=true;this.events.push({type:'collect',value:VALUES[o.type],lane:o.lane})}else{const avoided=(o.type==='barrier'&&this.jumpHeight>35)||(o.type==='gate'&&this.slide>0);if(!avoided&&this.invulnerable===0){this.lives--;this.invulnerable=1.5;this.events.push({type:'hit'});if(this.lives===0){this.mode='over';this.events.push({type:'over'});break}}}}}}this.items=this.items.filter(o=>o.z>-12&&!o.collected)}
 snapshot(){return {mode:this.mode,distance:Math.floor(this.distance),score:this.score,bonus:this.bonus,lives:this.lives,lane:this.lane,x:this.x,jump:this.jump,slide:this.slide,items:this.items.map(o=>({...o}))}}
}
root.AqingRunner=Runner;
root.AqingTrack=TRACK;
if(typeof module!=='undefined')module.exports={Runner,VALUES,TRACK};
})(typeof window==='undefined'?globalThis:window);
