import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('src/components/redesign/frame-player.ts','utf8');
const output = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {parseFrameManifest, progressFrame, frameUrl, desiredFrames, fittedRect, createFramePlayer} = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
const manifest = JSON.parse(fs.readFileSync('public/sequence/sequence-manifest.json','utf8'));

test('manifest validation rejects invalid counts, paths and dimensions',()=>{
 assert.equal(parseFrameManifest(manifest).desktop.frameCount,120);
 for(const bad of [null,{}, {...manifest,desktop:{...manifest.desktop,frameCount:0}}, {...manifest,mobile:{...manifest.mobile,basePath:'https://elsewhere.test'}}]) assert.throws(()=>parseFrameManifest(bad));
});
test('progress mapping clamps invalid and boundary values',()=>{ assert.equal(progressFrame(0,120),0); assert.equal(progressFrame(1,120),119); assert.equal(progressFrame(.5,120),60); assert.equal(progressFrame(-2,120),0); assert.equal(progressFrame(NaN,120),0); assert.equal(progressFrame(4,120),119); });
test('URLs use manifest variant and one-based frame naming',()=>{ assert.equal(frameUrl(manifest.mobile,0),'/sequence/mobile/frame-0001.avif'); assert.equal(frameUrl(manifest.mobile,999),'/sequence/mobile/frame-0080.avif'); });
test('directional windows stay unique and bounded',()=>{ for(const target of [0,1,50,119]) for(const direction of [-1,1]) { const result=desiredFrames(target,120,7,direction); assert.equal(result[0],target); assert.equal(result.length,7); assert.equal(new Set(result).size,7); assert.ok(result.every(i=>i>=0&&i<120)); } assert.deepEqual(desiredFrames(0,0,3,1),[]); });
test('mobile fit preserves the complete landscape frame',()=>{ const r=fittedRect(390,844,1440,810,true); assert.equal(r.width,390); assert.ok(r.height<844); assert.ok(r.y>0); });

test('delayed decoding paints the latest requested frame and releases bitmaps',async(t)=>{
 const saved={fetch:globalThis.fetch,createImageBitmap:globalThis.createImageBitmap,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 let active=0,maxActive=0,closed=0,last='';
 globalThis.fetch=async(url,{signal})=>{ active++;maxActive=Math.max(maxActive,active); try { await new Promise((resolve,reject)=>{ const timer=setTimeout(resolve,12);signal.addEventListener('abort',()=>{clearTimeout(timer);reject(new Error('Aborted'));},{once:true}); });return {ok:true,blob:async()=>new Blob([String(url)])}; }finally{active--;} };
 globalThis.createImageBitmap=async(blob)=>({width:1440,height:810,url:await blob.text(),close(){closed++;}});
 globalThis.ResizeObserver=class{constructor(callback){this.callback=callback;}observe(){this.callback();}disconnect(){}};
 globalThis.requestAnimationFrame=(fn)=>setTimeout(fn,0);globalThis.cancelAnimationFrame=clearTimeout;
 const canvas={width:0,height:0,dataset:{},getBoundingClientRect:()=>({width:1440,height:900}),getContext:()=>({fillRect(){},drawImage(image){last=image.url;}})};
 const player=createFramePlayer(canvas,manifest.desktop,{mobile:false,onError:()=>assert.fail('unexpected frame error')});
 t.after(()=>{player.dispose();Object.assign(globalThis,saved);});
 async function until(check){for(let i=0;i<100&&!check();i++)await new Promise(r=>setTimeout(r,10));assert.ok(check());}
 player.seek(.8);await until(()=>canvas.dataset.frame==='95');assert.ok(last.endsWith('frame-0096.avif'));
 player.seek(.15);await until(()=>canvas.dataset.frame==='18');assert.equal(canvas.dataset.target,'18');
 assert.ok(maxActive<=2);assert.ok(Number(canvas.dataset.cached)<=7);player.dispose();assert.ok(closed>0);
});
