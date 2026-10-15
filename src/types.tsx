import type { Dispatch, SetStateAction } from "react";


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


export interface AnnotationSession {
  kind: Mode;
  currentAnnotationId: string | undefined;
  selectedText: string;
  selectionPosition: SelectionPosition | null;
}


export interface AnnotationItem {
  annotatedText: string;
  annotationContent: string;
  selectionPosition: SelectionPosition;
  timestamp: number;
}

// Keys are annotation IDs generated with crypto.randomUUID().
export type AnnotationList = Record<string, AnnotationItem>;




export type AnnotationRange = SelectionPosition["range"];
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
