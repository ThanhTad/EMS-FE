"use client";

import { useState, useRef, MouseEvent, WheelEvent, useCallback } from "react";

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

  const isPanning = useRef(false);
  const lastPointerPosition = useRef<Point>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Chức năng Zoom ---
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
    applyZoom(state.scale * 1.2, { x: width / 2, y: height / 2 });
  }, [state.scale, applyZoom]);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    applyZoom(state.scale / 1.2, { x: width / 2, y: height / 2 });
  }, [state.scale, applyZoom]);

  const resetTransform = useCallback(() => {
    setState({ scale: 1, position: { x: 0, y: 0 } });
  }, []);

  // --- Xử lý sự kiện chuột ---
  const onWheel = useCallback(
    (event: WheelEvent<SVGSVGElement>) => {
      event.preventDefault();
      const { deltaY, clientX, clientY } = event;
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const zoomCenter = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      const newScale = state.scale * (1 - deltaY * 0.001);
      applyZoom(newScale, zoomCenter);
    },
    [state.scale, applyZoom]
  );

  const onMouseDown = useCallback((event: MouseEvent<SVGSVGElement>) => {
    isPanning.current = true;
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onMouseMove = useCallback((event: MouseEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const dx = event.clientX - lastPointerPosition.current.x;
    const dy = event.clientY - lastPointerPosition.current.y;

    setState((prevState) => ({
      ...prevState,
      position: {
        x: prevState.position.x + dx,
        y: prevState.position.y + dy,
      },
    }));
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onMouseUpOrLeave = useCallback(() => {
    isPanning.current = false;
  }, []);

  // --- Trả về các props và hàm cần thiết ---
  return {
    svgRef,
    transform: `translate(${state.position.x}, ${state.position.y}) scale(${state.scale})`,
    zoomIn,
    zoomOut,
    resetTransform,
    panAndZoomHandlers: {
      onWheel,
      onMouseDown,
      onMouseMove,
      onMouseUp: onMouseUpOrLeave,
      onMouseLeave: onMouseUpOrLeave,
    },
  };
};
