// Allowed modes
export type ModeType = "idle" | "text_selected" | "annotating" | "anno_display";

export interface ViewportPosition {
  x: number;
  y: number;
}

export type RangeOffsets = [startOffset: number, endOffset: number];
export interface SelectionPosition {
  viewportPosition: ViewportPosition;
  textPosition: string;
  range: RangeOffsets;
}

// Type definitions for AnnotationSession
export interface AnnotationSession {
  kind: ModeType;
  currentAnnotationId: string | undefined;
  selectedText: string;
  selectionPosition: SelectionPosition|null;
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

//grouped annotationList type
export type AnnotationRange = SelectionPosition["range"];
export type groupAnnotationsType = Record<
  string,
  { [uuid: string]: AnnotationRange }
>;
