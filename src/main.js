import './style.css';
import { story } from './story.js';
import { cameraOnPath, layerFrames } from './camera.js';
const frames = layerFrames(story);
document.querySelector('#app').innerHTML = `
<main id="stage" aria-label="交互叙事画布，可滚动缩放、拖动平移" tabindex="0"><div id="world"></div><output id="scene-name" class="sr-only" aria-live="polite">隔岸</output></main>
<footer hidden><button id="reset" aria-label="重新开始" title="重新开始">⟲</button></footer>`;
const stage = document.querySelector('#stage'), world = document.querySelector('#world');
world.style.width = story.width+'px'; world.style.height = story.height+'px';
frames.forEach((f,i)=> {
 const el = document.createElement('div'); el.className='layer'; el.style.cssText=`left:${f.x}px;top:${f.y}px;width:${f.width}px;height:${f.height}px;z-index:${i}`;
 el.innerHTML=`<img src="${f.image}" alt="${f.title}：${f.subtitle}" draggable="false">`;
 if(f.portal){const p=f.portal; const b=document.createElement('div'); b.className='portal'; b.setAttribute('aria-hidden','true'); b.style.cssText=`left:${p.x*100}%;top:${p.y*100}%;width:${p.width*100}%;height:${p.height*100}%`;  el.append(b);}
 const image=el.querySelector('img');
 if(f.crop){const c=f.crop;image.style.cssText=`position:absolute;width:${100/c.width}%;height:${100/c.height}%;left:${-c.x/c.width*100}%;top:${-c.y/c.height*100}%`;}
 image.addEventListener('error',()=>{el.classList.add('asset-error');const message=document.createElement('span');message.className='asset-message';message.textContent='画面暂时未能加载，请刷新重试';el.append(message);});
 world.append(el);
});
let progress=0, targetProgress=0, level=0;
const pan={x:0,y:0}, targetPan={x:0,y:0};
const viewport=()=>({width:stage.clientWidth,height:stage.clientHeight});
function go(i){targetProgress=Math.max(0,Math.min(frames.length-1,i));targetPan.x=targetPan.y=0;}
// Pointer, touch and future gestures all advance the same configured path.
function zoom(factor){
 if(!Number.isFinite(factor)||factor<=0)return;
 targetProgress=Math.max(0,Math.min(frames.length-1,targetProgress+Math.log(factor)/Math.log(4)));
 targetPan.x=targetPan.y=0;
}
function move(x,y){targetPan.x+=x;targetPan.y+=y;}
window.narrativeControls={zoom,go,reset:()=>go(0),pan:move,getState:()=>({progress,targetProgress,level,camera:cameraOnPath(frames,progress,viewport())})};
stage.addEventListener('wheel',e=>{e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);zoom(Math.exp(-delta*.0018));},{passive:false});
let pointers=new Map(), drag=false, lastDistance=0;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);drag=true;stage.classList.add('dragging');});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)zoom(d/lastDistance);lastDistance=d;}else if(drag){move(e.clientX-prev.x,e.clientY-prev.y);}});
function release(e){pointers.delete(e.pointerId);lastDistance=0;drag=pointers.size>0;stage.classList.toggle('dragging',drag);}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);

document.querySelector('#reset').onclick=()=>go(0);
window.addEventListener('keydown',e=>{if(['+','=','-','Home','Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='+'||e.key==='=')zoom(1.4);if(e.key==='-')zoom(1/1.4);if(e.key==='Home')go(0);if(e.key==='Backspace')go(level-1);if(e.key==='ArrowLeft')move(60,0);if(e.key==='ArrowRight')move(-60,0);if(e.key==='ArrowUp')move(0,60);if(e.key==='ArrowDown')move(0,-60);});
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
let previousTime=0;
function animate(time){
 const dt=Math.min(64,time-previousTime||16);previousTime=time;
 const k=reducedMotion?1:1-Math.exp(-dt/95);
 progress+=(targetProgress-progress)*k;
 if(Math.abs(progress-targetProgress)<.00001)progress=targetProgress;
 pan.x+=(targetPan.x-pan.x)*k;pan.y+=(targetPan.y-pan.y)*k;
 const camera=cameraOnPath(frames,progress,viewport());
 world.style.transform=`translate(${camera.x+pan.x}px,${camera.y+pan.y}px) scale(${camera.scale})`;
 level=Math.min(frames.length-1,Math.floor(progress+.12));
 document.querySelector('#scene-name').textContent=frames[level].title;
 document.querySelector('footer').hidden=progress<frames.length-1-.015;
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
