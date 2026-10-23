import test from 'node:test';
import assert from 'node:assert/strict';
import { zoomAt, layerFrames } from '../src/camera.js';
import { story } from '../src/story.js';
test('zoom preserves the world point underneath the pointer and reverses',()=>{
 const c={x:20,y:-40,scale:2},p={x:450,y:300};const n=zoomAt(c,3,p,.1,100);
 assert.equal((p.x-c.x)/c.scale,(p.x-n.x)/n.scale);
 assert.deepEqual(zoomAt(n,1/3,p,.1,100),c);
});
test('all three scene bounds compose in their parent coordinate system',()=>{
 const f=layerFrames(story);assert.equal(f.length,3);
 assert.equal(f[1].x,960);assert.equal(f[1].width,272);
 assert.equal(f[2].x,960+272*.40);assert.equal(f[2].width,272*.22);
});
test('zoom limits do not move the pointer anchor',()=>{
 const n=zoomAt({x:0,y:0,scale:1},100,{x:10,y:20},.5,2);
 assert.deepEqual(n,{scale:2,x:-10,y:-20});
});
