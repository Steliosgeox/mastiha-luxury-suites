/**
 * The liquid-glass lens is an SVG displacement filter inside backdrop-filter.
 * Only Chromium paints that. WebKit parses url() there, so a CSS @supports
 * test passes (and the build adds a -webkit- copy of the test that Safari
 * passes too), then WebKit drops the whole backdrop filter, blur included:
 * Safari and every iOS browser were left with see-through panels.
 *
 * So the lens is switched on by an attribute instead of @supports. Stylesheets
 * scope every lens rule under `:root[data-glass-lens]`; every other engine
 * keeps the frosted blur it paints well. `userAgentData` exists only in
 * Chromium-based browsers, and a request for reduced transparency wins.
 */
export const GLASS_LENS_ATTRIBUTE = 'data-glass-lens';

type LensEnvironment = {
  navigator: object;
  supports?: (property: string, value: string) => boolean;
  reducedTransparency?: boolean;
};

export function paintsGlassLens({ navigator, supports, reducedTransparency }: LensEnvironment) {
  return 'userAgentData' in navigator && !reducedTransparency
    && Boolean(supports?.('backdrop-filter', 'url(#glass-lens-probe)'));
}

export function installGlassLens(root: HTMLElement = document.documentElement) {
  const enabled = paintsGlassLens({
    navigator,
    supports: typeof CSS !== 'undefined' ? CSS.supports.bind(CSS) : undefined,
    reducedTransparency: window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches,
  });
  root.toggleAttribute(GLASS_LENS_ATTRIBUTE, enabled);
}
