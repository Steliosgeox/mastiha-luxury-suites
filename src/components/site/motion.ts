"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
  Page choreography. Sections opt in with data attributes, so markup stays readable and
  everything renders complete without JavaScript or with reduced motion:

    data-hero / data-hero-media / data-hero-title / data-hero-fade   hero entrance and exit
    data-split          heading: lines rise from a mask when scrolled into view
    data-split-chars    display word: letters rise one by one
    data-reveal         block fades up
    data-stagger        direct children fade up one after another
    data-photo-reveal   photo frame opens from a clipped inset
    data-parallax       image drifts inside its frame
    data-speed="0.2"    element moves at a different speed (layered parallax)
    data-count="75"     number counts up (data-decimals for scores)
    data-rule           eyebrow rule draws in
    data-horizontal     pinned horizontal track on wide screens (data-track = the track)
    data-magnetic       button follows the pointer slightly
*/

gsap.registerPlugin(ScrollTrigger, SplitText);

export function useSiteMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const media = gsap.matchMedia();
    const all = <T extends HTMLElement = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, scope);

    media.add("(prefers-reduced-motion: no-preference)", context => {
      heroEntrance(scope);
      heroExit(scope);

      // Everything below the hero is set up in small slices with the browser free in between,
      // so a phone can paint and respond while the page's motion is being prepared.
      const steps: (() => void)[] = [];
      const queue = <T extends HTMLElement>(selector: string, setup: (element: T) => void) => {
        for (const element of all<T>(selector)) steps.push(() => setup(element));
      };

      queue("[data-split]", heading => {
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: self => gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.05,
            stagger: .09,
            ease: "expo.out",
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
          }),
        });
      });

      queue("[data-split-chars]", word => {
        SplitText.create(word, {
          type: "chars",
          mask: "chars",
          onSplit: self => gsap.from(self.chars, {
            yPercent: 100,
            duration: 1.4,
            stagger: .05,
            ease: "expo.out",
            scrollTrigger: { trigger: word, start: "top 95%", once: true },
          }),
        });
      });

      queue("[data-rule]", rule => {
        gsap.fromTo(rule, { "--rule": 0 }, { "--rule": 1, duration: .9, ease: "power3.inOut", scrollTrigger: { trigger: rule, start: "top 90%", once: true } });
      });

      queue("[data-reveal]", block => {
        gsap.from(block, { y: 32, autoAlpha: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: block, start: "top 88%", once: true } });
      });

      queue("[data-stagger]", group => {
        gsap.from(group.children, { y: 24, autoAlpha: 0, duration: .7, stagger: .06, ease: "power3.out", scrollTrigger: { trigger: group, start: "top 85%", once: true } });
      });

      queue("[data-photo-reveal]", frame => {
        const image = frame.querySelector("img");
        const reveal = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 90%", once: true } });
        reveal.fromTo(frame, { clipPath: "inset(8% 6% 8% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.out" });
        if (image) reveal.fromTo(image, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0);
      });

      queue("[data-parallax]", image => {
        gsap.fromTo(image, { yPercent: -6, scale: 1.14 }, {
          yPercent: 6,
          scale: 1.14,
          ease: "none",
          scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      queue("[data-speed]", layer => {
        const speed = Number(layer.dataset.speed) || 0;
        gsap.to(layer, { yPercent: -speed * 100, ease: "none", scrollTrigger: { trigger: layer, start: "top bottom", end: "bottom top", scrub: true } });
      });

      queue("[data-count]", countUp);

      let cancelled = false;
      let wide: gsap.MatchMedia | undefined;
      void (async () => {
        while (steps.length) {
          await yieldToBrowser();
          if (cancelled) return;
          // Work for a few milliseconds per slice; the context records the animations so they revert with it.
          const until = performance.now() + 12;
          context.add(() => { while (steps.length && performance.now() < until) steps.shift()!(); });
        }
        // The pinned family track comes last, as it always has: ScrollTrigger measures in the order
        // things are created, and a pin made before the sections above it would land in the wrong place.
        wide = gsap.matchMedia();
        wide.add("(min-width: 900px)", () => horizontal(all("[data-horizontal]")));
        ScrollTrigger.refresh();
      })();
      return () => { cancelled = true; wide?.revert(); };
    });

    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = all("[data-magnetic]").map(magnetic);
      return () => cleanups.forEach(cleanup => cleanup());
    });

    // Anything that changes the page's height after the triggers were measured (the photo tour
    // switching on, late images, fonts) moves every section below it, and a pin measured before
    // that would start in the wrong place. Re-measure whenever the height really changes.
    let height = scope.offsetHeight;
    let pending = 0;
    const heightChanged = new ResizeObserver(() => {
      if (Math.abs(scope.offsetHeight - height) < 2) return;
      height = scope.offsetHeight;
      clearTimeout(pending);
      pending = window.setTimeout(() => { ScrollTrigger.refresh(); height = scope.offsetHeight; }, 120);
    });
    heightChanged.observe(scope);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => { heightChanged.disconnect(); clearTimeout(pending); media.revert(); };
  }, [root]);
}

// The family photographs travel sideways while the section is pinned (wide screens only;
// phones get a native swipe carousel from CSS scroll snapping).
function horizontal(sections: HTMLElement[]) {
  for (const section of sections) {
    const track = section.querySelector<HTMLElement>("[data-track]");
    if (!track) continue;
    const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
    gsap.to(track.children, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: .6, invalidateOnRefresh: true },
    });
  }
}

/** Lets the browser paint and handle input before the next slice of work. */
function yieldToBrowser(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return scheduler?.yield ? scheduler.yield() : new Promise(resolve => setTimeout(resolve, 0));
}

function heroEntrance(scope: HTMLElement) {
  const media = scope.querySelector("[data-hero-media]");
  const title = scope.querySelector<HTMLElement>("[data-hero-title]");
  const fades = scope.querySelectorAll("[data-hero-fade]");
  const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
  if (media) timeline.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 2.2 }, 0);
  if (title) {
    const split = SplitText.create(title, { type: "words", mask: "words" });
    timeline.from(split.words, { yPercent: 110, duration: 1.3, stagger: .08 }, .15);
  }
  if (fades.length) timeline.from(fades, { y: 16, autoAlpha: 0, duration: 1, stagger: .07 }, .35);
}

// As the hero scrolls away, the full-bleed photograph settles into a rounded card on white.
function heroExit(scope: HTMLElement) {
  const hero = scope.querySelector<HTMLElement>("[data-hero]");
  const frame = hero?.querySelector<HTMLElement>("[data-hero-frame]");
  const media = hero?.querySelector<HTMLElement>("[data-hero-media]");
  if (!hero || !frame || !media) return;
  const exit = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  exit.fromTo(frame, { clipPath: "inset(0% 0% 0% 0% round 0px)" }, { clipPath: "inset(5% 3.5% 12% 3.5% round 28px)", ease: "none" }, 0);
  exit.to(media, { yPercent: 12, ease: "none" }, 0);
}

function countUp(element: HTMLElement) {
  const target = Number(element.dataset.count);
  const decimals = Number(element.dataset.decimals ?? 0);
  if (!Number.isFinite(target)) return;
  const final = element.textContent ?? "";
  const separator = final.includes(",") ? "," : ".";
  const value = { n: 0 };
  gsap.to(value, {
    n: target,
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: { trigger: element, start: "top 92%", once: true },
    onUpdate: () => { element.textContent = value.n.toFixed(decimals).replace(".", separator); },
    onComplete: () => { element.textContent = final; },
  });
}

function magnetic(element: HTMLElement) {
  const x = gsap.quickTo(element, "x", { duration: .45, ease: "power3.out" });
  const y = gsap.quickTo(element, "y", { duration: .45, ease: "power3.out" });
  const move = (event: PointerEvent) => {
    const box = element.getBoundingClientRect();
    x((event.clientX - box.left - box.width / 2) * .18);
    y((event.clientY - box.top - box.height / 2) * .18);
  };
  const leave = () => { x(0); y(0); };
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerleave", leave);
  return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", leave); gsap.set(element, { x: 0, y: 0 }); };
}
