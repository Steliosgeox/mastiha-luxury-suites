import { test, expect, type Page } from "@playwright/test";
import { propertyData } from "../src/content/property";

async function scrollFilm(page: Page, progress: number) {
  await page.locator("#film").evaluate((element, value) => {
    const box = element.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + box.top + (box.height - window.innerHeight) * value, behavior: "instant" });
  }, progress);
}
for (const width of [320, 390, 768, 1440]) {
  test(`hero is actually visible, above the film, with contained images at ${width}px`, async ({ page }, info) => {
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 }); await page.goto("/en");
    await expect(page).toHaveTitle(/Mastiha Luxury Suites/);
    await expect(page.locator("h1")).toHaveText("MASTIHA");
    const hero = page.getByTestId("landing-hero");
    const image = page.getByTestId("hero-image");
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect.poll(() => page.evaluate(() => document.elementFromPoint(window.innerWidth / 2, window.innerHeight * .3)?.closest("#home") !== null)).toBe(true);
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector("#home")!.getBoundingClientRect(); const film = document.querySelector("#film")!.getBoundingClientRect();
      return { heroTop: hero.top, heroBottom: hero.bottom, filmTop: film.top, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, escaped: [...document.querySelectorAll<HTMLImageElement>('img[data-nimg="fill"]')].filter(image => {
        const parent=image.parentElement!; const p=parent.getBoundingClientRect(), r=image.getBoundingClientRect();
        return !["relative","absolute","fixed","sticky"].includes(getComputedStyle(parent).position) || (!image.hasAttribute("data-parallax") && (r.left < p.left-2 || r.right > p.right+2 || r.top < p.top-2 || r.bottom > p.bottom+2));
      }).map(image=>image.getAttribute("alt")) };
    });
    expect(geometry.heroTop).toBe(0); expect(geometry.filmTop).toBeGreaterThanOrEqual(geometry.heroBottom-1); expect(geometry.overflow).toBe(false); expect(geometry.escaped).toEqual([]);
    await expect(hero.locator("header")).toBeVisible(); await expect(hero.getByRole("button",{name:/Check availability/})).toBeVisible();
    await hero.screenshot({ path:info.outputPath(`hero-${width}.png`) });
    await page.getByTestId("mastiha-dock").screenshot({path:info.outputPath(`dock-${width}.png`)});
    expect(errors).toEqual([]);
  });
}

test('film is lazy, advances and reverses after delayed requests stop', async ({page})=>{
 const requested:string[]=[]; page.on('request',r=>{if(/\/sequence\/(desktop|mobile)\/frame-/.test(r.url()))requested.push(r.url());});
 await page.route('**/sequence/**/frame-*.avif',async route=>{await new Promise(r=>setTimeout(r,100));await route.continue();});
 await page.goto('/en'); await page.waitForTimeout(600); expect(requested).toHaveLength(0);
 const canvas=page.getByTestId('film-canvas');
 await scrollFilm(page,.7); await expect(canvas).toHaveAttribute('data-ready','true',{timeout:15000});
 await expect.poll(()=>canvas.evaluate(e=>e.dataset.frame===e.dataset.target),{timeout:15000}).toBe(true);
 const forward=Number(await canvas.getAttribute('data-frame')); expect(forward).toBeGreaterThan(60);
 await scrollFilm(page,.15); await expect.poll(()=>canvas.evaluate(e=>e.dataset.frame===e.dataset.target),{timeout:15000}).toBe(true);
 expect(Number(await canvas.getAttribute('data-frame'))).toBeLessThan(forward);
 expect(Number(await canvas.getAttribute('data-cached'))).toBeLessThanOrEqual(10);
});

test('reduced motion and failed film retain a useful poster without covering the hero',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'}); const requests:string[]=[];page.on('request',r=>{if(/\/sequence\/(desktop|mobile)\/frame-/.test(r.url()))requests.push(r.url());});
 await page.goto('/en'); await page.locator('#film').scrollIntoViewIfNeeded(); await expect(page.locator('#film')).toHaveAttribute('data-static','true'); expect(requests).toHaveLength(0);
 await page.emulateMedia({reducedMotion:'no-preference'}); await page.route('**/sequence/sequence-manifest.json',route=>route.fulfill({status:503,body:'unavailable'}));
 await page.reload(); await page.locator('#film').scrollIntoViewIfNeeded(); await expect(page.locator('#film')).toHaveAttribute('data-static','true',{timeout:15000});
 await page.getByTestId('mastiha-dock').getByRole('button',{name:'Home',exact:true}).click(); await expect.poll(()=>page.evaluate(()=>Math.round(scrollY))).toBe(0);
 await expect(page.getByTestId('hero-image')).toBeVisible();
});

test('gallery filters, zoom, keyboard navigation and focus restoration',async({page},info)=>{
 await page.goto('/en'); const gallery=page.locator('#gallery');
 await gallery.getByRole('button',{name:'Bedrooms',exact:true}).click(); await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(2);
 await gallery.getByRole('button',{name:'All spaces',exact:true}).click(); await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(5);
 const first=page.getByTestId('gallery-grid').getByRole('button').first(); await first.click();
 const lightbox=page.locator('.yarl__root'); await expect(lightbox).toBeVisible(); await expect(page.locator('.yarl__counter')).toContainText('1 / 5');
 await page.keyboard.press('ArrowRight'); await expect(page.locator('.yarl__counter')).toContainText('2 / 5');
 await expect(lightbox.getByRole('button',{name:'Zoom in',exact:true})).toBeVisible();
 await page.screenshot({path:info.outputPath('lightbox.png')}); await page.keyboard.press('Escape'); await expect(lightbox).toHaveCount(0); await expect(first).toBeFocused();
});

test('booking is a trapped native dialog with real outbound links',async({page},info)=>{
 await page.goto('/en'); const book=page.getByTestId('mastiha-dock').getByRole('button',{name:'Book your stay'}); await book.click();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('link',{name:'Airbnb',exact:true})).toHaveAttribute('href',propertyData.bookingLinks.airbnb);
 await expect(dialog.getByRole('link',{name:'Booking.com',exact:true})).toHaveAttribute('href',propertyData.bookingLinks.booking);
 for(let i=0;i<6;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);}
 await page.screenshot({path:info.outputPath('booking.png')});await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(book).toBeFocused();
});

test('photographic sections, compact ratings, map privacy and FAQ',async({page},info)=>{
 await page.goto('/en');await expect(page.locator('iframe')).toHaveCount(0);
 for(const score of await page.getByTestId('review-score').all())expect(await score.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeLessThanOrEqual(28);
 await page.locator('#information summary').first().click();await expect(page.locator('#information details').first()).toHaveAttribute('open','');
 await expect(page.locator('#location').getByRole('link',{name:/Open Google Maps/})).toHaveAttribute('href',propertyData.location.googleMapsUrl);
 await page.route('https://maps.google.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>Google map test response</p>'}));
 await page.getByRole('button',{name:'Load location map'}).click();await expect(page.locator('iframe')).toHaveCount(1);
 await page.getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('iframe')).toHaveCount(0);
 await expect(page.locator('footer')).toContainText(propertyData.licenseNumber);await expect(page.locator('footer').getByRole('link',{name:'Privacy',exact:true})).toHaveAttribute('href','/en/privacy');
 for(const id of ['suite','spaces','gallery','amenities','reviews','location']) { const section=page.locator(`#${id}`);await section.scrollIntoViewIfNeeded();await page.waitForTimeout(900);await section.screenshot({path:info.outputPath(`${id}.png`)}); }
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:info.outputPath('full-page.png'),fullPage:true});
});

test('Greek and Turkish remain readable and navigable at phone width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const [locale,headline] of [['el','Μια πιο ήρεμη πλευρά της Χίου.'],['tr',"Sakız Adası'nın daha sakin bir yüzü."]]){
  await page.goto(`/${locale}`);await expect(page.getByTestId('landing-hero')).toContainText(headline);await expect(page.locator('h1')).toHaveText('MASTIHA');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator('header nav').last()).toBeVisible();
 }
});

test('server-rendered hero works when JavaScript is disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});const page=await context.newPage();
 await page.goto('/en');await expect(page.locator('h1')).toHaveText('MASTIHA');await expect(page.getByTestId('hero-image')).toBeVisible();await expect(page.locator('#reviews a')).toHaveCount(2);await context.close();
});
