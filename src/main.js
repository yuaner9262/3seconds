import './style.css';
import { story } from './story.js';
import { zoomAt, layerFrames } from './camera.js';
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
let camera={x:0,y:0,scale:1}, target={...camera}, level=0, fit=1, initialized=false;
function size(){fit=Math.min(stage.clientWidth/story.width,stage.clientHeight/story.height);if(!initialized){target=frameCamera(0);camera={...target};initialized=true;}}
function frameCamera(i){const f=frames[i];const s=fit*story.width/f.width*(i?f.portal?.targetScale||1:1);return {scale:s,x:stage.clientWidth/2-(f.x+f.width/2)*s,y:stage.clientHeight/2-(f.y+f.height/2)*s};}
function go(i){target=frameCamera(Math.max(0,Math.min(frames.length-1,i)));}
// Public input adapter: future gesture input calls the exact same camera methods.
function zoom(factor, point={x:stage.clientWidth/2,y:stage.clientHeight/2}){target=zoomAt(target,factor,point,fit*.7,fit*story.width/frames.at(-1).width*3);}
window.narrativeControls={zoom,go,reset:()=>go(0),pan:(x,y)=>{target.x+=x;target.y+=y;}};
stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect();zoom(Math.exp(-e.deltaY*(e.deltaMode===1?.035:.0018)),{x:e.clientX-r.left,y:e.clientY-r.top});},{passive:false});
let pointers=new Map(), drag=false, lastDistance=0;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);drag=true;stage.classList.add('dragging');});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const r=stage.getBoundingClientRect();if(lastDistance)zoom(d/lastDistance,{x:(a.x+b.x)/2-r.left,y:(a.y+b.y)/2-r.top});lastDistance=d;}else if(drag){target.x+=e.clientX-prev.x;target.y+=e.clientY-prev.y;}});
function release(e){pointers.delete(e.pointerId);lastDistance=0;drag=pointers.size>0;stage.classList.toggle('dragging',drag);}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);

document.querySelector('#reset').onclick=()=>go(0);
window.addEventListener('keydown',e=>{if(['+','=','-','Home','Backspace','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='+'||e.key==='=')zoom(1.4);if(e.key==='-')zoom(1/1.4);if(e.key==='Home')go(0);if(e.key==='Backspace')go(level-1);if(e.key==='ArrowLeft')target.x+=60;if(e.key==='ArrowRight')target.x-=60;if(e.key==='ArrowUp')target.y+=60;if(e.key==='ArrowDown')target.y-=60;});
new ResizeObserver(()=>{size();if(initialized)go(level);}).observe(stage);size();
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
let previousTime=0;
function animate(time){const dt=Math.min(64,time-previousTime||16);previousTime=time;const k=reducedMotion?1:1-Math.exp(-dt/95);for(const key of ['x','y','scale'])camera[key]+=(target[key]-camera[key])*k;world.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
 let next=0;for(let i=1;i<frames.length;i++){const f=frames[i];const cx=camera.x+(f.x+f.width/2)*camera.scale,cy=camera.y+(f.y+f.height/2)*camera.scale;if(camera.scale>=fit*story.width/f.width*.55&&Math.abs(cx-stage.clientWidth/2)<stage.clientWidth*.6&&Math.abs(cy-stage.clientHeight/2)<stage.clientHeight*.6)next=i;}
 level=next;document.querySelector('#scene-name').textContent=frames[level].title;document.querySelector('footer').hidden=level!==frames.length-1;requestAnimationFrame(animate);}
requestAnimationFrame(animate);
