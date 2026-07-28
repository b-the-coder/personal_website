# Personal Website Documentation

---

# File Structure

```text
Project Root
│
├── index.html          # Main HTML entry
├── style.css           # Global styles
├── script.js           # Main JavaScript entry
├── utils.jsx           # Shared utility functions
├── resumeData.json     # Original resume data
│
├── components/
│   ├── Resume.jsx      # Resume rendering and highlighting component
│   └── Annotation.jsx  # Annotation component
│
└── tests/
    ├── method.test.jsx     # Unit tests
    └── component.test.jsx  # Component rendering tests
```

---

# Data Flow

Resume components load resume content from `resumeData.json` and render the resume based on the required layout and user annotations.

User annotations are managed through the `annotationList` state. Any annotation changes update the state and are persisted to `localStorage`, allowing annotation data to be restored across sessions.

---

# Annotation Object Structure

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

# Key Features

## 1. Highlight Text Based on Annotation Count

### Behavior

When an annotation is added to a piece of text, that text is highlighted. The highlight color darkens through up to three levels as the annotation count increases.

### Workflow

1. Highlighting is implemented by applying background-color styles while the resume is rendered.

2. Each text unit in `resumeData.json` is assigned a unique `textId`.

3. When an annotation is created, the selected range is stored relative to the text content of the corresponding `textId`.

4. Whenever `annotationList` changes, the Resume component re-renders and calls `computeSegment()`.

5. `computeSegment()` generates a list of segments describing how the text within a `textId` is divided by annotations and any style boundaries.

6. Each segment contains:
   - The text range
   - Annotation count
   - Associated annotation ID(s)

7. If boundaries exist, the segments are filtered so that different styles can be applied correctly within the same `textId`.

8. Finally, `renderSegment()` renders the text and applies the appropriate highlight style to either:
   - the entire `textId`, or
   - only specific segments within it.

### Limitation

This feature does not support annotations spanning multiple `textId` units.

If a user selects text across multiple `textId` units, only the portion within the first `textId` will be highlighted. However, the saved annotation object will still preserve the user's complete selection.

---