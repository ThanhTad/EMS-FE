// components/admin/seat-maps/SeatMapDesigner.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Save, Square, Move, RotateCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SeatData,
  SeatMapDesignerProps,
  SeatMapPayload,
  SeatMapSectionData,
} from "@/types"; // Import các type mới
import { Button } from "@/components/ui/button";

// ---- Helper Functions ----
/**
 * Chuyển đổi dữ liệu từ API (initialData) sang định dạng state của Designer
 */
const transformApiDataToState = (
  apiData: NonNullable<SeatMapDesignerProps["initialData"]>
): SeatMapSectionData[] => {
  return apiData.sections.map((section) => ({
    id: section.id,
    name: section.name,
    layout: (section.layoutData as SeatMapSectionData["layout"]) || {
      startX: 0,
      startY: 0,
      width: 100,
      height: 100,
      color: "#cccccc",
    },
    seats: section.seats.map((seat) => ({
      id: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      coordinates: (seat.coordinates as SeatData["coordinates"]) || {
        x: 0,
        y: 0,
      },
      seatType: seat.seatType || "standard",
    })),
  }));
};

/**
 * Chuyển đổi dữ liệu từ state của Designer sang định dạng payload để gửi đi
 */
const transformStateToPayload = (
  state: SeatMapSectionData[],
  name: string,
  description: string
): SeatMapPayload => {
  return {
    name,
    description,
    sections: state.map((section) => ({
      ...section,
      // Có thể thêm logic để loại bỏ các trường không cần thiết trước khi gửi
    })),
  };
};

const SeatMapDesigner: React.FC<SeatMapDesignerProps> = ({
  isEditMode,
  initialData,
  onSave,
}) => {
  const router = useRouter();

  // ---- States ----
  const [mapName, setMapName] = useState(initialData?.name || "Sơ đồ mới");
  const [mapDescription, setMapDescription] = useState(
    initialData?.description || ""
  );

  const [sections, setSections] = useState<SeatMapSectionData[]>([]);

  // State cho việc vẽ vời trên canvas
  const [tool, setTool] = useState("select"); // 'select', 'section'
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingSection, setCurrentDrawingSection] = useState<Omit<
    SeatMapSectionData,
    "seats" | "id"
  > | null>(null);

  const [zoom] = useState(1);
  //   const [pan, setPan] = useState({ x: 0, y: 0 }); // Thêm tính năng pan sau
  const [isLoading, setIsLoading] = useState(false);

  const canvasRef = useRef<SVGSVGElement>(null);
  const [canvasSize] = useState({ width: 1000, height: 700 });

  // ---- Effects ----
  // Khởi tạo state từ initialData khi component được mount
  useEffect(() => {
    if (initialData) {
      setSections(transformApiDataToState(initialData));
    }
  }, [initialData]);

  // ---- Event Handlers ----
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (tool !== "section" || !canvasRef.current) return;

      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      setCurrentDrawingSection({
        name: `Khu vực ${sections.length + 1}`,
        layout: { startX: x, startY: y, width: 0, height: 0, color: "#1E40AF" },
      });
    },
    [tool, zoom, sections.length]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing || !currentDrawingSection || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / zoom;
      const currentY = (e.clientY - rect.top) / zoom;

      setCurrentDrawingSection((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          layout: {
            ...prev.layout,
            width: Math.abs(currentX - prev.layout.startX),
            height: Math.abs(currentY - prev.layout.startY),
          },
        };
      });
    },
    [currentDrawingSection, isDrawing, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentDrawingSection) return;

    setIsDrawing(false);

    // Đảm bảo khu vực có kích thước tối thiểu
    if (
      currentDrawingSection.layout.width > 10 &&
      currentDrawingSection.layout.height > 10
    ) {
      setSections((prev) => [
        ...prev,
        {
          ...currentDrawingSection,
          seats: [], // Khởi tạo mảng ghế rỗng
        },
      ]);
    }

    setCurrentDrawingSection(null);
    setTool("select"); // Chuyển về chế độ chọn sau khi vẽ
  }, [isDrawing, currentDrawingSection]);

  const handleSaveClick = async () => {
    if (!mapName) {
      toast.error("Tên sơ đồ là bắt buộc.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = transformStateToPayload(
        sections,
        mapName,
        mapDescription
      );
      await onSave(payload);
      toast.success("Đã lưu sơ đồ thành công!");
      router.back(); // Quay lại trang danh sách sơ đồ
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không mong muốn.";
      toast.error("Lưu sơ đồ thất bại", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Render Logic ----
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left Sidebar - Tools */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            Trình thiết kế Sơ đồ
          </h2>
          <Button
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Button>
        </div>

        <div className="p-4 border-b space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên sơ đồ *
            </label>
            <input
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="p-4 border-b">
          <label className="block text-sm font-medium mb-2">Công cụ:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTool("select")}
              className={`p-2 rounded-md flex items-center justify-center ${
                tool === "select"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Move className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool("section")}
              className={`p-2 rounded-md flex items-center justify-center ${
                tool === "section"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Square className="w-5 h-5" />
            </button>
            {/* Thêm các công cụ khác sau */}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 mt-auto border-t">
          <Button
            onClick={handleSaveClick}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditMode ? "Lưu thay đổi" : "Tạo Sơ đồ"}
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-200">
        <div className="flex-1 overflow-auto p-4">
          <svg
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="bg-white shadow-md mx-auto"
            style={{ cursor: tool === "section" ? "crosshair" : "default" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Render các khu vực (sections) đã có */}
            {sections.map((section, index) => (
              <g key={section.id || `section-${index}`}>
                <rect
                  x={section.layout.startX}
                  y={section.layout.startY}
                  width={section.layout.width}
                  height={section.layout.height}
                  fill={section.layout.color}
                  fillOpacity="0.2"
                  stroke={section.layout.color}
                  strokeWidth="1"
                  className="cursor-pointer"
                />
                <text
                  x={section.layout.startX + section.layout.width / 2}
                  y={section.layout.startY + section.layout.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold pointer-events-none"
                  fill={section.layout.color}
                >
                  {section.name}
                </text>
              </g>
            ))}

            {/* Render khu vực đang vẽ */}
            {currentDrawingSection && (
              <rect
                x={currentDrawingSection.layout.startX}
                y={currentDrawingSection.layout.startY}
                width={currentDrawingSection.layout.width}
                height={currentDrawingSection.layout.height}
                fill={currentDrawingSection.layout.color}
                fillOpacity="0.4"
                stroke={currentDrawingSection.layout.color}
                strokeWidth="1"
                strokeDasharray="4"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 bg-white shadow-lg border-l overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Thuộc tính các Khu vực</h3>
        </div>
        <div className="p-4 space-y-4">
          {sections.length === 0 && (
            <p className="text-sm text-gray-500">
              Chưa có khu vực nào. Hãy dùng công cụ để vẽ.
            </p>
          )}
          {sections.map((section, index) => (
            <div
              key={section.id || `prop-${index}`}
              className="border rounded-lg p-3 space-y-2"
            >
              <input
                value={section.name}
                onChange={(e) => {
                  const newSections = [...sections];
                  newSections[index].name = e.target.value;
                  setSections(newSections);
                }}
                className="font-medium w-full border-b pb-1"
              />
              <div className="flex items-center space-x-2">
                <label className="text-sm">Màu:</label>
                <input
                  type="color"
                  value={section.layout.color}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[index].layout.color = e.target.value;
                    setSections(newSections);
                  }}
                  className="w-8 h-8 p-0 border-none"
                />
              </div>
              {/* Thêm nút "Tạo ghế tự động" ở đây sau */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMapDesigner;
