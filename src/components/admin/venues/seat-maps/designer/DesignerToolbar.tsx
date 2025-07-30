"use client";
import { Save, Square, MousePointer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDesignerStore } from "@/hooks/useDesignerStore";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DesignerTool = ReturnType<typeof useDesignerStore.getState>["tool"];

interface DesignerToolbarProps {
  mapName: string;
  setMapName: (name: string) => void;
  mapDescription: string;
  setMapDescription: (desc: string) => void;
  onSave: () => void;
  isLoading: boolean;
  onBack: () => void;
  isEditMode: boolean;
}

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
  mapName,
  setMapName,
  mapDescription,
  setMapDescription,
  onSave,
  isLoading,
  onBack,
  isEditMode,
}) => {
  const { tool, setTool } = useDesignerStore();

  const tools: { id: DesignerTool; name: string; icon: React.ElementType }[] = [
    { id: "select", name: "Chọn & Di chuyển", icon: MousePointer },
    { id: "draw-zone", name: "Vẽ Khu vực (Zone)", icon: Square },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold text-gray-800">
          Trình thiết kế Sơ đồ
        </h2>
        <Button
          variant="link"
          className="p-0 h-auto text-sm text-muted-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại danh sách
        </Button>
      </div>
      <div className="p-4 border-b space-y-4 flex-grow overflow-y-auto">
        <div>
          <Label htmlFor="map-name">Tên sơ đồ *</Label>
          <Input
            id="map-name"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="map-desc">Mô tả</Label>
          <Textarea
            id="map-desc"
            value={mapDescription}
            onChange={(e) => setMapDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label className="block mb-2">Công cụ</Label>
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((t) => (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setTool(t.id)}
                      className={cn(tool === t.id && "ring-2 ring-primary")}
                    >
                      <t.icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4 mt-auto border-t bg-gray-50">
        <Button
          onClick={onSave}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading
            ? "Đang lưu..."
            : isEditMode
            ? "Lưu thay đổi"
            : "Tạo Sơ đồ"}
        </Button>
      </div>
    </div>
  );
};
