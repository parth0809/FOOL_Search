const moods = ["Focused", "Curious", "Energetic", "Reflective", "Calm"];

const topics = [
  "AI",
  "Startups",
  "Design",
  "Science",
  "Culture",
  "Productivity",
  "Cinema",
  "Wellness",
  "Finance",
  "World News"
];

const domains = [
  { key: "video", label: "Video" },
  { key: "music", label: "Music" },
  { key: "podcast", label: "Podcast" },
  { key: "movie", label: "Movie" },
  { key: "news", label: "News" }
];

const fallbackCatalog = [
  {
    id: "video-founders-playbook",
    title: "The New Founders Playbook for AI Products",
    domain: "video",
    creator: "Build Atlas",
    duration: "14 min",
    description: "A tactical breakdown of how lean teams can ship AI features without losing product clarity.",
    tags: ["AI", "Startups", "Productivity"],
    moods: ["Focused", "Curious"],
    url: "https://www.ted.com/talks/sal_khan_how_ai_could_save_not_destroy_education"
  },
  {
    id: "video-design-systems",
    title: "Design Systems That Feel Human",
    domain: "video",
    creator: "Frame Theory",
    duration: "11 min",
    description: "A visual essay on building interfaces with taste, rhythm, and stronger product storytelling.",
    tags: ["Design", "Productivity", "Culture"],
    moods: ["Curious", "Calm"],
    url: "https://www.ted.com/talks/john_maeda_how_art_technology_and_design_inform_creative_leaders"
  },
  {
    id: "music-sunset-syntax",
    title: "Sunset Syntax",
    domain: "music",
    creator: "Nova Coast",
    duration: "Single",
    description: "Warm synth textures and a steady groove that works for deep work without feeling cold.",
    tags: ["AI", "Wellness", "Productivity"],
    moods: ["Focused", "Calm"],
    url: "https://open.spotify.com/playlist/0xFFgQkeEAwmXeL2L8E4qT"
  },
  {
    id: "music-kinetic-bloom",
    title: "Kinetic Bloom",
    domain: "music",
    creator: "Velvet Arcade",
    duration: "EP",
    description: "An energetic electronic set with enough lift to reset your pace between heavier content.",
    tags: ["Culture", "Wellness"],
    moods: ["Energetic", "Curious"],
    url: "https://open.spotify.com/playlist/2Qan5JlfDiUfXm3ZRlYw5n"
  },
  {
    id: "podcast-labs-and-legends",
    title: "Labs and Legends",
    domain: "podcast",
    creator: "North Signal",
    duration: "38 min",
    description: "A founder interviews researchers about the messy path from experiments to real products.",
    tags: ["AI", "Science", "Startups"],
    moods: ["Focused", "Reflective"],
    url: "https://podcasts.apple.com/us/podcast/ai-startup-podcast/id1725552924"
  },
  {
    id: "podcast-creative-brief",
    title: "The Creative Brief",
    domain: "podcast",
    creator: "Motive Radio",
    duration: "27 min",
    description: "Design leaders unpack how aesthetics, constraints, and business goals can reinforce each other.",
    tags: ["Design", "Culture", "Startups"],
    moods: ["Curious", "Calm"],
    url: "https://podcasts.apple.com/us/podcast/design-better/id1266839739"
  },
  {
    id: "movie-afterlight-city",
    title: "Afterlight City",
    domain: "movie",
    creator: "Independent Film",
    duration: "112 min",
    description: "A near-future drama about memory, ethics, and what happens when recommendation systems know too much.",
    tags: ["Cinema", "AI", "Culture"],
    moods: ["Reflective", "Curious"],
    url: "https://www.imdb.com/title/tt1798709/"
  },
  {
    id: "movie-the-last-prototype",
    title: "The Last Prototype",
    domain: "movie",
    creator: "Studio Meridian",
    duration: "104 min",
    description: "A fast-moving thriller about startup ambition, scientific risk, and impossible product deadlines.",
    tags: ["Cinema", "Science", "Startups"],
    moods: ["Energetic", "Focused"],
    url: "https://www.imdb.com/title/tt0470752/"
  },
  {
    id: "news-signal-brief",
    title: "Signal Brief: AI Infrastructure Heats Up",
    domain: "news",
    creator: "Pulse Desk",
    duration: "5 min read",
    description: "A sharp update on new model infrastructure, funding pressure, and how teams are positioning.",
    tags: ["AI", "Finance", "World News", "Startups"],
    moods: ["Focused", "Curious"],
    url: "https://techcrunch.com/2026/02/28/billion-dollar-infrastructure-deals-ai-boom-data-centers-openai-oracle-nvidia-microsoft-google-meta/"
  },
  {
    id: "news-culture-reset",
    title: "Culture Reset: Why Taste Matters Again",
    domain: "news",
    creator: "Weekend Journal",
    duration: "7 min read",
    description: "An opinion piece on curation, internet sameness, and the return of distinctive editorial voices.",
    tags: ["Culture", "Design", "World News"],
    moods: ["Reflective", "Calm"],
    url: "https://www.npr.org/2023/06/08/1180883218/nprs-planet-money-creates-an-episode-using-artificial-intelligence"
  }
];

const state = {
  mood: "Focused",
  selectedTopics: ["AI", "Startups", "Design"],
  discovery: 55,
  domainWeights: {
    video: 82,
    music: 58,
    podcast: 76,
    movie: 48,
    news: 67
  },
  feedback: {},
  aiPrompt: "",
  catalog: fallbackCatalog,
  catalogMode: "fallback",
  promptCandidates: [],
  webSearchPrompt: "",
  webSearchResults: [],
  webSearchSummary: "",
  mode: "local",
  strategy: "Balanced discovery",
  explanation: "The engine blends explicit interests, format affinity, and recent interactions to keep the feed relevant and varied.",
  recommendations: [],
  gravityBoosts: 0,
  currentRiddle: null
};

const refs = {
  moodSelect: document.querySelector("#mood-select"),
  topicChips: document.querySelector("#topic-chips"),
  discoveryRange: document.querySelector("#discovery-range"),
  discoveryValue: document.querySelector("#discovery-value"),
  domainSliders: document.querySelector("#domain-sliders"),
  recommendationList: document.querySelector("#recommendation-list"),
  mergeSummary: document.querySelector("#merge-summary"),
  resetButton: document.querySelector("#reset-button"),
  prankButton: document.querySelector("#prank-button"),
  prankToast: document.querySelector("#prank-toast"),
  aiPrompt: document.querySelector("#ai-prompt"),
  aiButton: document.querySelector("#ai-button"),
  aiStatus: document.querySelector("#ai-status"),
  aiHelper: document.querySelector("#ai-helper"),
  webSearchPrompt: document.querySelector("#web-search-prompt"),
  webSearchButton: document.querySelector("#web-search-button"),
  webSearchStatus: document.querySelector("#web-search-status"),
  webSearchHelper: document.querySelector("#web-search-helper"),
  modeTitle: document.querySelector("#mode-title"),
  modeDescription: document.querySelector("#mode-description"),
  activeTags: document.querySelector("#active-tags"),
  profileMatch: document.querySelector("#profile-match"),
  diversityScore: document.querySelector("#diversity-score"),
  activeSignals: document.querySelector("#active-signals"),
  coinResult: document.querySelector("#coin-result"),
  coinCopy: document.querySelector("#coin-copy"),
  flipCoinButton: document.querySelector("#flip-coin-button"),
  moonGuessResult: document.querySelector("#moon-guess-result"),
  moonGuessCopy: document.querySelector("#moon-guess-copy"),
  guessMoonButtons: document.querySelectorAll(".guess-moon-button"),
  signalResult: document.querySelector("#signal-result"),
  signalCopy: document.querySelector("#signal-copy"),
  decodeSignalButton: document.querySelector("#decode-signal-button"),
  astroResult: document.querySelector("#astro-result"),
  astroCopy: document.querySelector("#astro-copy"),
  astroSignSelect: document.querySelector("#astro-sign-select"),
  astroButton: document.querySelector("#astro-button"),
  riddleResult: document.querySelector("#riddle-result"),
  riddleCopy: document.querySelector("#riddle-copy"),
  riddleQuestion: document.querySelector("#riddle-question"),
  revealRiddleButton: document.querySelector("#reveal-riddle-button"),
  nextRiddleButton: document.querySelector("#next-riddle-button"),
  qaPrankTitle: document.querySelector("#qa-prank-title"),
  qaPrankCopy: document.querySelector("#qa-prank-copy"),
  qaPrankInput: document.querySelector("#qa-prank-input"),
  qaPrankButton: document.querySelector("#qa-prank-button"),
  qaPrankOutput: document.querySelector("#qa-prank-output"),
  cardTemplate: document.querySelector("#card-template"),
  sceneFrame: document.querySelector("#scene-frame"),
  sceneCore: document.querySelector("#scene-core"),
  sceneParticles: document.querySelector("#scene-particles"),
  floatingCard: document.querySelector(".floating-card")
};

const chipOrbitConfig = [
  { selector: ".chip-video", radiusX: 145, radiusY: 92, depth: 96, speed: 0.00068, phase: 0.2 },
  { selector: ".chip-music", radiusX: 132, radiusY: 72, depth: 62, speed: -0.00074, phase: 1.45 },
  { selector: ".chip-podcast", radiusX: 160, radiusY: 84, depth: 74, speed: 0.00062, phase: 2.35 },
  { selector: ".chip-movie", radiusX: 138, radiusY: 98, depth: 56, speed: -0.00057, phase: 3.25 },
  { selector: ".chip-news", radiusX: 118, radiusY: 124, depth: 44, speed: 0.00082, phase: 4.35 }
];

const sceneState = {
  currentX: 0,
  currentY: 0,
  targetX: 0,
  targetY: 0,
  rafId: 0
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let prankTimer = 0;
let prankToastTimer = 0;
let qaPrankTimer = 0;

init();

async function init() {
  renderControls();
  wireEvents();
  seedParticles();
  initAprilGames();
  await loadInternetRiddle();
  await hydrateCatalog();
  refreshRecommendations();
  startSceneMotion();
}

function renderControls() {
  refs.moodSelect.innerHTML = moods
    .map((mood) => `<option value="${mood}">${mood}</option>`)
    .join("");
  refs.moodSelect.value = state.mood;

  refs.topicChips.innerHTML = "";
  topics.forEach((topic) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.selectedTopics.includes(topic) ? " active" : ""}`;
    button.textContent = topic;
    button.dataset.topic = topic;
    refs.topicChips.append(button);
  });

  refs.discoveryRange.value = String(state.discovery);
  refs.discoveryValue.textContent = String(state.discovery);

  refs.domainSliders.innerHTML = "";
  domains.forEach((domain) => {
    const wrapper = document.createElement("article");
    wrapper.className = "domain-slider-item";
    wrapper.innerHTML = `
      <header>
        <strong>${domain.label}</strong>
        <span>${state.domainWeights[domain.key]}</span>
      </header>
      <input type="range" min="0" max="100" value="${state.domainWeights[domain.key]}" data-domain="${domain.key}">
    `;
    refs.domainSliders.append(wrapper);
  });
}

function wireEvents() {
  refs.moodSelect.addEventListener("change", (event) => {
    state.mood = event.target.value;
    refreshRecommendations();
  });

  refs.topicChips.addEventListener("click", (event) => {
    const button = event.target.closest(".chip");
    if (!button) {
      return;
    }

    const topic = button.dataset.topic;
    const alreadySelected = state.selectedTopics.includes(topic);
    state.selectedTopics = alreadySelected
      ? state.selectedTopics.filter((entry) => entry !== topic)
      : [...state.selectedTopics, topic];

    button.classList.toggle("active", !alreadySelected);
    refreshRecommendations();
  });

  refs.discoveryRange.addEventListener("input", (event) => {
    state.discovery = Number(event.target.value);
    refs.discoveryValue.textContent = String(state.discovery);
    refreshRecommendations();
  });

  refs.domainSliders.addEventListener("input", (event) => {
    const slider = event.target.closest("input[data-domain]");
    if (!slider) {
      return;
    }

    const value = Number(slider.value);
    state.domainWeights[slider.dataset.domain] = value;
    slider.parentElement.querySelector("span").textContent = String(value);
    refreshRecommendations();
  });

  refs.resetButton.addEventListener("click", () => {
    state.mood = "Focused";
    state.selectedTopics = ["AI", "Startups", "Design"];
    state.discovery = 55;
    state.domainWeights = { video: 82, music: 58, podcast: 76, movie: 48, news: 67 };
    state.feedback = {};
    state.aiPrompt.value = "";
    state.aiPrompt.dispatchEvent(new Event("input"));
    state.promptCandidates = [];
    state.webSearchPrompt = "";
    state.webSearchResults = [];
    state.webSearchSummary = "";
    refs.webSearchPrompt.value = "";
    refs.webSearchHelper.textContent = "Use a natural-language prompt and PulseMix will return current web results with links.";
    updateWebSearchStatus("offline", "Ready");
    renderControls();
    refreshRecommendations();
  });

  refs.aiPrompt.addEventListener("input", (event) => {
    state.aiPrompt = event.target.value;
  });

  refs.aiButton.addEventListener("click", requestAiRecommendations);
  refs.prankButton.addEventListener("click", triggerPrank);
  refs.prankButton.addEventListener("pointerenter", cyclePrankButtonLabel);
  refs.flipCoinButton.addEventListener("click", playCosmicCoin);
  refs.decodeSignalButton.addEventListener("click", decodeSignal);
  refs.astroButton.addEventListener("click", loadAstrologyRecommendation);
  refs.guessMoonButtons.forEach((button) => {
    button.addEventListener("click", () => guessMoon(button.dataset.guess));
  });
  refs.revealRiddleButton.addEventListener("click", revealRiddleAnswer);
  refs.nextRiddleButton.addEventListener("click", loadInternetRiddle);
  refs.qaPrankButton.addEventListener("click", consultPrankOracle);
  refs.qaPrankInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      consultPrankOracle();
    }
  });
  refs.webSearchPrompt.addEventListener("input", (event) => {
    state.webSearchPrompt = event.target.value;
  });
  refs.webSearchButton.addEventListener("click", requestWebSearch);

  refs.recommendationList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const delta = button.dataset.action === "like" ? 1 : -1;
    state.feedback[button.dataset.id] = delta;
    refreshRecommendations();
  });

  refs.sceneFrame.addEventListener("pointermove", handleScenePointer);
  refs.sceneFrame.addEventListener("pointerleave", resetScenePointer);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(sceneState.rafId);
      resetSceneTransforms();
      return;
    }

    startSceneMotion();
  });
}

function initAprilGames() {
  refs.coinResult.textContent = "Ready";
  refs.coinCopy.textContent = "Flip the orbital coin to see whether the universe wants chaos or calm.";
  refs.moonGuessResult.textContent = "Pick a crater";
  refs.moonGuessCopy.textContent = "Guess which moon crater hides the prank beacon.";
  refs.signalResult.textContent = "Signal idle";
  refs.signalCopy.textContent = "Decode the fake transmission and see what the prank satellites say.";
  refs.astroResult.textContent = "Awaiting sign";
  refs.astroCopy.textContent = "Choose a zodiac sign and FoolSearch will pull a playful recommendation derived from live internet astrology context.";
  refs.riddleResult.textContent = "Loading riddle";
  refs.riddleCopy.textContent = "Fetching a real riddle from the internet for the prank station.";
  refs.riddleQuestion.textContent = "Please wait while mission control steals a riddle from the internet.";
  refs.qaPrankTitle.textContent = "Ask a terrible question";
  refs.qaPrankCopy.textContent = "Type a question and the oracle will return a dramatically unhelpful April Fools answer.";
  refs.qaPrankOutput.textContent = "Awaiting ridiculous inquiry...";
  refs.qaPrankOutput.classList.remove("typing");
}

function refreshRecommendations() {
  const ranked = buildMergedRanking();
  state.mode = "local";
  state.strategy = resolveStrategyTitle(ranked);
  state.explanation = resolveStrategyExplanation(ranked);
  state.recommendations = ranked.slice(0, 8).map((item) => ({
    id: item.id,
    score: item.total,
    mode: item.mode,
    summary: item.description,
      reasons: item.reasons
  }));
  updateStatus("offline", "Local ranking");
  renderDashboard();
}

function triggerPrank() {
  window.clearTimeout(prankTimer);
  document.body.classList.add("prank-chaos");

  const original = {
    modeTitle: refs.modeTitle.textContent,
    modeDescription: refs.modeDescription.textContent,
    profileMatch: refs.profileMatch.textContent,
    diversityScore: refs.diversityScore.textContent,
    activeSignals: refs.activeSignals.textContent,
    aiHelper: refs.aiHelper.textContent,
    webHelper: refs.webSearchHelper.textContent,
    prankLabel: refs.prankButton.textContent
  };

  const prankMessages = [
    "Alien interns have swapped your recommendations for moon-approved vibes.",
    "Gravity has been downgraded to beta. Please hold onto your playlists.",
    "Our prank engines found 3 suspiciously excellent picks. You are welcome.",
    "Warning: cosmic geese detected in the recommendation corridor."
  ];
  const orbitLabels = ["Oops", "Aliens", "404", "Bonk", "Ha ha"];

  refs.modeTitle.textContent = "Maximum mischief";
  refs.modeDescription.textContent = "For a brief moment, FoolSearch is pretending the recommendation engine is powered by moon dust and overconfidence.";
  refs.profileMatch.textContent = "???";
  refs.diversityScore.textContent = "∞";
  refs.activeSignals.textContent = "42";
  refs.aiHelper.textContent = "Prank mode briefly intercepted the AI channel. Nothing exploded.";
  refs.webSearchHelper.textContent = "The internet is still here, but the cosmic joke department is temporarily in charge.";
  refs.prankButton.textContent = "Prank deployed";

  const chips = [...refs.sceneCore.querySelectorAll(".orbit-chip")];
  const previousChipLabels = chips.map((chip) => chip.textContent);
  chips.forEach((chip, index) => {
    chip.textContent = orbitLabels[index] || "Oops";
  });

  showPrankToast(prankMessages[Math.floor(Math.random() * prankMessages.length)]);

  prankTimer = window.setTimeout(() => {
    document.body.classList.remove("prank-chaos");
    refs.modeTitle.textContent = original.modeTitle;
    refs.modeDescription.textContent = original.modeDescription;
    refs.profileMatch.textContent = original.profileMatch;
    refs.diversityScore.textContent = original.diversityScore;
    refs.activeSignals.textContent = original.activeSignals;
    refs.aiHelper.textContent = original.aiHelper;
    refs.webSearchHelper.textContent = original.webHelper;
    refs.prankButton.textContent = original.prankLabel;
    chips.forEach((chip, index) => {
      chip.textContent = previousChipLabels[index];
    });
  }, 2400);
}

async function requestWebSearch() {
  const query = state.webSearchPrompt.trim();

  if (!query) {
    refs.webSearchHelper.textContent = "Write a prompt first, then PulseMix can search the internet and return linked results.";
    updateWebSearchStatus("offline", "Enter prompt");
    return;
  }

  updateWebSearchStatus("loading", "Searching...");
  refs.webSearchHelper.textContent = "Searching the web and compiling current linked results.";

  try {
    const response = await fetch("/api/web-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        catalog: state.catalog
      })
    });

    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }

    const result = await response.json();
    state.webSearchSummary = result.summary || "";
    state.webSearchResults = Array.isArray(result.results) ? result.results : [];
    state.promptCandidates = state.webSearchResults.map(normalizeWebResultToCandidate);
    refs.webSearchHelper.textContent = result.summary || "Internet search finished.";
    updateWebSearchStatus(result.mode === "web" ? "online" : "offline", result.mode === "web" ? "Web search live" : "Catalog fallback");
    refreshRecommendations();
  } catch (error) {
    state.promptCandidates = [];
    state.webSearchResults = [];
    refs.webSearchHelper.textContent = `Internet search failed. (${error.message})`;
    updateWebSearchStatus("offline", "Unavailable");
    refreshRecommendations();
  }
}

async function requestAiRecommendations() {
  updateStatus("loading", "Generating...");
  refs.aiHelper.textContent = "PulseMix is asking the AI layer to rerank the current cross-domain shortlist.";

  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: state.mood,
        selectedTopics: state.selectedTopics,
        discovery: state.discovery,
        domainWeights: state.domainWeights,
        feedback: state.feedback,
        aiPrompt: state.aiPrompt,
        catalog: getActiveCatalog()
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const result = await response.json();
    state.mode = result.mode || "local";
    state.strategy = result.strategy || resolveStrategyTitle(state.recommendations);
    state.explanation = result.explanation || resolveStrategyExplanation(state.recommendations);
    state.recommendations = normalizeRecommendations(result.recommendations);
    updateStatus(state.mode === "ai" ? "online" : "offline", state.mode === "ai" ? "AI reranked" : "Local fallback");
    refs.aiHelper.textContent = state.mode === "ai"
      ? "The AI layer reranked the feed and rewrote the explanation stack."
      : "The server fell back to the local scoring model for this run.";
    renderDashboard();
  } catch (error) {
    refreshRecommendations();
    refs.aiHelper.textContent = `AI request failed, so the local model stayed in control. (${error.message})`;
  }
}

function normalizeRecommendations(recommendations) {
  const byId = new Map(getActiveCatalog().map((item) => [item.id, item]));

  return (Array.isArray(recommendations) ? recommendations : [])
    .map((entry) => {
      const source = byId.get(entry.id);
      if (!source) {
        return null;
      }

      return {
        ...source,
        total: Number(entry.score || 0),
        mode: entry.mode || "Match",
        summary: entry.summary || source.description,
        reasons: Array.isArray(entry.reasons) && entry.reasons.length ? entry.reasons : buildReasons(source)
      };
    })
    .filter(Boolean);
}

function renderDashboard() {
  refs.modeTitle.textContent = state.strategy;
  refs.modeDescription.textContent = state.explanation;

  const visibleTags = [
    state.mood,
    state.selectedTopics[0] || "Generalist",
    `${state.discovery > 60 ? "Discovery" : "Focus"} ${state.discovery}%`
  ];
  refs.activeTags.innerHTML = visibleTags.map((tag) => `<span>${tag}</span>`).join("");

  const ranked = state.recommendations.map((entry) => {
    if (entry.title) {
      return entry;
    }

    const source = getActiveCatalog().find((item) => item.id === entry.id);
    return source
      ? {
          ...source,
          total: entry.score,
          mode: entry.mode,
          summary: entry.summary,
          reasons: entry.reasons
        }
      : null;
  }).filter(Boolean);

  renderStats(ranked);
  renderMergeSummary(ranked);
  renderCards(ranked);
}

function renderMergeSummary(ranked) {
  const promptCount = ranked.filter((item) => item.origin === "prompt").length;
  const generalCount = ranked.filter((item) => item.origin !== "prompt").length;
  const parts = [
    `${generalCount} profile picks`,
    `${promptCount} prompt-guided picks`
  ];

  if (state.webSearchPrompt.trim()) {
    const shortPrompt = state.webSearchPrompt.trim();
    parts.push(`Merged prompt: ${shortPrompt.slice(0, 52)}${shortPrompt.length > 52 ? "..." : ""}`);
  }

  refs.mergeSummary.innerHTML = parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("");
}

function renderStats(ranked) {
  const topScore = Math.max(...ranked.map((item) => item.total), 0);
  const representedDomains = new Set(ranked.map((item) => item.domain)).size;
  const signals = state.selectedTopics.length + Object.values(state.feedback).filter(Boolean).length + 2;

  refs.profileMatch.textContent = `${Math.min(99, Math.round(topScore))}%`;
  refs.diversityScore.textContent = String(representedDomains);
  refs.activeSignals.textContent = String(signals);
}

function renderCards(ranked) {
  refs.recommendationList.innerHTML = "";

  ranked.forEach((item, index) => {
    const fragment = refs.cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".recommendation-card");
    const domainBadge = fragment.querySelector(".domain-badge");
    const scorePill = fragment.querySelector(".score-pill");
    const title = fragment.querySelector("h4");
    const meta = fragment.querySelector(".meta");
    const description = fragment.querySelector(".description");
    const reasonList = fragment.querySelector(".reason-list");
    const openLink = fragment.querySelector(".open-link");
    const likeButton = fragment.querySelector(".like-button");
    const skipButton = fragment.querySelector(".skip-button");

    card.style.animationDelay = `${index * 70}ms`;
    domainBadge.textContent = domains.find((domain) => domain.key === item.domain)?.label || item.domain;
    scorePill.textContent = `${Math.round(item.total)} • ${item.origin === "prompt" ? "Prompt" : item.mode}`;
    title.textContent = item.title;
    meta.textContent = `${item.creator} • ${item.duration}`;
    description.textContent = item.summary || item.description;
    reasonList.innerHTML = item.reasons.map((reason) => `<span>${reason}</span>`).join("");
    openLink.href = item.url;

    likeButton.dataset.action = "like";
    likeButton.dataset.id = item.id;
    skipButton.dataset.action = "skip";
    skipButton.dataset.id = item.id;

    if (state.feedback[item.id] === 1) {
      likeButton.textContent = "Liked";
    }

    if (state.feedback[item.id] === -1) {
      skipButton.textContent = "Skipped";
    }

    refs.recommendationList.append(fragment);
  });
}

function buildMergedRanking() {
  const mergedCatalog = mergeCatalogs(state.catalog, state.promptCandidates);

  return mergedCatalog
    .map((item) => {
      const topicMatches = item.tags.filter((tag) => state.selectedTopics.includes(tag));
      const moodMatch = item.moods.includes(state.mood) ? 18 : 0;
      const domainWeight = Number(state.domainWeights[item.domain] || 50) * 0.28;
      const feedback = Number(state.feedback[item.id] || 0) * 12;
      const discoveryBoost = topicMatches.length === 0 ? state.discovery * 0.22 : (100 - state.discovery) * 0.14;
      const promptBoost = item.origin === "prompt" ? 16 : 0;
      const queryBoost = matchesPromptIntent(item) ? 12 : 0;
      const total = Math.min(99, 24 + topicMatches.length * 16 + moodMatch + domainWeight + feedback + discoveryBoost + promptBoost + queryBoost);

      return {
        ...item,
        total,
        mode: topicMatches.length >= 2 || moodMatch ? "Match" : "Explore",
        reasons: buildReasons(item, topicMatches, moodMatch)
      };
    })
    .sort((left, right) => right.total - left.total);
}

async function hydrateCatalog() {
  refs.aiHelper.textContent = "Loading a live catalog from the web so recommendations can point to current content.";

  try {
    const response = await fetch("/api/catalog");

    if (!response.ok) {
      throw new Error(`Catalog request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (!Array.isArray(result.items) || result.items.length === 0) {
      throw new Error("Catalog response was empty");
    }

    state.catalog = result.items;
    state.catalogMode = result.mode || "live";
    refs.aiHelper.textContent =
      result.mode === "live"
        ? `Loaded ${result.items.length} live items from web sources. Local ranking and AI reranking now use the crawled catalog.`
        : "Live crawling was unavailable, so PulseMix is using the built-in backup catalog.";
  } catch (error) {
    state.catalog = fallbackCatalog;
    state.catalogMode = "fallback";
    refs.aiHelper.textContent = `Live catalog loading failed, so PulseMix stayed on the built-in backup catalog. (${error.message})`;
  }
}

function mergeCatalogs(baseCatalog, promptCatalog) {
  const byUrl = new Map();

  [...baseCatalog, ...promptCatalog].forEach((item) => {
    const key = item.url || item.id;
    const existing = byUrl.get(key);

    if (!existing) {
      byUrl.set(key, item);
      return;
    }

    byUrl.set(key, {
      ...existing,
      ...item,
      tags: [...new Set([...(existing.tags || []), ...(item.tags || [])])],
      moods: [...new Set([...(existing.moods || []), ...(item.moods || [])])],
      origin: existing.origin === "prompt" || item.origin === "prompt" ? "prompt" : (item.origin || existing.origin)
    });
  });

  return [...byUrl.values()];
}

function getActiveCatalog() {
  return mergeCatalogs(state.catalog, state.promptCandidates);
}

function normalizeWebResultToCandidate(item, index) {
  const text = [item.title, item.snippet, item.source, state.webSearchPrompt].join(" ");
  return {
    id: `prompt-${slugify(item.url || item.title || index)}`,
    title: item.title || `Prompt result ${index + 1}`,
    domain: inferDomainFromText(text, item.url),
    creator: item.source || "Web source",
    duration: item.note || "Live result",
    description: item.snippet || "Result pulled from the web prompt.",
    summary: item.snippet || "Result pulled from the web prompt.",
    tags: inferTagsFromText(text),
    moods: inferMoodsFromText(text),
    url: item.url || "#",
    origin: "prompt"
  };
}

function matchesPromptIntent(item) {
  const prompt = state.webSearchPrompt.trim().toLowerCase();
  if (!prompt) {
    return false;
  }

  const haystack = [item.title, item.description, item.creator, ...(item.tags || [])].join(" ").toLowerCase();
  return prompt.split(/\s+/).filter(Boolean).some((term) => term.length > 3 && haystack.includes(term));
}

function inferDomainFromText(text, url) {
  const value = `${text || ""} ${url || ""}`.toLowerCase();

  if (value.includes("youtube") || value.includes("video") || value.includes("watch?v=")) {
    return "video";
  }
  if (value.includes("spotify") || value.includes("song") || value.includes("album") || value.includes("playlist")) {
    return "music";
  }
  if (value.includes("podcast")) {
    return "podcast";
  }
  if (value.includes("movie") || value.includes("imdb") || value.includes("film")) {
    return "movie";
  }

  return "news";
}

function inferTagsFromText(text) {
  const value = String(text || "").toLowerCase();
  const tags = [];

  if (value.includes("ai") || value.includes("artificial intelligence")) tags.push("AI");
  if (value.includes("startup") || value.includes("founder")) tags.push("Startups");
  if (value.includes("design") || value.includes("product")) tags.push("Design");
  if (value.includes("science") || value.includes("research")) tags.push("Science");
  if (value.includes("culture") || value.includes("creative")) tags.push("Culture");
  if (value.includes("finance") || value.includes("funding")) tags.push("Finance");
  if (value.includes("news") || value.includes("article")) tags.push("World News");
  if (value.includes("focus") || value.includes("learn")) tags.push("Productivity");

  return tags.length ? tags.slice(0, 4) : ["Culture"];
}

function inferMoodsFromText(text) {
  const value = String(text || "").toLowerCase();
  const moods = [];

  if (/(analysis|news|research|brief|guide)/.test(value)) moods.push("Focused");
  if (/(future|design|ai|idea|creative)/.test(value)) moods.push("Curious");
  if (/(energy|fast|trailer|launch)/.test(value)) moods.push("Energetic");
  if (/(essay|story|ethics|cinema)/.test(value)) moods.push("Reflective");
  if (/(calm|ambient|soft|wellness)/.test(value)) moods.push("Calm");

  return moods.length ? moods.slice(0, 3) : ["Curious", "Focused"];
}

function buildReasons(item, topicMatches = [], moodMatch = 0) {
  const reasons = [];

  if (topicMatches.length) {
    reasons.push(`${topicMatches[0]} overlap`);
  }

  if (topicMatches.length > 1) {
    reasons.push(`${topicMatches.length} topic matches`);
  }

  if (moodMatch) {
    reasons.push(`${state.mood.toLowerCase()} mood fit`);
  }

  if (state.domainWeights[item.domain] >= 70) {
    reasons.push(`${item.domain} affinity`);
  }

  if (!reasons.length) {
    reasons.push("Discovery wildcard");
  }

  return reasons.slice(0, 3);
}

function findStrongestTopic(ranked) {
  const scores = new Map();

  ranked.slice(0, 5).forEach((item) => {
    item.tags.forEach((tag) => {
      scores.set(tag, (scores.get(tag) || 0) + item.total);
    });
  });

  return [...scores.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "General discovery";
}

function findBridgeDomain(ranked) {
  const domainCounts = new Map();

  ranked.slice(0, 6).forEach((item) => {
    domainCounts.set(item.domain, (domainCounts.get(item.domain) || 0) + 1);
  });

  const key = [...domainCounts.entries()].sort((left, right) => right[1] - left[1])[1]?.[0] || ranked[0]?.domain || "video";
  return domains.find((domain) => domain.key === key)?.label || "Video";
}

function resolveStrategyTitle(ranked) {
  const explorationCount = ranked.filter((item) => item.mode === "Explore").length;

  if (state.discovery >= 70 || explorationCount >= 3) {
    return "Wide-angle discovery";
  }

  if (state.selectedTopics.length >= 4) {
    return "Cross-signal blend";
  }

  return "Balanced discovery";
}

function resolveStrategyExplanation(ranked) {
  const lead = ranked[0];
  const leadDomain = domains.find((domain) => domain.key === lead?.domain)?.label || "content";
  return `PulseMix is prioritizing ${leadDomain.toLowerCase()} as the strongest anchor, then folding in adjacent formats to keep the feed coherent, explainable, and fresh.`;
}

function updateStatus(kind, label) {
  refs.aiStatus.className = `ai-status ${kind}`;
  refs.aiStatus.textContent = label;
}

function updateWebSearchStatus(kind, label) {
  refs.webSearchStatus.className = `ai-status ${kind}`;
  refs.webSearchStatus.textContent = label;
}

function playCosmicCoin() {
  const result = Math.random() > 0.5 ? "Chaos" : "Calm";
  refs.coinResult.textContent = result;
  refs.coinCopy.textContent =
    result === "Chaos"
      ? "The orbital coin demands dramatic recommendations and suspicious confidence."
      : "The orbital coin requests a softer landing and fewer cosmic accidents.";
}

function guessMoon(guess) {
  const winner = String(Math.floor(Math.random() * 3) + 1);
  const labels = { "1": "A", "2": "B", "3": "C" };
  const guessedLabel = labels[guess] || "?";
  const winnerLabel = labels[winner] || "?";

  if (guess === winner) {
    refs.moonGuessResult.textContent = `Crater ${guessedLabel} wins`;
    refs.moonGuessCopy.textContent = "You found the prank beacon. The moon salutes your chaotic intuition.";
  } else {
    refs.moonGuessResult.textContent = `Beacon was ${winnerLabel}`;
    refs.moonGuessCopy.textContent = `Close enough for April Fools science. Crater ${guessedLabel} contained only polite dust.`;
  }
}

function decodeSignal() {
  const messages = [
    "SPACE GEESE APPROVED",
    "MOON WIFI RESTORED",
    "CHAOS LEVEL ACCEPTABLE",
    "ALIEN INTERN ON BREAK"
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  refs.signalResult.textContent = message;
  refs.signalCopy.textContent = "Transmission decoded successfully. The signal was unhelpful but extremely confident.";
}

async function loadAstrologyRecommendation() {
  const sign = refs.astroSignSelect.value;
  refs.astroResult.textContent = `${capitalize(sign)} loading`;
  refs.astroCopy.textContent = "Mission control is scanning the internet for horoscope-grade mischief.";

  try {
    const response = await fetch(`/api/astrology?sign=${encodeURIComponent(sign)}`);

    if (!response.ok) {
      throw new Error(`Astrology request failed with status ${response.status}`);
    }

    const result = await response.json();
    refs.astroResult.textContent = `${capitalize(sign)} forecast`;
    refs.astroCopy.textContent = result.recommendation || "The stars declined to elaborate.";
  } catch (error) {
    refs.astroResult.textContent = `${capitalize(sign)} fallback`;
    refs.astroCopy.textContent = `The live astrology beam failed. (${error.message}) Try trusting your chaotic instincts instead.`;
  }
}

async function loadInternetRiddle() {
  refs.riddleResult.textContent = "Loading riddle";
  refs.riddleCopy.textContent = "Fetching a real riddle from the internet for the prank station.";
  refs.riddleQuestion.textContent = "Please wait while mission control steals a riddle from the internet.";

  try {
    const response = await fetch("/api/riddle");

    if (!response.ok) {
      throw new Error(`Riddle request failed with status ${response.status}`);
    }

    const result = await response.json();
    state.currentRiddle = result;
    refs.riddleResult.textContent = result.mode === "live" ? "Live riddle loaded" : "Fallback riddle loaded";
    refs.riddleCopy.textContent = result.mode === "live"
      ? "A real riddle just arrived from the internet. Proceed with caution."
      : "The internet went wobbly, so mission control served a backup riddle.";
    refs.riddleQuestion.textContent = result.question || "No riddle arrived. The prank satellites are embarrassed.";
  } catch (error) {
    state.currentRiddle = {
      question: "What has galaxies, geese, and no reliable launch schedule?",
      answer: "This April Fools dashboard.",
      mode: "fallback"
    };
    refs.riddleResult.textContent = "Fallback riddle loaded";
    refs.riddleCopy.textContent = `Live riddle fetch failed. (${error.message})`;
    refs.riddleQuestion.textContent = state.currentRiddle.question;
  }
}

function revealRiddleAnswer() {
  if (!state.currentRiddle) {
    refs.riddleResult.textContent = "No riddle yet";
    refs.riddleCopy.textContent = "Fetch a riddle first, then mission control can reveal the answer.";
    return;
  }

  refs.riddleResult.textContent = "Answer revealed";
  refs.riddleCopy.textContent = "The prank station has decided you suffered enough suspense.";
  refs.riddleQuestion.textContent = `Q: ${state.currentRiddle.question}  A: ${state.currentRiddle.answer}`;
}

function consultPrankOracle() {
  const question = refs.qaPrankInput.value.trim() || "Will the moon respect my roadmap?";
  const answers = [
    `Absolutely. "${question}" will succeed immediately after the office plant becomes CTO.`,
    `The oracle says no, but only because Mercury is in airplane mode.`,
    `Strong maybe. Please sacrifice one slide deck to the cosmic geese first.`,
    `Yes, provided your launch plan includes glitter, decoy metrics, and moon Wi-Fi.`,
    `The prank council reviewed "${question}" and recommends more drama, less certainty.`
  ];
  const answer = answers[Math.floor(Math.random() * answers.length)];

  refs.qaPrankTitle.textContent = "Oracle processing";
  refs.qaPrankCopy.textContent = "Consulting unreliable galactic experts...";
  animatePrankOutput(answer, () => {
    refs.qaPrankTitle.textContent = "Oracle response";
    refs.qaPrankCopy.textContent = "A prank-grade answer has arrived with alarming confidence.";
  });
}

function animatePrankOutput(message, onComplete) {
  window.clearInterval(qaPrankTimer);
  refs.qaPrankOutput.textContent = "";
  refs.qaPrankOutput.classList.add("typing");

  if (reducedMotion.matches) {
    refs.qaPrankOutput.textContent = message;
    refs.qaPrankOutput.classList.remove("typing");
    if (onComplete) {
      onComplete();
    }
    return;
  }

  let index = 0;
  qaPrankTimer = window.setInterval(() => {
    refs.qaPrankOutput.textContent = message.slice(0, index + 1);
    index += 1;

    if (index >= message.length) {
      window.clearInterval(qaPrankTimer);
      refs.qaPrankOutput.classList.remove("typing");
      if (onComplete) {
        onComplete();
      }
    }
  }, 18);
}

function cyclePrankButtonLabel() {
  const labels = ["Deploy Prank", "Do Not Press", "Absolutely Press", "Chaos Maybe"];
  refs.prankButton.textContent = labels[Math.floor(Math.random() * labels.length)];
}

function seedParticles() {
  refs.sceneParticles.innerHTML = "";

  for (let index = 0; index < 12; index += 1) {
    const particle = document.createElement("span");
    particle.className = "scene-particle";
    particle.style.setProperty("--size", `${6 + (index % 4) * 3}px`);
    particle.style.setProperty("--x", `${12 + ((index * 17) % 72)}%`);
    particle.style.setProperty("--y", `${18 + ((index * 11) % 58)}%`);
    particle.style.setProperty("--depth", `${18 + (index % 5) * 20}px`);
    particle.style.setProperty("--delay", `${index * 0.28}s`);
    particle.style.setProperty("--duration", `${8 + (index % 4) * 1.8}s`);
    refs.sceneParticles.append(particle);
  }
}

function handleScenePointer(event) {
  if (reducedMotion.matches) {
    return;
  }

  const bounds = refs.sceneFrame.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

  sceneState.targetX = x;
  sceneState.targetY = y;
}

function resetScenePointer() {
  sceneState.targetX = 0;
  sceneState.targetY = 0;
}

function startSceneMotion() {
  if (reducedMotion.matches || sceneState.rafId) {
    return;
  }

  const animate = (time) => {
    sceneState.currentX += (sceneState.targetX - sceneState.currentX) * 0.08;
    sceneState.currentY += (sceneState.targetY - sceneState.currentY) * 0.08;

    const tiltX = sceneState.currentY * -10;
    const tiltY = sceneState.currentX * 14;
    refs.sceneFrame.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    refs.sceneCore.style.transform = `translateZ(18px) rotateX(${tiltX * 0.45}deg) rotateY(${tiltY * 0.55}deg)`;
    refs.floatingCard.style.transform = `translate3d(${sceneState.currentX * 18}px, ${sceneState.currentY * -10}px, 80px)`;

    chipOrbitConfig.forEach((config) => {
      const chip = refs.sceneCore.querySelector(config.selector);
      if (!chip) {
        return;
      }

      const angle = time * config.speed + config.phase;
      const x = Math.cos(angle) * config.radiusX + sceneState.currentX * 20;
      const y = Math.sin(angle * 1.05) * config.radiusY + sceneState.currentY * 14;
      const z = Math.sin(angle) * config.depth + 42;
      chip.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    });

    sceneState.rafId = window.requestAnimationFrame(animate);
  };

  sceneState.rafId = window.requestAnimationFrame(animate);
}

function resetSceneTransforms() {
  refs.sceneFrame.style.transform = "";
  refs.sceneCore.style.transform = "";
  refs.floatingCard.style.transform = "";
  chipOrbitConfig.forEach((config) => {
    const chip = refs.sceneCore.querySelector(config.selector);
    if (chip) {
      chip.style.transform = "";
    }
  });
  sceneState.rafId = 0;
}

function showPrankToast(message) {
  window.clearTimeout(prankToastTimer);
  refs.prankToast.textContent = message;
  refs.prankToast.classList.add("visible");
  prankToastTimer = window.setTimeout(() => {
    refs.prankToast.classList.remove("visible");
  }, 2600);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function capitalize(value) {
  const text = String(value || "");
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}
