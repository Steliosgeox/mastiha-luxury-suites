import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import photos from '../src/content/stay-media.generated.json';

for(const width of [390,1440])test(`real photo tour advances and reverses without obscuring the hero at ${width}px`,async({page},info)=>{
 await page.setViewportSize({width,height:900});await page.goto('/en');
 const tour=page.getByTestId('scroll-film'), viewport=page.getByTestId('photo-tour-viewport');
 await expect(tour).toHaveAttribute('data-static','false');
 const frames:number[]=[];
 for(const progress of [.2,.8,.35]){
  await tour.evaluate((element,p)=>{const r=element.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+(r.height-innerHeight)*p,behavior:'instant'});},progress);
  await expect(viewport).toBeInViewport({ratio:.9});
  await expect.poll(()=>tour.evaluate(e=>e.dataset.target===e.dataset.frame),{timeout:15000}).toBe(true);
  frames.push(Number(await tour.getAttribute('data-frame')));
  const active=tour.locator('[data-active=true] img');await expect.poll(()=>active.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
  await page.screenshot({path:info.outputPath(`real-tour-${width}-${progress}.png`)});
 }
 expect(frames[1]).toBeGreaterThan(frames[0]);expect(frames[2]).toBeLessThan(frames[1]);
});

test('reduced motion uses one true photograph and never downloads synthetic frames',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const oldRequests:string[]=[];
 page.on('request',r=>{if(r.url().includes('/sequence/'))oldRequests.push(r.url());});
 await page.goto('/en');const tour=page.getByTestId('scroll-film');await tour.scrollIntoViewIfNeeded();
 await expect(tour).toHaveAttribute('data-static','true');await expect(tour.locator('img')).toHaveCount(1);
 await expect(tour.locator('img')).toHaveAttribute('alt',photos[0].captions.en);expect(oldRequests).toEqual([]);
});

test('a delayed photograph paints when it arrives after scrolling stops',async({page})=>{
 let delayed=0;
 await page.route('**/photography/airbnb/kitchen*.webp',async route=>{delayed++;await new Promise(r=>setTimeout(r,600));await route.continue();});
 await page.goto('/en');const tour=page.getByTestId('scroll-film');await expect(tour).toHaveAttribute('data-static','false');
 await tour.evaluate(element=>{const r=element.getBoundingClientRect();window.scrollTo({top:scrollY+r.top+(r.height-innerHeight)*.35,behavior:'instant'});});
 await expect.poll(()=>delayed).toBeGreaterThan(0);
 await expect(tour).toHaveAttribute('data-target','1');await expect(tour).toHaveAttribute('data-frame','1',{timeout:15000});
});

test('all published original photographs match reviewed source hashes',async({request})=>{
 expect(photos).toHaveLength(24);expect(new Set(photos.map(p=>p.source.webpSha256)).size).toBe(24);
 for(const photo of photos){
  expect(photo.source.listingId).toBe('1368953469779774276');
  const r=await request.get(photo.src);expect(r.ok(),photo.src).toBe(true);expect(r.headers()['content-type']).toContain('image/webp');
  expect(createHash('sha256').update(await r.body()).digest('hex')).toBe(photo.source.webpSha256);
  expect((await request.get(photo.thumbnail)).ok()).toBe(true);
 }
 for(const old of ['/photography/hero.webp','/sequence/poster.webp','/sequence/desktop/frame-0001.avif'])expect((await request.get(old)).status()).toBe(404);
});

test('localized document language, SEO, photo categories and host information are correct',async({page,request},info)=>{
 for(const locale of ['en','el','tr']){
  await page.goto('/'+locale);await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://mastiha-luxury-suites.vercel.app/${locale}`);
  expect(await page.locator('link[rel=alternate][hreflang]').count()).toBeGreaterThanOrEqual(3);
  const data=JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(JSON.stringify(data)).not.toContain('aggregateRating');expect(JSON.stringify(data)).not.toContain('mastihasuites.gr');
  await expect(page.locator('#host-title')).toBeVisible();
 }
 await page.goto('/en');const gallery=page.locator('#gallery');
 await gallery.getByRole('button',{name:'Around Mastiha',exact:true}).click();await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(4);
 await expect(gallery).toContainText('not views promised from the apartment');
 await gallery.getByRole('button',{name:'All spaces',exact:true}).click();await gallery.getByRole('button',{name:'Show more photographs (24)',exact:true}).click();await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(24);
 await page.screenshot({path:info.outputPath('real-gallery-expanded.png'),fullPage:true});
 expect((await request.get('/robots.txt')).status()).toBe(200);expect(await (await request.get('/sitemap.xml')).text()).not.toContain('mastihasuites.gr');
 await page.goto('/el/privacy');await expect(page.locator('h1')).toHaveText('Απόρρητο');await expect(page.locator('html')).toHaveAttribute('lang','el');
});
