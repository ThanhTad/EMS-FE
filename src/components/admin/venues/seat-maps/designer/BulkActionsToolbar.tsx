"use client";
import { useDesignerStore } from "@/hooks/useDesignerStore";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignHorizontalDistributeStart,
  AlignVerticalDistributeStart,
  RotateCw,
  Trash2,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

interface BulkActionsToolbarProps {
  // Distribute & Rotate
  onDistributeHorizontal: () => void;
  onDistributeVertical: () => void;
  onRotate: (angle: number) => void;
  // Align
  onAlign: (
    type: "left" | "center-h" | "right" | "top" | "center-v" | "bottom"
  ) => void;
  // Delete
  onDeleteSelected: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  onDistributeHorizontal,
  onDistributeVertical,
  onRotate,
  onAlign,
  onDeleteSelected,
}) => {
  const selectedObjectIds = useDesignerStore(
    (state) => state.selectedObjectIds
  );
  const selectedObjectType = useDesignerStore(
    (state) => state.selectedObjectType
  );

  // Chỉ hiển thị toolbar này cho việc chọn nhiều ghế
  if (selectedObjectIds.length < 2 || selectedObjectType !== "seat") {
    return null;
  }

  const alignTools = [
    { type: "left", icon: AlignStartHorizontal, label: "Căn lề trái" },
    { type: "center-h", icon: AlignCenterHorizontal, label: "Căn giữa ngang" },
    { type: "right", icon: AlignEndHorizontal, label: "Căn lề phải" },
    { type: "top", icon: AlignStartVertical, label: "Căn lề trên" },
    { type: "center-v", icon: AlignCenterVertical, label: "Căn giữa dọc" },
    { type: "bottom", icon: AlignEndVertical, label: "Căn lề dưới" },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-1 flex gap-1 z-10 border items-center">
      <TooltipProvider delayDuration={100}>
        {/* Align Tools */}
        {alignTools.map((tool) => (
          <Tooltip key={tool.type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAlign(tool.type)}
              >
                <tool.icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="border-l h-6 mx-1"></div>

        {/* Distribute & Rotate Tools */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDistributeHorizontal}
            >
              <AlignHorizontalDistributeStart className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Phân phối ngang</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onDistributeVertical}>
              <AlignVerticalDistributeStart className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Phân phối dọc</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onRotate(15)}>
              <RotateCw className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Xoay 15 độ</p>
          </TooltipContent>
        </Tooltip>

        <div className="border-l h-6 mx-1"></div>

        {/* Delete Tool */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteSelected}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Xóa</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
