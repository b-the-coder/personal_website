export type RangeOffsets = [startOffset: number, endOffset: number];

export interface ViewportPosition {
  x: number;
  y: number;
}

export interface SelectionPosition {
  viewportPosition: ViewportPosition;
  textPosition: string;
  range: RangeOffsets;
}

// Data structure for a single Annotation item
export interface AnnotationItem {
  annotatedText: string;
  annotationContent: string;
  selectionPosition: SelectionPosition;
  timestamp: number;
}

// annotationList is a key-value map using UUID strings as keys
export type AnnotationListType = Record<string, AnnotationItem>;

// Allowed modes
export type ModeType = "idle" | "text_selected" | "annotating" | "anno_display";

// Type definitions for all state variables and their corresponding setter functions
export interface AnnotationStateContext {
  mode: ModeType;
  setMode: (mode: ModeType) => void;

  annotationList: AnnotationListType;
  setAnnotationList: (list: AnnotationListType) => void;

  currentAnnotationId: string | undefined;
  setCurrentAnnotationId: (id: string | undefined) => void;

  selectedText: string;
  setSelectedText: (text: string) => void;

  selectionPosition: SelectionPosition;
  setSelectionPosition: (position: SelectionPosition) => void;
}
