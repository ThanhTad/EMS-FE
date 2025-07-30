"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Path,
  Circle,
  Transformer,
  Rect,
  Line,
  Group,
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { SelectedObjectType, useDesignerStore } from "@/hooks/useDesignerStore";
import { DesignerSectionData, DesignerSeatData } from "@/types";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";

interface DesignerCanvasProps {
  sections: DesignerSectionData[];
  onAddSection: (newSection: Omit<DesignerSectionData, "id">) => void;
  onUpdateSection: (id: string, updates: Partial<DesignerSectionData>) => void;
  onUpdateSeat: (
    sectionId: string,
    seatId: string,
    updates: Partial<DesignerSeatData>
  ) => void;
}

// --- HELPER FUNCTIONS ---
function pointsToSvgPath(points: number[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length; i += 2) {
    path += ` L ${points[i]} ${points[i + 1]}`;
  }
  return path + " Z";
}

function translateSvgPath(svgPath: string, dx: number, dy: number): string {
  // Regex này tìm các lệnh M, L, C, etc. và áp dụng translation
  return svgPath.replace(
    /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g,
    (match, command, args) => {
      if ("MmLl".includes(command)) {
        // Chỉ translate các lệnh Move và Line
        const coords = args
          .trim()
          .split(/[\s,]+/)
          .map(parseFloat);
        let newArgs = "";
        for (let i = 0; i < coords.length; i += 2) {
          newArgs += `${coords[i] + dx},${coords[i + 1] + dy} `;
        }
        return `${command} ${newArgs.trim()}`;
      }
      return match; // Giữ nguyên các lệnh khác
    }
  );
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  sections,
  onAddSection,
  onUpdateSection,
  onUpdateSeat,
}) => {
  const { tool, selectedObjectIds, setSelectedObjects } = useDesignerStore();

  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [currentPointerPos, setCurrentPointerPos] = useState<Vector2d | null>(
    null
  );
  const [selectionRect, setSelectionRect] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    visible: false,
  });

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Effect to attach transformer to selected nodes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (tool === "select" && selectedObjectIds.length > 0) {
      const selectedNodes = selectedObjectIds
        .map((id) => stage.findOne(`#${id}`))
        .filter(Boolean);
      if (selectedNodes.length > 0) {
        trRef.current?.nodes(selectedNodes as Konva.Node[]);
      } else {
        trRef.current?.nodes([]);
      }
    } else {
      trRef.current?.nodes([]);
    }
  }, [selectedObjectIds, tool, sections]); // Re-run when sections update

  const getPos = (): Vector2d | null =>
    stageRef.current?.getPointerPosition() || null;

  // --- DRAWING LOGIC ---
  const handleMouseDownDraw = () => {
    if (tool !== "draw-zone") return;
    const pos = getPos();
    if (!pos) return;
    if (drawingPoints.length === 0) {
      setDrawingPoints([pos.x, pos.y]);
    }
  };

  const handleMouseMoveDraw = () => {
    if (tool !== "draw-zone" || drawingPoints.length === 0) return;
    setCurrentPointerPos(getPos());
  };

  const handleMouseClickDraw = () => {
    if (tool !== "draw-zone" || drawingPoints.length === 0) return;
    const pos = getPos();
    if (!pos) return;

    const [startX, startY] = drawingPoints;
    if (
      drawingPoints.length > 2 &&
      Math.hypot(pos.x - startX, pos.y - startY) < 15
    ) {
      const pathData = pointsToSvgPath(drawingPoints);
      onAddSection({
        name: `Khu vực ${sections.length + 1}`,
        capacity: 0,
        layoutData: {
          svgPath: pathData,
          style: {
            default: { fill: "#cae8ff", stroke: "#0064ff", strokeWidth: 1 },
            hover: { fill: "#a0d4ff" },
            selected: { stroke: "#0041a3", strokeWidth: 2 },
          },
        },
        seats: [],
      });
      setDrawingPoints([]);
      setCurrentPointerPos(null);
    } else {
      setDrawingPoints((prev) => [...prev, pos.x, pos.y]);
    }
  };

  // --- SELECTION LOGIC ---
  const handleMouseDownSelect = (e: KonvaEventObject<MouseEvent>) => {
    if (tool !== "select" || e.target !== e.target.getStage()) return;
    const pos = getPos();
    if (!pos) return;
    setSelectionRect({
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
      visible: true,
    });
    setSelectedObjects([], "none");
  };

  const handleMouseMoveSelect = () => {
    if (tool !== "select" || !selectionRect.visible) return;
    const pos = getPos();
    if (!pos) return;
    setSelectionRect((prev) => ({ ...prev, x2: pos.x, y2: pos.y }));
  };

  const handleMouseUpSelect = () => {
    if (tool !== "select" || !selectionRect.visible) return;
    setSelectionRect((prev) => ({ ...prev, visible: false }));

    const stage = stageRef.current;
    if (!stage) return;

    const box = {
      x: Math.min(selectionRect.x1, selectionRect.x2),
      y: Math.min(selectionRect.y1, selectionRect.y2),
      width: Math.abs(selectionRect.x1 - selectionRect.x2),
      height: Math.abs(selectionRect.y1 - selectionRect.y2),
    };

    if (box.width < 5 && box.height < 5) {
      setSelectedObjects([], "none");
      return;
    }

    const allShapes = stage.find("Path, Circle");
    const selectedNodes = allShapes.filter((shape) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
    );
    const selectedIds = selectedNodes.map((node) => node.id());

    let selectionType: SelectedObjectType = "none";
    if (selectedNodes.length > 0) {
      const hasSections = selectedNodes.some(
        (node) => node.nodeType === "Path"
      );
      const hasSeats = selectedNodes.some((node) => node.nodeType === "Circle");

      if (hasSections && hasSeats) {
        selectionType = "mixed"; // Có cả ghế và khu vực
      } else if (hasSections) {
        selectionType = "section"; // Chỉ có khu vực
      } else if (hasSeats) {
        selectionType = "seat"; // Chỉ có ghế
      }
    }
    setSelectedObjects(selectedIds, selectionType);
  };

  // --- EVENT ROUTING ---
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (tool === "draw-zone") handleMouseDownDraw();
    if (tool === "select") handleMouseDownSelect(e);
  };
  const handleStageMouseMove = () => {
    if (tool === "draw-zone") handleMouseMoveDraw();
    if (tool === "select") handleMouseMoveSelect();
  };
  const handleStageMouseUp = () => {
    if (tool === "draw-zone") handleMouseClickDraw();
    if (tool === "select") handleMouseUpSelect();
  };

  // Handle single shape click for selection
  const handleShapeClick = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>, id: string) => {
      if (tool !== "select") return;
      e.cancelBubble = true;

      const isSelected = selectedObjectIds.includes(id);
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

      let newIds: string[] = [...selectedObjectIds];

      if (!metaPressed) {
        // Click thường: chỉ chọn đối tượng này
        newIds = isSelected ? [] : [id];
      } else {
        // Click với Shift/Ctrl: thêm hoặc bớt
        if (isSelected) {
          newIds = newIds.filter((sid) => sid !== id);
        } else {
          newIds.push(id);
        }
      }

      // Logic xác định loại đối tượng mới
      let newType: SelectedObjectType = "none";
      if (newIds.length > 0) {
        const stage = stageRef.current;
        if (stage) {
          const selectedNodes = newIds
            .map((nid) => stage.findOne(`#${nid}`))
            .filter(Boolean);
          const hasSections = selectedNodes.some(
            (node) => node?.nodeType === "Path"
          );
          const hasSeats = selectedNodes.some(
            (node) => node?.nodeType === "Circle"
          );
          if (hasSections && hasSeats) newType = "mixed";
          else if (hasSections) newType = "section";
          else if (hasSeats) newType = "seat";
        }
      }

      setSelectedObjects(newIds, newType);
    },
    [tool, selectedObjectIds, setSelectedObjects]
  );

  // --- RENDER ---
  const selectionRectProps = {
    x: Math.min(selectionRect.x1, selectionRect.x2),
    y: Math.min(selectionRect.y1, selectionRect.y2),
    width: Math.abs(selectionRect.x1 - selectionRect.x2),
    height: Math.abs(selectionRect.y1 - selectionRect.y2),
    visible: selectionRect.visible,
  };

  return (
    <div
      className="w-full h-full bg-gray-200 p-4 overflow-auto cursor-crosshair data-[tool=select]:cursor-default"
      data-tool={tool}
    >
      <Stage
        ref={stageRef}
        width={1200}
        height={800}
        className="bg-white shadow-md"
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={(e) => {
          if (e.target === stageRef.current) setSelectedObjects([], "none");
        }}
      >
        <Layer>
          {sections.map((section) => (
            <Group key={section.id}>
              <Path
                id={section.id}
                data={section.layoutData.svgPath}
                fill={section.layoutData.style.default.fill}
                stroke={
                  selectedObjectIds.includes(section.id) ? "#3b82f6" : "#555"
                }
                strokeWidth={selectedObjectIds.includes(section.id) ? 2.5 : 1}
                onClick={(e) => handleShapeClick(e, section.id)}
                draggable={tool === "select"}
                onDragEnd={(e) => {
                  const dx = e.target.x();
                  const dy = e.target.y();
                  onUpdateSection(section.id, {
                    layoutData: {
                      ...section.layoutData,
                      svgPath: translateSvgPath(
                        section.layoutData.svgPath,
                        dx,
                        dy
                      ),
                    },
                  });
                  e.target.position({ x: 0, y: 0 });
                }}
              />
              {section.seats.map((seat) => (
                <Circle
                  key={seat.id}
                  id={seat.id}
                  x={seat.coordinates.x}
                  y={seat.coordinates.y}
                  radius={8}
                  fill="#34d399"
                  stroke={
                    selectedObjectIds.includes(seat.id) ? "#3b82f6" : "#15803d"
                  }
                  strokeWidth={selectedObjectIds.includes(seat.id) ? 2.5 : 1}
                  onClick={(e) => handleShapeClick(e, seat.id)}
                  draggable={tool === "select"}
                  onDragEnd={(e) => {
                    onUpdateSeat(section.id, seat.id, {
                      coordinates: { x: e.target.x(), y: e.target.y() },
                    });
                  }}
                />
              ))}
            </Group>
          ))}

          {/* Visual feedback for drawing */}
          {drawingPoints.length > 0 && (
            <Line
              points={[
                ...drawingPoints,
                currentPointerPos?.x || drawingPoints[drawingPoints.length - 2],
                currentPointerPos?.y || drawingPoints[drawingPoints.length - 1],
              ]}
              stroke="#3b82f6"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
              dash={[10, 5]}
              listening={false}
            />
          )}

          <Rect
            {...selectionRectProps}
            fill="rgba(0, 160, 255, 0.3)"
            stroke="#007bff"
            strokeWidth={1}
            listening={false}
          />
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
};
