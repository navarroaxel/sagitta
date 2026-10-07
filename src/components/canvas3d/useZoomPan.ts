import { useCallback, useEffect, useRef, useState, type RefObject, type MouseEvent } from "react";
import { ZOOM_MIN, ZOOM_MAX } from "@/components/canvas/constants";

const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

// Zoom (wheel, towards the cursor; buttons, towards the centre) and pan (drag) for an SVG whose
// viewBox is w × h but which may be displayed at another size. Same behaviour as the 2D canvas.
export function useZoomPan(ref: RefObject<SVGSVGElement | null>, w: number, h: number) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panning = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const panRef = useRef(pan);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // client px -> viewBox units
  const scaleOf = useCallback(
    (el: SVGSVGElement) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 ? w / r.width : 1;
    },
    [w],
  );

  // non-passive wheel listener so the page does not scroll while zooming
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const r = el.getBoundingClientRect();
      const s = scaleOf(el);
      const cx = (e.clientX - r.left) * s;
      const cy = (e.clientY - r.top) * s;
      setZoom((prev) => {
        const next = clampZoom(prev * factor);
        const ratio = next / prev;
        setPan((p) => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
        return next;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [ref, scaleOf]);

  const zoomBy = useCallback(
    (factor: number) => {
      setZoom((prev) => {
        const next = clampZoom(prev * factor);
        const ratio = next / prev;
        const cx = w / 2,
          cy = h / 2;
        setPan((p) => ({ x: cx - (cx - p.x) * ratio, y: cy - (cy - p.y) * ratio }));
        return next;
      });
    },
    [w, h],
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handlers = {
    onMouseDown: (e: MouseEvent) => {
      panning.current = { x: e.clientX, y: e.clientY, px: panRef.current.x, py: panRef.current.y };
      if (ref.current) ref.current.style.cursor = "grabbing";
    },
    onMouseMove: (e: MouseEvent) => {
      const p = panning.current;
      if (!p || !ref.current) return;
      const s = scaleOf(ref.current);
      setPan({ x: p.px + (e.clientX - p.x) * s, y: p.py + (e.clientY - p.y) * s });
    },
    onMouseUp: () => {
      panning.current = null;
      if (ref.current) ref.current.style.cursor = "grab";
    },
  };

  return { zoom, pan, zoomBy, reset, handlers };
}
