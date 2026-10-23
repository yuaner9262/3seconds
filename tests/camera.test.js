import test from 'node:test';
import assert from 'node:assert/strict';
import { layerFrames } from '../src/camera.js';
import { story } from '../src/story.js';
test('all three scene bounds compose in their parent coordinate system',()=>{
 const f=layerFrames(story);assert.equal(f.length,3);
 assert.equal(f[1].x,960);assert.equal(f[1].width,272);
 assert.equal(f[2].x,960+272*.40);assert.equal(f[2].width,272*.22);
});
test('directed path centers each configured entrance and fits portrait scenes',async()=>{
 const {cameraOnPath}=await import('../src/camera.js');const frames=layerFrames(story);
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  frames.forEach((f,i)=>{const c=cameraOnPath(frames,i,viewport);
   assert.ok(Math.abs(c.x+(f.x+f.width/2)*c.scale-viewport.width/2)<1e-8);
   assert.ok(Math.abs(c.y+(f.y+f.height/2)*c.scale-viewport.height/2)<1e-8);
   assert.ok(f.width*c.scale<=viewport.width+1e-8);
   assert.ok(f.height*c.scale<=viewport.height+1e-8);
  });
 }
});
test('path is continuous at scene boundaries and exactly reversible',async()=>{
 const {cameraOnPath}=await import('../src/camera.js');const frames=layerFrames(story),v={width:1440,height:900};
 const a=cameraOnPath(frames,1-1e-8,v),b=cameraOnPath(frames,1+1e-8,v);
 assert.ok(Math.abs(a.x-b.x)<.001);assert.ok(Math.abs(a.scale-b.scale)<.001);
 const forward=Array.from({length:21},(_,i)=>cameraOnPath(frames,i/10,v));
 const backward=Array.from({length:21},(_,i)=>cameraOnPath(frames,(20-i)/10,v));
 assert.deepEqual(forward,backward.reverse());
 assert.deepEqual(cameraOnPath(frames,99,v),cameraOnPath(frames,2,v));
});
