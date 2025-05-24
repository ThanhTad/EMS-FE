// components/features/AvatarUploader.tsx
"use client";

import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { toBlob } from "@/lib/utils";

export default function AvatarUploader({
  onSave,
}: {
  onSave: (blob: Blob) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setOpen(true);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await toBlob(imageSrc, croppedAreaPixels);
      await onSave(blob);
      setOpen(false);
    } finally {
      setSaving(false);
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }
  }, [imageSrc, croppedAreaPixels, onSave]);

  return (
    <>
      <div>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="dark:border-gray-600 dark:text-gray-100"
          >
            <span>Cập nhật ảnh đại diện</span>
          </Button>
        </label>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <div className="relative w-full h-80 bg-gray-200 dark:bg-gray-700">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm text-gray-900 dark:text-gray-100">
              Zoom:
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="dark:accent-primary"
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="dark:border-gray-600 dark:text-gray-100"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="dark:bg-primary dark:text-white"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
