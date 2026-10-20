This repo is for a webpage that you can showcase your personal info and professional experience, including to display a resume that allow annotation. The page also support dark mode view.

## Prerequisites

Before running this project locally, make sure you have:

- [Git](https://git-scm.com/) — required to clone the repository
- [Node.js](https://nodejs.org/) 22.12.0 or later
- npm — included with Node.js
- A modern web browser

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/b-the-coder/personal_website.git
   ```

2. Navigate to the project directory:

   ```bash
   cd personal_website
   ```

3. Install the dependencies:

   ```bash
   npm ci
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in the terminal, usually:

   ```text
   http://localhost:5173
   ```

## Deployment and Persistence

- Docker publishing through GitHub Actions requires the repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`.
- Local development (`npm run dev`) uses port `5173`, while the Docker build is served on port `3000` inside the container. Map that port to the host when running the container (for example, `-p 3000:3000`).
- Annotation data is stored only in the browser's `localStorage` and is not persisted on a server. Clearing browser storage removes saved annotations, and annotations are not shared across browsers, devices, or origins (including different ports).

## Testing

Run the test suite:

```bash
npm test
```

Run the tests and generate a coverage report:

```bash
npm run test:coverage
```

Run the end-to-end tests:

```bash
npm run test:e2e
```

## Demo

1. Select the text you want to annotate and post an annotation.
2. Annotated text will be highlighted.
3. The highlight color becomes darker as more annotations are added to the same text, up to three levels.
4. Click the highlighted text to view its annotations.
5. Existing annotations can be edited or deleted.

## Screenshots

### Select Text and Post an Annotation

![Selecting text for annotation](screenshots/select-text.png)
![Adding an annotation](screenshots/post-annotation.png)

### Different Highlight Levels and Viewing/Editing Annotations

![Viewing existing annotations](screenshots/highlight-color-display.png)

## Use Your Own Resume

Update the values in `src/portfolio-data.json` with your own resume information.

## Known Limitations

This function does not support annotations that span across different text segments.
If a user selects content across multiple text segments, only the text in the first segment will be highlighted. However, the saved annotation object will still match the user's selection.
