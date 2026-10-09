import type { Dispatch, SetStateAction } from "react";

// Allowed modes

export type Mode = "idle" | "text_selected" | "annotating" | "anno_display";

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
  kind: Mode;

  currentAnnotationId: string | undefined;
  selectedText: string;
  selectionPosition: SelectionPosition | null;
}

// Data structure for a single Annotation item
export interface AnnotationItem {
  annotatedText: string;
  annotationContent: string;
  selectionPosition: SelectionPosition;
  timestamp: number;
}

// annotationList is a key-value map using UUID strings as keys
export type AnnotationList = Record<string, AnnotationItem>;

export type AnnotationRange = SelectionPosition["range"];

//grouped annotationList type
export type GroupedAnnotationsByTextId = Record<
  string,
  { [uuid: string]: AnnotationRange }
>;

export interface AnnotationStateContext {
  annotationList: AnnotationList;
  setAnnotationList: Dispatch<SetStateAction<AnnotationList>>;

  session: AnnotationSession;
  setSession: Dispatch<SetStateAction<AnnotationSession>>;
}
