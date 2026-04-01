April Search
=====================

Overview
--------
April Search is a dark-themed, April Fools-styled recommendation prototype that
combines:

- profile-based recommendations
- prompt-guided web enrichment
- AI reranking when an OpenAI API key is available
- playful mini-games in the Suspicious Logic panel

The app recommends content across:

- videos
- music
- podcasts
- movies
- news


Files
-----
index.html
  Main UI structure and page sections.

styles.css
  Dark-space visual theme, responsive layout, and April Fools styling.

app.js
  Frontend state, ranking logic, prompt merging, UI rendering, and mini-games.

server.js
  Static server, live catalog endpoints, AI reranking endpoint, and web-search endpoint.

README.md
  Existing markdown project summary.

README.txt
  This plain-text quick reference.

DESIGN_DOC.txt
  Design and system notes for the current implementation.


How To Run
----------
1. Install dependencies:
   npm install

2. Start the server:
   node server.js

3. Open:
   http://127.0.0.1:3000


Optional Environment Variables
------------------------------
OPENAI_API_KEY
  Enables AI reranking and live web-search through the OpenAI Responses API.

OPENAI_MODEL
  Optional model override. Default is gpt-5-mini.

PORT
  Optional custom port.

HOST
  Optional host override. Default is 127.0.0.1.


Main Features
-------------
1. Unified recommendation feed
   General profile signals and prompt-derived candidates are merged into one feed.

2. Live catalog loading
   The frontend requests a catalog from the server, which attempts to crawl live public sources.

3. Prompt enrichment
   The internet prompt section accepts a natural-language query and turns relevant results into feed candidates.

4. AI reranking
   When enabled, the server sends the candidate set to OpenAI for strategy and recommendation refinement.

5. April Fools experience
   The UI uses a dark cosmic look, prank interactions, and mini-games in the Suspicious Logic section.


Recommendation Flow
-------------------
1. Load the live catalog from /api/catalog.
2. Build a baseline ranked set from mood, interests, discovery level, and domain weights.
3. If the user runs an internet prompt, convert those prompt results into normalized candidates.
4. Merge normal catalog items and prompt-derived items into one active recommendation pool.
5. Render all recommendations in one place.
6. Optionally rerank the same merged pool with the AI endpoint.


Notes
-----
- If live crawling fails, the app falls back to a built-in catalog.
- If OpenAI is unavailable, the app falls back to local heuristics.
- The project is intentionally playful, but the recommendation flow is still functional.
