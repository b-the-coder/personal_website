# Personal Website Documentation

---

## File Structure

```text
Project Root
├─ .github
│  ├─ workflows
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

Resume components load resume content from `src/portfolio-data.json` and render the resume based on the required layout and user annotations.

User annotations are managed through the `annotationList` state. Any annotation changes update the state and are persisted to `localStorage`, allowing annotation data to be restored across sessions.

---

## Annotation Object Structure

```ts
{
  annotationId: {
    annotatedText: String,
    annotationContent: String,
    selectionPosition: {
      viewportPosition: {
        x: Number,
        y: Number
      },
      textPosition: String,
      range: [startIndex, endIndex]
    },
    timestamp: Number
  }
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

When an annotation is added to a piece of text, that text is highlighted. The highlight color darkens through up to three levels as the annotation count increases.

#### Workflow

1. Highlighting is implemented by applying background-color styles while the resume is rendered.

2. Each text unit in `portfolio-data.json` is assigned a unique `textId`.

3. When an annotation is created, the selected range is stored relative to the text content of the corresponding `textId`.

4. Whenever `annotationList` changes, the Resume component re-renders and calls `computeSegments()`.

5. `computeSegments()` generates a list of segments describing how the text within a `textId` is divided by annotations and any style boundaries.

6. Each segment contains:
   - The text range
   - Annotation count
   - Associated annotation ID(s)

7. If boundaries exist, the segments are filtered so that different styles can be applied correctly within the same `textId`.

8. Finally, `renderSegments()` renders the text and applies the appropriate highlight style to either:
   - the entire `textId`, or
   - only specific segments within it.

## Boundary Case Handling

This feature does not support annotations spanning multiple `textId` units.

1. Cross `textId` selections produce a single range calculated from the start unit, where end includes all characters across intermediate text units.

2. `computeSegments()` will still generate segment elements when annotation ranges exceed the length of the provided text, because it does not validate annotation boundaries against text.length.

3. When a segment contains start/end values beyond the text boundary, `renderSegments()` creates the corresponding React element but the rendered content is an empty string ("").

---