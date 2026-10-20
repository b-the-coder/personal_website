import type { Dispatch, SetStateAction } from "react";

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


export type AnnotationSession =
  | {
      mode: "idle";
      currentAnnotationId: undefined;
      selectedText: "";
      selectionPosition: null;
    }
  | {
      mode: "text_selected";
      currentAnnotationId: undefined;
      selectedText: string;
      selectionPosition: SelectionPosition;
    }
  | {
      mode: "annotating";
      currentAnnotationId: undefined;
      selectedText: string;
      selectionPosition: SelectionPosition;
    }
  | {
      mode: "annotating";
      currentAnnotationId: string;
      selectedText: "";
      selectionPosition: null;
    }
  | {
      mode: "anno_display";
      currentAnnotationId: string;
      selectedText: "";
      selectionPosition: null;
    };


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
