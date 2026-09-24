import type { SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement>;

export function AirbnbMark(props: SvgProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z"/>
  </svg>;
}

export function BookingMark(props: SvgProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M24 0H0v24h24ZM8.575 6.563h2.658c2.108 0 3.473 1.15 3.473 2.898 0 1.15-.575 1.82-.91 2.108l-.287.263.335.192c.815.479 1.318 1.389 1.318 2.395 0 1.988-1.51 3.257-3.857 3.257H7.449V7.713c0-.623.503-1.126 1.126-1.15zm1.7 1.868c-.479.024-.694.264-.694.79v1.893h1.676c.958 0 1.294-.743 1.294-1.365 0-.815-.503-1.318-1.318-1.318zm-.096 4.36c-.407.071-.598.31-.598.79v2.251h1.868c.934 0 1.509-.55 1.509-1.533 0-.934-.599-1.509-1.51-1.509zm7.737 2.394c.743 0 1.341.599 1.341 1.342a1.34 1.34 0 0 1-1.341 1.341 1.355 1.355 0 0 1-1.341-1.341c0-.743.598-1.342 1.34-1.342z"/>
  </svg>;
}

export function StarMark(props: SvgProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="m12 2.9 2.72 5.51 6.08.88-4.4 4.29 1.04 6.06L12 16.78l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.88L12 2.9Z"/>
  </svg>;
}

export type StayGlyphName =
  | "parking" | "wifi" | "climate" | "kitchen" | "laundry" | "tv" | "outdoor" | "soundproof"
  | "cot" | "family" | "free";

export function StayGlyph({ name, ...props }: SvgProps & { name: StayGlyphName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.45, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "parking") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M7 20V4h6.1a4.4 4.4 0 0 1 0 8.8H7M9.5 7h3.2a1.6 1.6 0 0 1 0 3.2H9.5"/></svg>;
  if (name === "wifi") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M4.4 9.2a11.2 11.2 0 0 1 15.2 0M7.4 12.3a7 7 0 0 1 9.2 0M10.3 15.4a2.8 2.8 0 0 1 3.4 0"/><circle cx="12" cy="18.2" r=".8" fill="currentColor"/></svg>;
  if (name === "climate") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M12 3v18M7.5 5.6 12 8.2l4.5-2.6M7.5 18.4 12 15.8l4.5 2.6M4.2 8.1l15.6 7.8M4.2 15.9l15.6-7.8"/></svg>;
  if (name === "kitchen") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M5 4v7M8 4v7M5 8h3M6.5 11v9M16.5 4c-2.2 2.5-2.4 6.5 0 8.2V20M16.5 4v8.2"/></svg>;
  if (name === "laundry") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><rect {...common} x="5" y="3.5" width="14" height="17" rx="1.5"/><circle {...common} cx="12" cy="13" r="4.1"/><path {...common} d="M8 7h.01M11 7h3"/></svg>;
  if (name === "tv") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><rect {...common} x="3.5" y="5.5" width="17" height="12" rx="1.5"/><path {...common} d="m9 21 3-3 3 3M9 2.5l3 3 3-3"/></svg>;
  if (name === "outdoor") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M4 19h16M6 19V9h12v10M8.5 9V6h7v3M9 13h6M12 13v6"/></svg>;
  if (name === "soundproof") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M5 9v6h4l5 4V5L9 9H5M17 9.5c1 1.5 1 3.5 0 5M19.5 7c2.2 3 2.2 7 0 10"/></svg>;
  if (name === "cot") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path {...common} d="M4 8v9M20 8v9M4 11h16M6 11V7.5h7.5a3 3 0 0 1 3 3V11M5 17h14M7 17l-1 3M17 17l1 3"/></svg>;
  if (name === "family") return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle {...common} cx="8" cy="7" r="2.2"/><circle {...common} cx="16.5" cy="8" r="1.8"/><path {...common} d="M3.8 18c.4-4 2-6 4.2-6s3.8 2 4.2 6M13 18c.3-3.1 1.5-4.7 3.5-4.7 1.8 0 3.1 1.6 3.5 4.7"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><circle {...common} cx="12" cy="12" r="8.5"/><path {...common} d="m8.3 12.2 2.3 2.3 5.2-5.3"/></svg>;
}
