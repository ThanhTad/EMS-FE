"use client";

import { useState, useRef, useCallback, useEffect, MouseEvent } from "react";

interface Point {
  x: number;
  y: number;
}

interface PanAndZoomState {
  scale: number;
  position: Point;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

export const usePanAndZoom = () => {
  const [state, setState] = useState<PanAndZoomState>({
    scale: 1,
    position: { x: 0, y: 0 },
  });

  const [isDragging, setIsDragging] = useState(false);
  const isPanning = useRef(false);
  const isZoomActive = useRef(false);
  const lastPointerPosition = useRef<Point>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const applyZoom = useCallback((newScale: number, zoomCenter: Point) => {
    setState((prevState) => {
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const scaleFactor = clampedScale / prevState.scale;

      const newX =
        zoomCenter.x - (zoomCenter.x - prevState.position.x) * scaleFactor;
      const newY =
        zoomCenter.y - (zoomCenter.y - prevState.position.y) * scaleFactor;

      return {
        scale: clampedScale,
        position: { x: newX, y: newY },
      };
    });
  }, []);

  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    setState((prev) => {
      const newScale = prev.scale * 1.2;
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const factor = clamped / prev.scale;
      const newX = width / 2 - (width / 2 - prev.position.x) * factor;
      const newY = height / 2 - (height / 2 - prev.position.y) * factor;

      return {
        scale: clamped,
        position: { x: newX, y: newY },
      };
    });
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    setState((prev) => {
      const newScale = prev.scale / 1.2;
      const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
      const factor = clamped / prev.scale;
      const newX = width / 2 - (width / 2 - prev.position.x) * factor;
      const newY = height / 2 - (height / 2 - prev.position.y) * factor;

      return {
        scale: clamped,
        position: { x: newX, y: newY },
      };
    });
  }, []);

  const resetTransform = useCallback(() => {
    setState({ scale: 1, position: { x: 0, y: 0 } });
  }, []);

  const onClick = useCallback(() => {
    isZoomActive.current = true;
  }, []);

  const onMouseDown = useCallback((event: MouseEvent<SVGSVGElement>) => {
    isPanning.current = true;
    setIsDragging(true);
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onMouseMove = useCallback((event: MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const dx = event.clientX - lastPointerPosition.current.x;
    const dy = event.clientY - lastPointerPosition.current.y;

    setState((prev) => ({
      ...prev,
      position: {
        x: prev.position.x + dx,
        y: prev.position.y + dy,
      },
    }));
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onMouseUpOrLeave = useCallback(() => {
    isPanning.current = false;
    setIsDragging(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    isZoomActive.current = false;
    isPanning.current = false;
    setIsDragging(false);
  }, []);

  // ✅ Native wheel listener with passive: false to prevent page scroll
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (event: WheelEvent) => {
      if (!isZoomActive.current) return;

      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const zoomCenter = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const newScale = state.scale * (1 - event.deltaY * 0.001);
      applyZoom(newScale, zoomCenter);
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      svg.removeEventListener("wheel", handleWheel);
    };
  }, [applyZoom, state.scale]);

  return {
    svgRef,
    transform: `translate(${state.position.x}, ${state.position.y}) scale(${state.scale})`,
    zoomIn,
    zoomOut,
    resetTransform,
    cursor: isDragging ? "grabbing" : "grab",
    panAndZoomHandlers: {
      onClick,
      onMouseDown,
      onMouseMove,
      onMouseUp: onMouseUpOrLeave,
      onMouseLeave,
    },
  };
};
