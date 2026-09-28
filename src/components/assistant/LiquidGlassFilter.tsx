/**
 * The hidden SVG <filter> that drives the liquid glass refraction.
 *
 * Adapted from LeonardSEO/liquid-glass-react (MIT), which is the technique
 * written down properly:
 * https://github.com/LeonardSEO/liquid-glass-react
 *
 * Two things it gets right that the previous local version did not, and both
 * were the cause of real faults on this panel:
 *
 * `scale` is in PIXELS. There is no primitiveUnits="objectBoundingBox" here, so
 * the bend is a plain pixel distance instead of a fraction of the element. The
 * fractional form meant the displacement grew with the panel and, at the values
 * that looked right on a small control, pulled pixels from beyond the filter
 * region -- which is why bands of unfiltered page showed through the glass.
 * Negative, because a positive scale gives a fish-eye pinch rather than a
 * magnifying lens.
 *
 * The map is a static image, not something generated at paint time. The earlier
 * version built two SVG gradients and combined them with feBlend, which has to
 * be rasterised on every repaint inside a backdrop-filter; a PNG is decoded once
 * and cached like any other image, so the filter costs no more per frame than
 * the blur it sits next to. That regression is what made the page lag.
 *
 * The map itself must be baked for the shape it covers. It is a signed distance
 * field of the rounded rectangle, so the bend follows the silhouette and rises
 * only at the rim. Regenerate it when the panel's proportions or radius change:
 *
 *   python3 scripts/generate-displacement-map.py \
 *     --width 368 --height 382 --radius 18 --mode sdf \
 *     --output frontend/public/account-lens-map.png
 *
 * A plain linear gradient is NOT a substitute. It shears the whole element
 * uniformly instead of bending the rim, which upstream calls the single most
 * common mistake in reproducing this effect -- correctly, because it was made
 * here first.
 *
 * Applied through `backdrop-filter`, never `filter`, so it distorts the
 * background and leaves the content sharp. A menu that bends the email address
 * it is showing you is a bug, however good it looks in a demo.
 */

type LiquidGlassFilterProps = {
  /** Filter id, referenced from CSS as `url(#id)`. */
  id: string;
  /** Displacement map baked for this element's shape. */
  mapSrc?: string;
  /** Bend distance in px. Must be negative for a magnifying lens. */
  scale?: number;
  /**
   * Colour fringing at the rim, from running the displacement once per channel.
   * It is what sells real glass up close, and it is three displacement passes
   * instead of one. Off by default here: this panel is large, and the backdrop
   * behind it is a playing video.
   */
  chromaticAberration?: boolean;
};

export const LiquidGlassFilter = ({
  id,
  mapSrc = '/account-lens-map.png',
  scale = -42,
  chromaticAberration = false,
}: LiquidGlassFilterProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    className="liquid-glass-filter"
    style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
  >
    {/*
      The region is clamped to the element box. A filter defaults to -10%/120%,
      but the map covers 0-100% only, and in that outer band transparent black
      reads as R0/G0 -- a full negative offset rather than none -- so the
      backdrop jumps at the map edge and draws a rectangle inside the glass.
    */}
    <filter id={id} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
      <feImage href={mapSrc} preserveAspectRatio="none" x="0" y="0" width="100%" height="100%" result="map" />

      {chromaticAberration ? (
        <>
          <feDisplacementMap in="SourceGraphic" in2="map" scale={scale - 2} xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="dR" />

          <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="dG" />

          <feDisplacementMap in="SourceGraphic" in2="map" scale={scale + 2} xChannelSelector="R" yChannelSelector="G" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="dB" />

          <feBlend in="dR" in2="dG" mode="screen" result="dRG" />
          <feBlend in="dRG" in2="dB" mode="screen" />
        </>
      ) : (
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      )}
    </filter>
  </svg>
);

export default LiquidGlassFilter;
