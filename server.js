require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const CATALOG_CACHE_TTL_MS = 15 * 60 * 1000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const catalogCache = {
  items: null,
  fetchedAt: 0,
  mode: "fallback",
  diagnostics: []
};

const fallbackCatalog = [
  {
    id: "video-sal-khan-ai-education",
    title: "How AI could save (not destroy) education",
    domain: "video",
    creator: "TED",
    duration: "15 min",
    description: "A TED talk on how AI can support teaching, coaching, and more personalized learning.",
    tags: ["AI", "Productivity", "Science"],
    moods: ["Focused", "Curious"],
    url: "https://www.ted.com/talks/sal_khan_how_ai_could_save_not_destroy_education",
    novelty: 0.44
  },
  {
    id: "video-john-maeda-creative-leaders",
    title: "How art, technology and design inform creative leaders",
    domain: "video",
    creator: "TED",
    duration: "17 min",
    description: "John Maeda connects design, technology, and leadership with a clear product lens.",
    tags: ["Design", "Culture", "Productivity"],
    moods: ["Curious", "Calm"],
    url: "https://www.ted.com/talks/john_maeda_how_art_technology_and_design_inform_creative_leaders",
    novelty: 0.41
  },
  {
    id: "music-lofi-beats",
    title: "lofi beats",
    domain: "music",
    creator: "Spotify",
    duration: "Playlist",
    description: "A reliable focus playlist for calm, sustained work sessions.",
    tags: ["Productivity", "Wellness"],
    moods: ["Focused", "Calm"],
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
    novelty: 0.39
  },
  {
    id: "music-mood-booster",
    title: "Mood Booster",
    domain: "music",
    creator: "Spotify",
    duration: "Playlist",
    description: "High-energy music for a reset between heavier tasks.",
    tags: ["Culture", "Wellness"],
    moods: ["Energetic", "Curious"],
    url: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
    novelty: 0.63
  },
  {
    id: "podcast-design-better",
    title: "Design Better",
    domain: "podcast",
    creator: "Design Better",
    duration: "Podcast",
    description: "Design leaders talk through product decisions, team craft, and creative systems.",
    tags: ["Design", "Culture", "Startups"],
    moods: ["Curious", "Calm"],
    url: "https://podcasts.apple.com/us/podcast/design-better/id1266839739",
    novelty: 0.46
  },
  {
    id: "podcast-ai-startup",
    title: "AI Startup Podcast",
    domain: "podcast",
    creator: "AI Startup Podcast",
    duration: "Podcast",
    description: "Conversations about shipping AI products and building companies around them.",
    tags: ["AI", "Startups", "Science"],
    moods: ["Focused", "Reflective"],
    url: "https://podcasts.apple.com/us/podcast/ai-startup-podcast/id1725552924",
    novelty: 0.58
  },
  {
    id: "movie-her",
    title: "Her",
    domain: "movie",
    creator: "Warner Bros.",
    duration: "126 min",
    description: "A thoughtful sci-fi drama about intimacy, software, and intelligent systems.",
    tags: ["Cinema", "AI", "Culture"],
    moods: ["Reflective", "Curious"],
    url: "https://www.imdb.com/title/tt1798709/",
    novelty: 0.47
  },
  {
    id: "movie-ex-machina",
    title: "Ex Machina",
    domain: "movie",
    creator: "A24",
    duration: "108 min",
    description: "A sharp AI thriller about ambition, ethics, and control.",
    tags: ["Cinema", "AI", "Science"],
    moods: ["Focused", "Energetic"],
    url: "https://www.imdb.com/title/tt0470752/",
    novelty: 0.54
  },
  {
    id: "news-techcrunch-ai",
    title: "TechCrunch AI",
    domain: "news",
    creator: "TechCrunch",
    duration: "Feed",
    description: "Recent AI reporting from TechCrunch.",
    tags: ["AI", "Startups", "Finance", "World News"],
    moods: ["Focused", "Curious"],
    url: "https://techcrunch.com/category/artificial-intelligence/",
    novelty: 0.61
  },
  {
    id: "news-npr-ai",
    title: "Planet Money experiments with AI",
    domain: "news",
    creator: "NPR",
    duration: "Article",
    description: "A newsroom perspective on using AI inside editorial workflows.",
    tags: ["AI", "Culture", "World News"],
    moods: ["Reflective", "Calm"],
    url: "https://www.npr.org/2023/06/08/1180883218/nprs-planet-money-creates-an-episode-using-artificial-intelligence",
    novelty: 0.42
  }
];

const fallbackRiddles = [
  {
    question: "What has galaxies, geese, and no reliable launch schedule?",
    answer: "This April Fools dashboard."
  },
  {
    question: "What travels faster than light on April Fools' Day?",
    answer: "A fake rumor in the team chat."
  },
  {
    question: "Why did the astronaut bring a ladder to mission control?",
    answer: "To reach the high-level prank strategy."
  }
];

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && requestUrl.pathname === "/api/catalog") {
      const shouldRefresh = requestUrl.searchParams.get("refresh") === "1";
      const result = await getCatalogResponse({ forceRefresh: shouldRefresh });
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/recommendations") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const catalogResult = await getCatalogResponse();
      const enrichedPayload = {
        ...payload,
        catalog: Array.isArray(payload.catalog) && payload.catalog.length ? payload.catalog : catalogResult.items
      };
      const result = OPENAI_API_KEY
        ? await getAIRecommendations(enrichedPayload)
        : getFallbackRecommendations(enrichedPayload, "OPENAI_API_KEY not set");

      sendJson(response, 200, result);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/web-search") {
      const body = await readBody(request);
      const payload = JSON.parse(body || "{}");
      const result = OPENAI_API_KEY
        ? await performWebPromptSearch(payload)
        : getFallbackWebPromptResults(payload);

      sendJson(response, 200, result);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/riddle") {
      const result = await getInternetRiddle();
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/astrology") {
      const sign = requestUrl.searchParams.get("sign") || "aries";
      const result = OPENAI_API_KEY
        ? await getAstrologyRecommendation(sign)
        : getFallbackAstrologyRecommendation(sign, "OPENAI_API_KEY not set");
      sendJson(response, 200, result);
      return;
    }

    const targetPath = resolveStaticPath(requestUrl.pathname);

    if (!targetPath) {
      sendJson(response, 403, { error: "Forbidden" });
      return;
    }

    fs.readFile(targetPath, (error, content) => {
      if (error) {
        sendJson(response, 404, { error: "Not found" });
        return;
      }

      const extension = path.extname(targetPath);
      response.writeHead(200, { "Content-Type": mimeTypes[extension] || "text/plain; charset=utf-8" });
      response.end(content);
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`PulseMix server running on http://${HOST}:${PORT}`);
});

function resolveStaticPath(urlPath = "/") {
  const pathname = urlPath === "/" ? "/index.html" : urlPath;
  const cleanPath = path.normalize(path.join(ROOT, pathname));
  return cleanPath.startsWith(ROOT) ? cleanPath : null;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function getCatalogResponse({ forceRefresh = false } = {}) {
  const cacheIsFresh =
    catalogCache.items &&
    Date.now() - catalogCache.fetchedAt < CATALOG_CACHE_TTL_MS;

  if (!forceRefresh && cacheIsFresh) {
    return {
      mode: catalogCache.mode,
      fetchedAt: catalogCache.fetchedAt,
      items: catalogCache.items,
      diagnostics: catalogCache.diagnostics
    };
  }

  const liveResult = await crawlCatalogFromWeb();
  catalogCache.items = liveResult.items;
  catalogCache.fetchedAt = Date.now();
  catalogCache.mode = liveResult.mode;
  catalogCache.diagnostics = liveResult.diagnostics;

  return {
    mode: catalogCache.mode,
    fetchedAt: catalogCache.fetchedAt,
    items: catalogCache.items,
    diagnostics: catalogCache.diagnostics
  };
}

async function crawlCatalogFromWeb() {
  const sourceResults = await Promise.allSettled([
    fetchVideoCatalog(),
    fetchMusicCatalog(),
    fetchPodcastCatalog(),
    fetchMovieCatalog(),
    fetchNewsCatalog()
  ]);

  const diagnostics = [];
  const items = [];

  sourceResults.forEach((result, index) => {
    const sourceName = ["video", "music", "podcast", "movie", "news"][index];

    if (result.status === "fulfilled") {
      items.push(...result.value);
      diagnostics.push(`${sourceName}: ${result.value.length} items`);
      return;
    }

    diagnostics.push(`${sourceName}: ${String(result.reason && result.reason.message ? result.reason.message : result.reason)}`);
  });

  const deduped = dedupeCatalog(items).slice(0, 24);

  if (deduped.length >= 8) {
    return {
      mode: "live",
      items: deduped,
      diagnostics
    };
  }

  return {
    mode: "fallback",
    items: fallbackCatalog,
    diagnostics: [...diagnostics, "Falling back to built-in catalog."]
  };
}

async function fetchVideoCatalog() {
  const episodes = await searchItunesWithFallbacks([
    {
      term: "technology documentary",
      media: "tvShow",
      entity: "tvEpisode",
      limit: 4
    },
    {
      term: "technology",
      media: "tvShow",
      entity: "tvEpisode",
      limit: 4
    },
    {
      term: "science",
      media: "tvShow",
      entity: "tvEpisode",
      limit: 4
    }
  ]);

  return episodes.map((entry, index) =>
    normalizeCatalogItem({
      idSeed: entry.trackId || entry.collectionId || `${entry.trackName}-${index}`,
      title: entry.trackName || entry.collectionName,
      domain: "video",
      creator: entry.artistName || entry.collectionName || "Apple TV",
      duration: formatDuration(entry.trackTimeMillis) || "Episode",
      description:
        entry.longDescription ||
        entry.shortDescription ||
        `A live web-sourced video recommendation related to technology and innovation.`,
      tags: inferTags([entry.trackName, entry.collectionName, entry.primaryGenreName, entry.longDescription].join(" "), [
        "Science",
        "Productivity"
      ]),
      moods: inferMoods([entry.trackName, entry.primaryGenreName, entry.longDescription].join(" "), ["Focused", "Curious"]),
      url: entry.trackViewUrl || entry.collectionViewUrl || entry.artistViewUrl,
      novelty: computeNovelty(entry.trackId || entry.collectionId || index)
    })
  );
}

async function fetchMusicCatalog() {
  const songs = await searchItunes({
    term: "focus electronic",
    media: "music",
    entity: "song",
    limit: 4
  });

  return songs.map((entry, index) =>
    normalizeCatalogItem({
      idSeed: entry.trackId || `${entry.trackName}-${index}`,
      title: entry.trackName,
      domain: "music",
      creator: entry.artistName || "Apple Music",
      duration: formatDuration(entry.trackTimeMillis) || "Track",
      description:
        entry.longDescription ||
        entry.shortDescription ||
        `${entry.trackName} by ${entry.artistName}, pulled from the live web catalog.`,
      tags: inferTags([entry.trackName, entry.artistName, entry.primaryGenreName].join(" "), ["Wellness", "Productivity"]),
      moods: inferMoods([entry.trackName, entry.primaryGenreName].join(" "), ["Calm", "Focused"]),
      url: entry.trackViewUrl || entry.collectionViewUrl || entry.artistViewUrl,
      novelty: computeNovelty(entry.trackId || index)
    })
  );
}

async function fetchPodcastCatalog() {
  const podcasts = await searchItunes({
    term: "artificial intelligence design startup",
    media: "podcast",
    entity: "podcast",
    limit: 4
  });

  return podcasts.map((entry, index) =>
    normalizeCatalogItem({
      idSeed: entry.collectionId || `${entry.collectionName}-${index}`,
      title: entry.collectionName,
      domain: "podcast",
      creator: entry.artistName || "Apple Podcasts",
      duration: `${entry.trackCount || 1} episodes`,
      description:
        entry.description ||
        `${entry.collectionName} from ${entry.artistName}, discovered from the live web catalog.`,
      tags: inferTags([entry.collectionName, entry.artistName, entry.primaryGenreName].join(" "), ["AI", "Startups"]),
      moods: inferMoods([entry.collectionName, entry.primaryGenreName].join(" "), ["Focused", "Reflective"]),
      url: entry.collectionViewUrl || entry.artistViewUrl,
      novelty: computeNovelty(entry.collectionId || index)
    })
  );
}

async function fetchMovieCatalog() {
  const movies = await searchArchiveMovies();

  return movies.map((entry, index) =>
    normalizeCatalogItem({
      idSeed: entry.identifier || `${entry.title}-${index}`,
      title: entry.title,
      domain: "movie",
      creator: entry.creator || "Internet Archive",
      duration: "Feature",
      description:
        entry.description ||
        `${entry.title} is part of the live movie crawl.`,
      tags: inferTags([entry.title, entry.description, entry.creator].join(" "), ["Cinema", "Science"]),
      moods: inferMoods([entry.title, entry.description].join(" "), ["Reflective", "Curious"]),
      url: `https://archive.org/details/${entry.identifier}`,
      novelty: computeNovelty(entry.identifier || index)
    })
  );
}

async function fetchNewsCatalog() {
  const xml = await fetchText("https://techcrunch.com/category/artificial-intelligence/feed/");
  const items = parseRssItems(xml).slice(0, 6);

  return items.map((entry, index) =>
    normalizeCatalogItem({
      idSeed: entry.link || `${entry.title}-${index}`,
      title: entry.title,
      domain: "news",
      creator: entry.creator || "TechCrunch",
      duration: "Article",
      description: entry.description || "A recent AI article from the live news crawl.",
      tags: inferTags([entry.title, entry.description, entry.creator].join(" "), ["AI", "World News", "Startups"]),
      moods: inferMoods([entry.title, entry.description].join(" "), ["Focused", "Curious"]),
      url: entry.link,
      novelty: computeNovelty(entry.link || index)
    })
  );
}

async function searchItunes({ term, media, entity, limit }) {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", media);
  url.searchParams.set("entity", entity);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("country", "us");

  const payload = await fetchJson(url.toString());
  return Array.isArray(payload.results) ? payload.results : [];
}

async function searchItunesWithFallbacks(queries) {
  for (const query of queries) {
    const results = await searchItunes(query);

    if (results.length) {
      return results;
    }
  }

  return [];
}

async function searchArchiveMovies() {
  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", 'subject:("science fiction") AND mediatype:(movies)');
  url.searchParams.set("fl[]", "identifier,title,description,creator");
  url.searchParams.set("rows", "4");
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");

  const payload = await fetchJson(url.toString());
  return Array.isArray(payload?.response?.docs) ? payload.response.docs : [];
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PulseMix/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PulseMix/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

function normalizeCatalogItem(item) {
  return {
    id: slugify(`${item.domain}-${item.idSeed}`),
    title: item.title,
    domain: item.domain,
    creator: item.creator,
    duration: item.duration,
    description: sanitizeText(item.description),
    tags: item.tags.length ? item.tags : inferDomainTags(item.domain),
    moods: item.moods.length ? item.moods : ["Curious", "Focused"],
    url: item.url,
    novelty: item.novelty
  };
}

function dedupeCatalog(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item || !item.url || seen.has(item.url)) {
      return false;
    }

    seen.add(item.url);
    return true;
  });
}

function parseRssItems(xml) {
  const matches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)];

  return matches.map((match) => {
    const chunk = match[0];
    return {
      title: readXmlTag(chunk, "title"),
      link: readXmlTag(chunk, "link"),
      description: stripHtml(readXmlTag(chunk, "description")),
      creator: readXmlTag(chunk, "dc:creator")
    };
  }).filter((entry) => entry.title && entry.link);
}

function readXmlTag(xml, tagName) {
  const pattern = new RegExp(`<${escapeRegExp(tagName)}(?:\\b[^>]*)>([\\s\\S]*?)<\\/${escapeRegExp(tagName)}>`, "i");
  const match = xml.match(pattern);
  return match ? decodeHtmlEntities(match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) : "";
}

function buildHeuristicRanking(payload) {
  const catalog = Array.isArray(payload.catalog) ? payload.catalog : [];
  const selectedTopics = payload.selectedTopics || [];
  const feedback = payload.feedback || {};
  const domainWeights = payload.domainWeights || {};
  const discovery = Number(payload.discovery || 0);
  const mood = payload.mood;
  const promptBoostTerms = String(payload.aiPrompt || "").toLowerCase();

  return catalog
    .map((item) => {
      const topicMatches = item.tags.filter((tag) => selectedTopics.includes(tag));
      const moodMatch = item.moods.includes(mood) ? 1 : 0;
      const domainWeight = Number(domainWeights[item.domain] || 0) / 100;
      const feedbackValue = Number(feedback[item.id] || 0);
      const promptBoost = item.tags.some((tag) => promptBoostTerms.includes(String(tag).toLowerCase())) ? 8 : 0;
      const total =
        topicMatches.length * 20 +
        moodMatch * 12 +
        domainWeight * 18 +
        (discovery / 100) * item.novelty * 22 +
        ((100 - discovery) / 100) * topicMatches.length * 6 +
        feedbackValue * 16 +
        promptBoost;

      const reasons = [];
      if (topicMatches.length) {
        reasons.push(`${topicMatches[0]} interest`);
      }
      if (moodMatch) {
        reasons.push(`${mood} mood match`);
      }
      if (domainWeight >= 0.6) {
        reasons.push(`${item.domain} affinity`);
      }
      if (promptBoost) {
        reasons.push("AI brief alignment");
      }
      if (item.novelty > 0.55 && discovery > 50) {
        reasons.push("exploration pick");
      }

      return {
        ...item,
        total,
        reasons: reasons.slice(0, 3),
        mode: item.novelty > 0.55 && discovery > 50 ? "Explore" : "Match"
      };
    })
    .sort((left, right) => right.total - left.total);
}

async function getAIRecommendations(payload) {
  try {
    const scoredCatalog = buildHeuristicRanking(payload).slice(0, 10);
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        reasoning: { effort: "medium" },
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: [
                  "You are an expert recommendation engine.",
                  "Rerank content across videos, music, podcasts, movies, and news.",
                  "Use the user profile and candidate catalog only.",
                  "Return JSON that matches the schema exactly.",
                  "Keep explanations concrete and product-ready."
                ].join(" ")
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  user_profile: {
                    mood: payload.mood,
                    selected_topics: payload.selectedTopics,
                    discovery: payload.discovery,
                    domain_weights: payload.domainWeights,
                    feedback: payload.feedback,
                    ai_prompt: payload.aiPrompt || ""
                  },
                  candidates: scoredCatalog
                })
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "recommendation_result",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                strategy: { type: "string" },
                explanation: { type: "string" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: { type: "string" },
                      score: { type: "number" },
                      mode: { type: "string", enum: ["Match", "Explore"] },
                      summary: { type: "string" },
                      reasons: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["id", "score", "mode", "summary", "reasons"]
                  }
                }
              },
              required: ["strategy", "explanation", "recommendations"]
            }
          }
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return getFallbackRecommendations(payload, `OpenAI API error: ${errorText.slice(0, 180)}`);
    }

    const result = await apiResponse.json();
    const outputText = result.output_text;

    if (!outputText) {
      return getFallbackRecommendations(payload, "OpenAI returned no output_text");
    }

    const parsed = JSON.parse(outputText);

    return {
      mode: "ai",
      model: MODEL,
      strategy: parsed.strategy,
      explanation: parsed.explanation,
      recommendations: parsed.recommendations
    };
  } catch (error) {
    return getFallbackRecommendations(payload, error.message);
  }
}

async function performWebPromptSearch(payload) {
  const query = String(payload.query || "").trim();

  if (!query) {
    return {
      mode: "empty",
      summary: "No search prompt was provided.",
      results: []
    };
  }

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        tools: [{ type: "web_search" }],
        input: `Search the web for this user request: "${query}". Return a concise research summary with current linked sources.`,
        max_output_tokens: 900
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return getFallbackWebPromptResults(payload, `OpenAI web search error: ${errorText.slice(0, 180)}`);
    }

    const result = await apiResponse.json();
    const citations = extractUrlCitations(result);

    return {
      mode: citations.length ? "web" : "fallback",
      summary: result.output_text || "Web search completed.",
      results: citations.length ? citations : getFallbackWebPromptResults(payload).results
    };
  } catch (error) {
    return getFallbackWebPromptResults(payload, error.message);
  }
}

function getFallbackWebPromptResults(payload, reason = "OPENAI_API_KEY not set") {
  const query = String(payload.query || "").toLowerCase();
  const catalog = Array.isArray(payload.catalog) ? payload.catalog : [];

  const results = catalog
    .filter((item) => {
      const haystack = [item.title, item.description, item.creator, ...(item.tags || [])].join(" ").toLowerCase();
      return query.split(/\s+/).filter(Boolean).some((term) => haystack.includes(term));
    })
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.description,
      source: item.creator,
      note: "Catalog match"
    }));

  return {
    mode: "fallback",
    summary: `Live web search is unavailable (${reason}). Showing the closest matches from the current catalog instead.`,
    results
  };
}

function getFallbackRecommendations(payload, reason) {
  return {
    mode: "local",
    model: null,
    strategy: "Heuristic fallback",
    explanation: `AI reranking is unavailable (${reason}). The app is using the built-in cross-domain scoring model.`,
    recommendations: buildHeuristicRanking(payload).slice(0, 8).map((item) => ({
      id: item.id,
      score: item.total,
      mode: item.mode,
      summary: item.description,
      reasons: item.reasons
    }))
  };
}

async function getInternetRiddle() {
  try {
    const payload = await fetchJson("https://riddles-api.vercel.app/random");
    const question = String(payload.riddle || payload.question || "").trim();
    const answer = String(payload.answer || "").trim();

    if (!question || !answer) {
      throw new Error("Riddle payload was incomplete");
    }

    return {
      mode: "live",
      question,
      answer
    };
  } catch (error) {
    const fallback = fallbackRiddles[Math.floor(Math.random() * fallbackRiddles.length)];
    return {
      mode: "fallback",
      question: fallback.question,
      answer: fallback.answer,
      error: error.message
    };
  }
}

async function getAstrologyRecommendation(sign) {
  try {
    const normalizedSign = String(sign || "aries").toLowerCase();
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        tools: [{ type: "web_search" }],
        input: [
          `Find current horoscope or astrology guidance for the zodiac sign ${normalizedSign}.`,
          "Turn it into one short, playful April Fools recommendation for what content this person should consume today.",
          "Return plain JSON with keys sign and recommendation."
        ].join(" "),
        text: {
          format: {
            type: "json_schema",
            name: "astrology_pick",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                sign: { type: "string" },
                recommendation: { type: "string" }
              },
              required: ["sign", "recommendation"]
            }
          }
        },
        max_output_tokens: 300
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return getFallbackAstrologyRecommendation(normalizedSign, `OpenAI web search error: ${errorText.slice(0, 180)}`);
    }

    const result = await apiResponse.json();
    const parsed = JSON.parse(result.output_text || "{}");

    if (!parsed.recommendation) {
      return getFallbackAstrologyRecommendation(normalizedSign, "No recommendation returned");
    }

    return {
      mode: "live",
      sign: parsed.sign || normalizedSign,
      recommendation: parsed.recommendation
    };
  } catch (error) {
    return getFallbackAstrologyRecommendation(sign, error.message);
  }
}

function getFallbackAstrologyRecommendation(sign, reason) {
  const normalizedSign = String(sign || "aries").toLowerCase();
  const fallbackBySign = {
    aries: "Aries should watch something bold, skip overthinking, and let a chaotic documentary make the first decision.",
    taurus: "Taurus should pick a comforting playlist, a beautiful film, and one article that feels smarter than necessary.",
    gemini: "Gemini should bounce between a podcast, a fast explainer video, and one weird headline for maximum cosmic efficiency.",
    cancer: "Cancer should choose a soft soundtrack, a reflective movie, and a story that feels emotionally overqualified.",
    leo: "Leo should consume dramatic content only: bold music, big opinions, and a recommendation worthy of applause.",
    virgo: "Virgo should read one useful article, save two backup recommendations, and judge the stars quietly.",
    libra: "Libra should pick the prettiest recommendation card and pretend that was the plan all along.",
    scorpio: "Scorpio should open the mysterious recommendation first and refuse to explain why it felt correct.",
    sagittarius: "Sagittarius should chase the most adventurous pick and call the chaos personal growth.",
    capricorn: "Capricorn should select the most productive content, then reward themselves with one dramatic wildcard.",
    aquarius: "Aquarius should choose the strangest intelligent recommendation and insist the stars understand innovation.",
    pisces: "Pisces should follow the dreamy option, the cinematic option, and anything that sounds slightly enchanted."
  };

  return {
    mode: "fallback",
    sign: normalizedSign,
    recommendation: `${fallbackBySign[normalizedSign] || fallbackBySign.aries} Live astrology source unavailable (${reason}).`
  };
}

function extractUrlCitations(responsePayload) {
  const citations = [];
  const outputs = Array.isArray(responsePayload.output) ? responsePayload.output : [];

  outputs.forEach((output) => {
    const content = Array.isArray(output.content) ? output.content : [];

    content.forEach((part) => {
      const annotations = Array.isArray(part.annotations) ? part.annotations : [];

      annotations.forEach((annotation) => {
        const url = annotation.url || annotation?.url_citation?.url;
        const title = annotation.title || annotation?.url_citation?.title;

        if (!url) {
          return;
        }

        if (citations.some((item) => item.url === url)) {
          return;
        }

        citations.push({
          title: title || hostnameFromUrl(url),
          url,
          snippet: annotation.text || annotation?.url_citation?.text || "Referenced by the live web search result.",
          source: hostnameFromUrl(url),
          note: "Live web source"
        });
      });
    });
  });

  return citations.slice(0, 6);
}

function inferTags(text, seedTags = []) {
  const normalized = String(text || "").toLowerCase();
  const tags = new Set(seedTags);
  const patterns = {
    AI: [" ai", "artificial intelligence", "machine learning", "llm", "model"],
    Startups: ["startup", "founder", "venture", "company", "entrepreneur"],
    Design: ["design", "creative", "ux", "product design"],
    Science: ["science", "research", "documentary", "future", "technology"],
    Culture: ["culture", "art", "story", "music", "creative"],
    Productivity: ["work", "focus", "education", "learning", "business"],
    Cinema: ["film", "movie", "cinema", "episode", "tv"],
    Wellness: ["calm", "wellness", "meditation", "lofi", "ambient"],
    Finance: ["finance", "market", "funding", "economy", "investment"],
    "World News": ["news", "policy", "global", "world", "breaking"]
  };

  Object.entries(patterns).forEach(([tag, terms]) => {
    if (terms.some((term) => normalized.includes(term.trim()))) {
      tags.add(tag);
    }
  });

  return [...tags].slice(0, 4);
}

function inferMoods(text, seedMoods = []) {
  const normalized = String(text || "").toLowerCase();
  const moods = new Set(seedMoods);

  if (/(focus|education|research|documentary|analysis|news)/.test(normalized)) {
    moods.add("Focused");
  }
  if (/(creative|design|future|science|startup|ai)/.test(normalized)) {
    moods.add("Curious");
  }
  if (/(thriller|action|booster|energy|dance)/.test(normalized)) {
    moods.add("Energetic");
  }
  if (/(drama|story|ethics|culture|reflection)/.test(normalized)) {
    moods.add("Reflective");
  }
  if (/(calm|ambient|lofi|wellness|soft)/.test(normalized)) {
    moods.add("Calm");
  }

  return [...moods].slice(0, 3);
}

function inferDomainTags(domain) {
  const defaults = {
    video: ["Science", "Productivity"],
    music: ["Wellness", "Culture"],
    podcast: ["AI", "Startups"],
    movie: ["Cinema", "Science"],
    news: ["World News", "AI"]
  };

  return defaults[domain] || ["Culture"];
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.round(Number(milliseconds || 0) / 60000);
  return totalMinutes ? `${totalMinutes} min` : "";
}

function computeNovelty(seed) {
  const hash = hashString(String(seed));
  return 0.35 + (hash % 45) / 100;
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeText(value) {
  return stripHtml(String(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, " ");
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hostnameFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
}
