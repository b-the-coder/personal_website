# Personal Website Documentation

---

## File Structure

```text
Project Root
├─ .github
│  ├─ workflows
│  │  ├─ docker-publish.yml
│  │  ├─ node.js.yml
│  │  └─ playwright.yml
│  └─ pull_request_template.md
├─ future-improvements
│  ├─ feature-ideas.md
│  └─ known-issues.md
├─ screenshots
│  ├─ highlight-color-display.png
│  ├─ post-annotation.png
│  └─ select-text.png
├─ src
│  ├─ components
│  │  ├─ anno-feature.tsx
│  │  ├─ layout.jsx
│  │  ├─ resume-anno.jsx
│  │  └─ resume-text.tsx
│  ├─ tests
│  │  ├─ e2e-tests
│  │  │  ├─ annotation-initialization-and-persistence.test.js
│  │  │  ├─ annotation-lifecycle.test.js
│  │  │  └─ invalid-selection-behavior.test.js
│  │  ├─ fixtures
│  │  │  └─ annotation-fixtures.js
│  │  └─ unit-tests
│  │     ├─ anno-feature.test.jsx
│  │     ├─ resume-text.test.jsx
│  │     └─ utils.test.jsx
│  ├─ app.jsx
│  ├─ main.jsx
│  ├─ portfolio-data.json
│  ├─ style.css
│  ├─ types.tsx
│  └─ utils.jsx
├─ .gitignore
├─ .prettierrc
├─ DEV-GUIDE.md
├─ Dockerfile
├─ eslint.config.mjs
├─ index.html
├─ package-lock.json
├─ package.json
├─ playwright.config.js
├─ README.md
├─ server.js
└─ vite.config.js
```

## Data Flow

Resume components load resume content from `src/portfolio-data.json` and render the resume based on the required layout and formatting, along with user annotations.

User annotations are managed through the `annotationList` state. Any annotation changes update the state and are persisted to `localStorage`, allowing annotation data to be restored across sessions.

---

## Annotation Object Structure

```ts
{
  [annotationId: string]: {
    annotatedText: string;
    annotationContent: string;
    selectionPosition: {
      viewportPosition: {
        x: number;
        y: number;
      };
      textPosition: string;
      range: [startOffset: number, endOffset: number];
    };
    timestamp: number;
  };
}
```

### Example

```json
{
  "1acb2f78-73b7-44cb-b39d-48df9c40b4fb": {
    "annotatedText": "an Express",
    "annotationContent": "anexpress",
    "selectionPosition": {
      "viewportPosition": {
        "x": 267.7421875,
        "y": 394.5
      },
      "textPosition": "pjt-3-bullet-0",
      "range": [7, 17]
    },
    "timestamp": 1785189476926
  }
}
```

---

## Key Features

### 1. Highlight Text Based on Annotation Count

#### Behavior

When an annotation is added to a piece of text, that text is highlighted. The highlight color darkens through up to three levels as users add more annotations to the same or overlapping text.

#### Workflow

1. Highlighting is implemented by applying background-color styles while the resume is rendered.

2. Each text unit in `portfolio-data.json` is assigned a unique `textId`.

3. When an annotation is created, the selected range offset is calculated and stored relative to the text content of the corresponding `textId`.

4. Whenever `annotationList` changes, the `ResumeText` component re-renders. It groups annotations by `textId` using `groupAnnotationsByTextId()` and, depending on the formatting and styling needs of each resume section, calls either `computeSegments()` and `renderSegments()` or `processTextSegments()` and `renderSegments()`.

5. `computeSegments()` generates a array of segments describing how the text within a `textId` is divided by annotations and any style boundaries.

6. Each segment contains:
   - The text range(relative offsets)
   - Annotation count
   - Associated annotation ID(s)

7. For text blocks containing multiple differently styled chunks, `processTextSegments()` combines the chunks into `fullText`, computes their segments while preserving chunk boundaries, and groups the resulting segments into one segment list per original text chunk. It returns both `fullText` and the grouped `segmentList`.

8. `renderSegments()` uses `fullText` and a segment list to render the corresponding text as React elements. Segments covered by annotations receive the appropriate highlight class and annotation IDs.

## Boundary Case Handling

This feature does not support annotations spanning multiple `textId` units.

1. Cross `textId` selections produce a single range calculated from the start unit, where end includes all characters across intermediate text units.

2. `computeSegments()` will still generate segment elements when annotation ranges exceed the length of the provided text, because it does not validate annotation boundaries against text.length.

3. When a segment contains start/end values beyond the text boundary, `renderSegments()` creates the corresponding React element but the rendered content is an empty string ("").

---
