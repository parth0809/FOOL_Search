# April Search

April Search is a hackathon-ready prototype for Topic 3: a combined recommendation system that unifies content discovery across videos, music, podcasts, movies, and news.

It now includes an AI-driven recommendation layer that can rerank content and generate personalized explanations with the OpenAI Responses API.

## What it demonstrates

- A single interface for multi-domain recommendations
- Cross-domain preference modeling using topics, mood, and format affinity
- AI-assisted reranking and recommendation explanations
- Explainable scoring so users can understand why items appear
- Adaptive feedback loops through like/skip interactions
- A scalable front-end structure that can later plug into real APIs or ML ranking services

## Files

- `index.html` contains the product layout
- `styles.css` contains the visual system and responsive styling
- `app.js` contains the sample catalog, preference state, ranking logic, and UI interactions
- `server.js` serves the app and calls the OpenAI API for AI recommendations

## Run locally

Install dependencies, set your API key, and start the local server:

```bash
npm install
node server.js
```

Then visit `http://localhost:3000`.

If no API key is present, April Search still works with its built-in heuristic recommendation engine.

## Recommendation logic

The app now uses a two-stage approach:

1. Local candidate scoring using topic overlap, mood match, domain affinity, discovery level, and likes/skips
2. AI reranking using the OpenAI Responses API to produce a cross-domain strategy plus card-level explanations

The server uses the Responses API with structured JSON output so the model returns consistent recommendation data that the UI can render directly.
