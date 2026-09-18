"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface SequenceCanvasHandle {
  setFrame: (index: number) => void;
  getFrameCount: () => number;
}

interface SequenceCanvasProps {
  onReady?: () => void;
}

export const SequenceCanvas = forwardRef<SequenceCanvasHandle, SequenceCanvasProps>(
  ({ onReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameCountRef = useRef<number>(120);
    const currentFrameRef = useRef<number>(0);
    const renderedFrameRef = useRef<number>(-1);
    const isReadyRef = useRef<boolean>(false);
    const rafIdRef = useRef<number | null>(null);

    const getFrameUrl = (index: number, isMobile: boolean) => {
      const frameNum = String(index + 1).padStart(4, "0");
      const basePath = isMobile ? "/sequence/mobile" : "/sequence/desktop";
      return `${basePath}/frame-${frameNum}.avif`;
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (!ctx) return;

      const isMobile = window.innerWidth < 768;
      const totalFrames = isMobile ? 80 : 120;
      frameCountRef.current = totalFrames;

      const images: HTMLImageElement[] = [];

      const drawImageCover = (img: HTMLImageElement) => {
        if (!canvas || !ctx) return;
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        if (!iw || !ih) return;

        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.drawImage(img, dx, dy, dw, dh);
      };

      const renderFrame = (targetIndex: number) => {
        const clamped = Math.max(0, Math.min(totalFrames - 1, targetIndex));
        let img = images[clamped];

        // If target frame is not yet loaded, find the closest loaded frame
        if (!img || !img.complete) {
          let found = false;
          for (let offset = 1; offset < totalFrames; offset++) {
            const down = clamped - offset;
            if (down >= 0 && images[down]?.complete) {
              img = images[down];
              found = true;
              break;
            }
            const up = clamped + offset;
            if (up < totalFrames && images[up]?.complete) {
              img = images[up];
              found = true;
              break;
            }
          }
          if (!found) return;
        }

        drawImageCover(img);
        renderedFrameRef.current = clamped;
      };

      // Set canvas display resolution (capped at 2 for performance)
      const updateCanvasSize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);

        if (renderedFrameRef.current >= 0) {
          renderFrame(renderedFrameRef.current);
        }
      };

      const resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserver.observe(canvas);
      updateCanvasSize();

      // Preload all frames into memory
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = getFrameUrl(i, isMobile);

        if (i === 0) {
          img.onload = () => {
            renderFrame(0);
            if (!isReadyRef.current) {
              isReadyRef.current = true;
              onReady?.();
            }
          };
        }

        // Modern browsers decode off-thread
        if ("decode" in img) {
          img.decode().catch(() => {});
        }

        images.push(img);
      }
      imagesRef.current = images;

      return () => {
        resizeObserver.disconnect();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        images.length = 0;
      };
    }, [onReady]);

    useImperativeHandle(
      ref,
      () => ({
        setFrame: (index: number) => {
          const total = frameCountRef.current;
          const clamped = Math.max(0, Math.min(total - 1, Math.round(index)));
          if (clamped === currentFrameRef.current) return;
          currentFrameRef.current = clamped;

          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
            if (!ctx) return;

            const images = imagesRef.current;
            let img = images[clamped];

            if (!img || !img.complete) {
              for (let offset = 1; offset < total; offset++) {
                const down = clamped - offset;
                if (down >= 0 && images[down]?.complete) {
                  img = images[down];
                  break;
                }
                const up = clamped + offset;
                if (up < total && images[up]?.complete) {
                  img = images[up];
                  break;
                }
              }
            }

            if (img && img.complete) {
              const cw = canvas.width;
              const ch = canvas.height;
              const iw = img.naturalWidth || img.width;
              const ih = img.naturalHeight || img.height;
              if (iw && ih) {
                const scale = Math.max(cw / iw, ch / ih);
                const dw = iw * scale;
                const dh = ih * scale;
                const dx = (cw - dw) / 2;
                const dy = (ch - dh) / 2;
                ctx.drawImage(img, dx, dy, dw, dh);
                renderedFrameRef.current = clamped;
              }
            }
          });
        },
        getFrameCount: () => frameCountRef.current,
      }),
      []
    );

    return (
      <div className="relative w-full h-full overflow-hidden bg-stone-950 select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block will-change-transform"
          aria-label="Interactive visual film of Mastiha Luxury Suites"
        />
        {/* Subtle dark vignette to integrate with adjacent sections */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950/70" />
      </div>
    );
  }
);

SequenceCanvas.displayName = "SequenceCanvas";
