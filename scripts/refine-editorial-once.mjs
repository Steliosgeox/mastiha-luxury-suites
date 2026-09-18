import fs from 'node:fs';
if (process.env.GITHUB_REF !== 'refs/heads/design/editorial-mastiha') throw new Error('This one-time repair is restricted to the editorial branch.');
function replace(path, from, to, expected = 1) {
  const text = fs.readFileSync(path, 'utf8');
  const count = text.split(from).length - 1;
  if (count !== expected) throw new Error(`${path}: expected ${expected} anchored matches, got ${count}`);
  fs.writeFileSync(path, text.split(from).join(to));
}
replace('src/components/redesign/StayFilm.tsx', 'visible = entry.isIntersecting;', 'visible = entry.isIntersecting && entry.intersectionRatio >= .001;');
replace('src/components/redesign/StayFilm.tsx', '{ rootMargin: "0px", threshold: 0 }', '{ rootMargin: "0px", threshold: [0, .001] }');
replace('src/components/redesign/StayExperience.tsx', 'type ReactNode, type MouseEvent }', 'type ReactNode, type MouseEvent, type KeyboardEvent }');
replace('src/components/redesign/StayExperience.tsx', '  const navigate = (target: string) => scrollTo(target, { offset: 0 });', `  const trapBookingFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const element = event.currentTarget;
    const controls = [...element.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')].filter(control => control.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (!first || !last) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !element.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const navigate = (target: string) => scrollTo(target, { offset: 0 });`);
replace('src/components/redesign/StayExperience.tsx', 'aria-describedby="booking-description" data-lenis-prevent', 'aria-describedby="booking-description" onKeyDown={trapBookingFocus} data-lenis-prevent');
replace('tests/dock.spec.ts', 'page.getByRole("dialog", { name: "Choose a booking platform" })', 'page.getByRole("dialog", { name: "Your stay starts here." })');
replace('src/components/redesign/MastihaOdisej.tsx', 'fill priority sizes="100vw" className={s.heroImage}', 'fill priority sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" className={s.heroImage}');
replace('src/components/redesign/MastihaOdisej.tsx', 'fill sizes="100vw" className={s.sceneImage}', 'fill sizes="(max-width: 760px) 130vh, 100vw" className={s.sceneImage}', 2);
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.dependencies.next = '15.5.25';
pkg.devDependencies['eslint-config-next'] = '15.5.25';
pkg.devDependencies.sharp = '0.35.4';
pkg.devDependencies.postcss = '8.5.28';
pkg.overrides = { ...(pkg.overrides ?? {}), postcss: '$postcss', sharp: '$sharp' };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('Applied explicit film, focus, responsive image and same-major security fixes.');
