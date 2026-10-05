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

export type AnnotationRange = SelectionPosition["range"];

// Data structure for a single Annotation item
export interface AnnotationItem {
  annotatedText: string;
  annotationContent: string;
  selectionPosition: SelectionPosition;
  timestamp: number;
}

// annotationList is a key-value map using UUID strings as keys
export type AnnotationListType = Record<string, AnnotationItem>;

// export type AnnotationCatagory = "resume-header" | "resume-links" | "skl";

export type groupAnnotationsType = Record<
  string,
  { [uuid: string]: AnnotationRange }
>;

// Allowed modes
export type ModeType = "idle" | "text_selected" | "annotating" | "anno_display";

// Type definitions for all state variables and their corresponding setter functions
export interface AnnotationStateContext {
  mode: ModeType;
  setMode: (mode: ModeType) => void;

  annotationList: AnnotationListType;
  setAnnotationList: (list: AnnotationListType) => void;

  currentAnnotationId: string;
  setCurrentAnnotationId: (id: string) => void;

  selectedText: string;
  setSelectedText: (text: string) => void;

  selectionPosition: SelectionPosition;
  setSelectionPosition: (position: SelectionPosition) => void;
}
