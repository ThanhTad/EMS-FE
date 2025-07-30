import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "use-debounce";

const MULTIPLE_VALUES_PLACEHOLDER = "Nhiều giá trị";

// Định nghĩa một kiểu cơ sở mà tất cả các đối tượng truyền vào hook phải tuân thủ
interface BulkEditable {
  id: string;
}

/**
 * Một custom hook để quản lý state của một thuộc tính
 * khi chỉnh sửa hàng loạt nhiều đối tượng.
 * @param items - Mảng các đối tượng đang được chọn. Các đối tượng phải có thuộc tính `id`.
 * @param key - Tên thuộc tính cần quản lý.
 * @param onUpdate - Hàm callback để gọi khi giá trị thay đổi.
 */
export function useBulkProperty<T extends BulkEditable, K extends keyof T>(
  items: T[],
  key: K,
  onUpdate: (ids: string[], updates: Partial<T>) => void
) {
  const [displayValue, setDisplayValue] = useState<string>("");
  const [debouncedValue] = useDebounce(displayValue, 500);

  // Effect để khởi tạo giá trị hiển thị ban đầu
  useEffect(() => {
    if (items.length === 0) {
      setDisplayValue("");
      return;
    }
    const firstValue = items[0][key];
    const allSame = items.every((item) => item[key] === firstValue);

    // Đảm bảo giá trị không phải là object hoặc null/undefined trước khi chuyển sang string
    const stringValue =
      firstValue !== null &&
      typeof firstValue !== "undefined" &&
      typeof firstValue !== "object"
        ? String(firstValue)
        : "";

    setDisplayValue(allSame ? stringValue : MULTIPLE_VALUES_PLACEHOLDER);
  }, [items, key]);

  // Effect để gọi callback `onUpdate` sau khi người dùng ngừng gõ
  useEffect(() => {
    if (debouncedValue && debouncedValue !== MULTIPLE_VALUES_PLACEHOLDER) {
      const firstValue = items.length > 0 ? items[0][key] : undefined;
      const allSame = items.every((item) => item[key] === firstValue);
      if (allSame && debouncedValue === String(firstValue)) {
        return;
      }

      // SỬA LỖI: Không cần `any` nữa vì T đã được ràng buộc là có `id`
      const ids = items.map((item) => item.id);

      onUpdate(ids, { [key]: debouncedValue } as Partial<T>);
    }
  }, [debouncedValue, onUpdate, items, key]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    []
  );

  const initialValueAsString =
    items.length > 0 &&
    items[0][key] !== null &&
    typeof items[0][key] !== "undefined"
      ? String(items[0][key])
      : "";

  return {
    value: displayValue,
    onChange: handleInputChange,
    placeholder:
      displayValue === MULTIPLE_VALUES_PLACEHOLDER
        ? MULTIPLE_VALUES_PLACEHOLDER
        : `ví dụ: ${initialValueAsString}`,
  };
}
