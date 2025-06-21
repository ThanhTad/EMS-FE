// components/features/AvatarUploader.tsx
"use client";

import { useCallback, useState, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { toBlob } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

interface AvatarUploaderProps {
  onSave: (blob: Blob) => Promise<void>;
  disabled?: boolean; // Cho phép component cha vô hiệu hóa nút này
}

export default function AvatarUploader({
  onSave,
  disabled = false,
}: AvatarUploaderProps) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Chỉ hỗ trợ file JPG hoặc PNG.");
      e.target.value = "";
      return;
    }
    // Validate size
    if (file.size > MAX_SIZE) {
      setError("Kích thước tối đa 2MB.");
      e.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setOpen(true);
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
    setError(null);
    try {
      const blob = await toBlob(imageSrc, croppedAreaPixels);
      if (!blob) throw new Error("Không thể xử lý ảnh");
      await onSave(blob);
      setOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Có lỗi khi lưu ảnh, hãy thử lại.");
      }
    } finally {
      setSaving(false);
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [imageSrc, croppedAreaPixels, onSave]);

  const handleDialogClose = useCallback(() => {
    setOpen(false);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setError(null);
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imageSrc]);

  return (
    <>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          id="avatar-upload"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled || saving}
        />
        <label htmlFor="avatar-upload">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="dark:border-gray-600 dark:text-gray-100"
            disabled={disabled || saving}
            aria-label="Cập nhật ảnh đại diện"
          >
            <span>{saving ? "Đang tải..." : "Cập nhật ảnh đại diện"}</span>
          </Button>
        </label>
        {error && (
          <div className="text-xs text-red-500 mt-1 whitespace-pre-line">
            {error}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
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
              disabled={saving}
            />
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-2 whitespace-pre-line">
              {error}
            </div>
          )}
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              className="dark:border-gray-600 dark:text-gray-100"
              disabled={saving}
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
