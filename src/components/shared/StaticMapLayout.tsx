// components/seating/StaticMapLayout.tsx
"use client";

import {
  ReservedSeatingData,
  ZonedAdmissionData,
  Section,
  StageLayout,
} from "@/types";
import React, { FC } from "react";

// --- Sub-component cho Sân khấu (giữ nguyên logic cũ) ---
const StageRenderer: FC<{ stage?: StageLayout }> = React.memo(({ stage }) => {
  if (!stage?.svgPath) return null;
  const coords = stage.svgPath.match(
    /M ([\d.]+) ([\d.]+) H ([\d.]+) V ([\d.]+) H ([\d.]+) Z/
  );
  if (!coords) return null;
  const x = parseFloat(coords[1]);
  const y = parseFloat(coords[2]);
  const width = parseFloat(coords[3]) - x;
  const height = parseFloat(coords[4]) - y;
  const label = stage.label || "SÂN KHẤU";
  const labelX = x + width / 2;
  const labelY = y + height / 2;

  return (
    <g key="stage" className="cursor-default">
      <path
        d={stage.svgPath}
        fill={stage.style?.fill || "#333"}
        stroke={stage.style?.stroke || "#000"}
        strokeWidth="1"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        alignmentBaseline="middle"
        className="text-base font-bold fill-white pointer-events-none"
      >
        {label.toUpperCase()}
      </text>
    </g>
  );
});
StageRenderer.displayName = "StageRenderer";

// --- Sub-component cho Đường bao khu vực (giữ nguyên logic cũ) ---
const SectionShapeRenderer: FC<{ section: Section }> = React.memo(
  ({ section }) => {
    const { layoutData, name } = section;
    if (!layoutData?.svgPath) return null;

    return (
      <g>
        <path
          d={layoutData.svgPath}
          fill={layoutData.style?.fill || "rgba(230, 240, 255, 0.4)"}
          stroke="rgba(150, 180, 220, 0.6)"
          strokeWidth="1"
          style={{ pointerEvents: "none" }}
        />
        {layoutData.labelPosition && (
          <text
            x={layoutData.labelPosition.x}
            y={layoutData.labelPosition.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="text-sm font-semibold fill-gray-600"
            style={{ pointerEvents: "none" }}
          >
            {name}
          </text>
        )}
      </g>
    );
  }
);
SectionShapeRenderer.displayName = "SectionShapeRenderer";

// --- Component chính để export ---
interface StaticMapLayoutProps {
  layoutData?:
    | ReservedSeatingData["layoutData"]
    | ZonedAdmissionData["layoutData"];
  sections: Section[];
}

export const StaticMapLayout: FC<StaticMapLayoutProps> = ({
  layoutData,
  sections,
}) => {
  return (
    <>
      {/* Lớp 1: Nền tĩnh (ảnh, sân khấu) */}
      {layoutData?.backgroundImageUrl && (
        <image
          href={layoutData.backgroundImageUrl}
          x={0}
          y={0}
          width="100%"
          height="100%"
        />
      )}
      <StageRenderer stage={layoutData?.stage} />

      {/* Lớp 2: Đường bao và tên các khu vực */}
      {sections.map((section) => (
        <SectionShapeRenderer
          key={`section-shape-${section.sectionId}`}
          section={section}
        />
      ))}
    </>
  );
};
