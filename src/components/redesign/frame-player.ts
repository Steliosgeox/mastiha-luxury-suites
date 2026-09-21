export type FrameVariant = { frameCount: number; width: number; height: number; basePath: string; filePattern: string };
export type FrameManifest = { desktop: FrameVariant; mobile: FrameVariant };
export function parseFrameManifest(input: unknown): FrameManifest {
  if (!input || typeof input !== "object") throw new Error("Invalid film manifest");
  const value = input as Record<string, unknown>;
  const variant = (input: unknown): FrameVariant => {
    if (!input || typeof input !== "object") throw new Error("Missing film variant");
    const v = input as Record<string, unknown>;
    if (!Number.isInteger(v.frameCount) || Number(v.frameCount) < 1 || Number(v.frameCount) > 500 || !Number.isInteger(v.width) || Number(v.width) < 1 || Number(v.width) > 4096 || !Number.isInteger(v.height) || Number(v.height) < 1 || Number(v.height) > 4096 || typeof v.basePath !== "string" || !/^\/sequence\/(desktop|mobile)$/.test(v.basePath) || v.filePattern !== "frame-%04d.avif") throw new Error("Unsupported film variant");
    return { frameCount: Number(v.frameCount), width: Number(v.width), height: Number(v.height), basePath: v.basePath, filePattern: v.filePattern };
  };
  return { desktop: variant(value.desktop), mobile: variant(value.mobile) };
}
export function progressFrame(progress: number, count: number): number {
  return Math.round(Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * Math.max(0, count - 1));
}
export function frameUrl(variant: FrameVariant, index: number): string {
  return `${variant.basePath}/frame-${String(Math.max(0, Math.min(variant.frameCount - 1, Math.round(index))) + 1).padStart(4, "0")}.avif`;
}
export function desiredFrames(target: number, count: number, limit: number, direction: number): number[] {
  if (count < 1 || limit < 1) return [];
  const center = Math.max(0, Math.min(count - 1, Math.round(target)));
  const result = [center]; const step = direction < 0 ? -1 : 1;
  for (let offset = 1; result.length < Math.min(count, limit); offset++) {
    for (const index of [center + offset * step, center - offset * step]) if (index >= 0 && index < count && result.length < limit) result.push(index);
  }
  return result;
}
export function fittedRect(cw: number, ch: number, iw: number, ih: number, contain: boolean) {
  const scale = (contain ? Math.min : Math.max)(cw / iw, ch / ih);
  return { x: (cw - iw * scale) / 2, y: (ch - ih * scale) / 2, width: iw * scale, height: ih * scale };
}
type DecodedFrame = { source: CanvasImageSource; width: number; height: number; close: () => void };
async function decodeFrame(url: string, signal: AbortSignal): Promise<DecodedFrame> {
  const response = await fetch(url, { signal, cache: "force-cache" });
  if (!response.ok) throw new Error(`Film frame HTTP ${response.status}`);
  const blob = await response.blob();
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      if (signal.aborted) { bitmap.close(); throw new DOMException("Aborted", "AbortError"); }
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch (error) { if (signal.aborted) throw error; }
  }
  const objectUrl = URL.createObjectURL(blob); const image = new Image();
  try {
    image.src = objectUrl; await image.decode();
    if (signal.aborted || !image.naturalWidth) throw new Error("Film decode failed");
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => { image.removeAttribute("src"); URL.revokeObjectURL(objectUrl); } };
  } catch (error) { URL.revokeObjectURL(objectUrl); throw error; }
}

/** Decode only a window around the requested frame; paint on decode even after scrolling stops. */
export function createFramePlayer(canvas: HTMLCanvasElement, variant: FrameVariant, options: { mobile: boolean; onError: () => void }) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas unavailable");
  const budget = (options.mobile ? 16 : 32) * 1024 * 1024;
  const capacity = Math.max(2, Math.min(10, Math.floor(budget / (variant.width * variant.height * 4))));
  const cache = new Map<number, DecodedFrame>();
  const pending = new Map<number, AbortController>();
  const failed = new Set<number>();
  let queue: number[] = [], target = 0, direction = 1, disposed = false, painted = -1, paintRequest = 0, ready = false;
  const stats = () => { canvas.dataset.cached = String(cache.size); canvas.dataset.pending = String(pending.size); };
  function paint() {
    paintRequest = 0;
    if (disposed || !cache.size) return;
    const nearest = [...cache.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
    if (painted === nearest) return;
    const frame = cache.get(nearest)!;
    const rect = fittedRect(canvas.width, canvas.height, frame.width, frame.height, options.mobile);
    context!.fillStyle = "#233429"; context!.fillRect(0, 0, canvas.width, canvas.height);
    context!.drawImage(frame.source, rect.x, rect.y, rect.width, rect.height);
    painted = nearest; ready = true; canvas.dataset.ready = "true"; canvas.dataset.frame = String(nearest);
  }
  function schedulePaint() { if (!disposed && !paintRequest) paintRequest = requestAnimationFrame(paint); }
  function pump() {
    if (disposed) return;
    while (pending.size < 2 && queue.length) {
      const index = queue.shift()!;
      if (cache.has(index) || pending.has(index) || failed.has(index)) continue;
      const controller = new AbortController(); pending.set(index, controller);
      const timeout = setTimeout(() => controller.abort(), 10000);
      void decodeFrame(frameUrl(variant, index), controller.signal).then((frame) => {
        if (disposed || controller.signal.aborted) { frame.close(); return; }
        cache.set(index, frame);
        const farthestFirst = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target));
        let bytes = [...cache.values()].reduce((sum, item) => sum + item.width * item.height * 4, 0);
        while ((cache.size > capacity || bytes > budget) && cache.size > 1) {
          const remove = farthestFirst.shift()!; const old = cache.get(remove)!;
          bytes -= old.width * old.height * 4; old.close(); cache.delete(remove);
        }
        schedulePaint();
      }).catch(() => { if (!disposed && !controller.signal.aborted) failed.add(index); }).finally(() => {
        clearTimeout(timeout); pending.delete(index); if (disposed) return;
        stats(); pump();
        if ((!ready && !pending.size && !queue.length && !cache.size) || failed.size >= 5) options.onError();
      });
    }
    stats();
  }
  function seek(progress: number) {
    const next = progressFrame(progress, variant.frameCount);
    if (next !== target) direction = next > target ? 1 : -1;
    target = next; canvas.dataset.target = String(target);
    for (const [index, controller] of pending) if (Math.abs(index - target) > capacity * 2) controller.abort();
    queue = desiredFrames(target, variant.frameCount, capacity, direction).filter((index) => !cache.has(index) && !pending.has(index) && !failed.has(index));
    schedulePaint(); pump();
  }
  function resize() {
    const box = canvas.getBoundingClientRect(); if (!box.width || !box.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.round(box.width * dpr), height = Math.round(box.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; painted = -1; schedulePaint(); }
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  return { seek, dispose() { disposed = true; observer.disconnect(); cancelAnimationFrame(paintRequest); for (const controller of pending.values()) controller.abort(); for (const frame of cache.values()) frame.close(); cache.clear(); queue = []; } };
}
