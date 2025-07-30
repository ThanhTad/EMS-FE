// components/shared/ZoomControls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomIn}
        aria-label="Phóng to"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onZoomOut}
        aria-label="Thu nhỏ"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onReset} aria-label="Reset">
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};
