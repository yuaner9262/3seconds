import { readFile, writeFile, readdir } from 'node:fs/promises';
const assets=await readdir('dist/assets');
let js=await readFile('dist/assets/'+assets.find(n=>n.endsWith('.js')),'utf8');
const css=await readFile('dist/assets/'+assets.find(n=>n.endsWith('.css')),'utf8');
const image='data:image/png;base64,'+(await readFile('public/art/bookshop.png')).toString('base64');
js=js.replaceAll('art/bookshop.png',image);
await writeFile('dist/3seconds-preview.html',`<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3秒 · 预览</title><style>${css}</style><body><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script></body></html>`);
console.log('Created dist/3seconds-preview.html — open directly in a desktop browser.');
