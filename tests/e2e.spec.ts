import { test, expect } from "@playwright/test";
import { propertyData } from "../src/content/property";

for (const width of [320, 390, 768, 1440]) {
  test(`hero is actually visible, above the film, with contained images at ${width}px`, async ({ page }, info) => {
    const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 }); await page.goto("/en");
    await expect(page).toHaveTitle(/Mastiha Luxury Suites/);
    await expect(page.locator("h1")).toHaveText("Mastiha Luxury Suites");
    const hero = page.getByTestId("landing-hero");
    const image = page.getByTestId("hero-image");
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect.poll(() => page.evaluate(() => document.elementFromPoint(window.innerWidth / 2, window.innerHeight * .3)?.closest("#home") !== null)).toBe(true);
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector("#home")!.getBoundingClientRect(); const film = document.querySelector("#film")!.getBoundingClientRect();
      return { heroTop: hero.top, heroBottom: hero.bottom, filmTop: film.top, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, escaped: [...document.querySelectorAll<HTMLImageElement>('img[data-nimg="fill"]')].filter(image => {
        const parent=image.parentElement!; const p=parent.getBoundingClientRect(), r=image.getBoundingClientRect();
        const style=getComputedStyle(parent);
        const positioned=["relative","absolute","fixed","sticky"].includes(style.position);
        const clipped=[style.overflow,style.overflowX,style.overflowY].some(value=>value==="hidden"||value==="clip");
        const extendsOutside=r.left < p.left-2 || r.right > p.right+2 || r.top < p.top-2 || r.bottom > p.bottom+2;
        return !positioned || (!image.hasAttribute("data-parallax") && !clipped && extendsOutside);
      }).map(image=>image.getAttribute("alt")) };
    });
    expect(geometry.heroTop).toBe(0); expect(geometry.filmTop).toBeGreaterThanOrEqual(geometry.heroBottom-1); expect(geometry.overflow).toBe(false); expect(geometry.escaped).toEqual([]);
    await expect(hero.locator("header")).toBeVisible(); await expect(hero.getByRole("button",{name:/Check availability/})).toBeVisible();
    await hero.screenshot({ path:info.outputPath(`hero-${width}.png`) });
    await page.getByTestId("mastiha-dock").screenshot({path:info.outputPath(`dock-${width}.png`)});
    expect(errors).toEqual([]);
  });
}

test('gallery filters, zoom, keyboard navigation and focus restoration',async({page},info)=>{
 await page.goto('/en'); const gallery=page.locator('#gallery');
 await gallery.getByRole('button',{name:'Bedrooms',exact:true}).click(); await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(5);
 await gallery.getByRole('button',{name:'All spaces',exact:true}).click(); await expect(page.getByTestId('gallery-grid').locator('figure')).toHaveCount(6);
 const first=page.getByTestId('gallery-grid').getByRole('button').first(); await first.click();
 const lightbox=page.locator('.yarl__root'); await expect(lightbox).toBeVisible(); await expect(page.locator('.yarl__counter')).toContainText('7 / 24');
 await page.keyboard.press('ArrowRight'); await expect(page.locator('.yarl__counter')).toContainText('8 / 24');
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
  await page.goto(`/${locale}`);await expect(page.getByTestId('landing-hero')).toContainText(headline);await expect(page.locator('h1')).toHaveText('Mastiha Luxury Suites');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
  await expect(page.locator('header nav').last()).toBeVisible();
 }
});

test('server-rendered hero works when JavaScript is disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});const page=await context.newPage();
 await page.goto('/en');await expect(page.locator('h1')).toHaveText('Mastiha Luxury Suites');await expect(page.getByTestId('hero-image')).toBeVisible();await expect(page.locator('#reviews a')).toHaveCount(2);await context.close();
});

test('mobile hero copy is visible immediately and stays readable until late in the hero scroll', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');
  const hero = page.getByTestId('landing-hero');
  const copy = hero.locator('[data-hero-copy]');
  const discover = hero.locator('[data-hero-discover]');

  await expect(copy).toBeVisible();
  await expect(discover).toBeVisible();

  const initial = await copy.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(initial).toBeGreaterThanOrEqual(.98);

  // Reproduce the user's screenshot zone: hero is already moving upward but the
  // photographic tour has only just started to enter.
  await page.evaluate(() => window.scrollTo({ top: Math.round(innerHeight * .42), behavior: 'instant' }));
  await page.waitForTimeout(120);
  const mid = await copy.evaluate(element => Number(getComputedStyle(element).opacity));
  const discoverMid = await discover.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(mid).toBeGreaterThanOrEqual(.95);
  expect(discoverMid).toBeGreaterThanOrEqual(.95);

  await page.screenshot({ path: info.outputPath('hero-copy-early-390.png'), animations: 'disabled' });
});
