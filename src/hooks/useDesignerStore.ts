import { create } from "zustand";

type DesignerTool = "select" | "draw-zone";
export type SelectedObjectType = "section" | "seat" | "mixed" | "none";

type DesignerState = {
  selectedObjectIds: string[];
  selectedObjectType: SelectedObjectType;
  tool: DesignerTool;
  setSelectedObjects: (ids: string[], type: SelectedObjectType) => void;
  setTool: (tool: DesignerTool) => void;
};

export const useDesignerStore = create<DesignerState>((set) => ({
  selectedObjectIds: [],
  selectedObjectType: "none",
  tool: "select",
  setSelectedObjects: (ids, type) =>
    set({ selectedObjectIds: ids, selectedObjectType: type }),
  setTool: (tool) =>
    set({
      tool,
      selectedObjectIds: [],
      selectedObjectType: "none",
    }),
}));
