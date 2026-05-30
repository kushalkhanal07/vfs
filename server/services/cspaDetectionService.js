const WORD_PATTERN = /\b[a-zA-Z]{4,}\b/g;
const MAX_TITLE_SCORE = 0.25;
const MAX_TAG_SCORE = 0.4;
const MAX_LENGTH_SCORE = 0.1;
const MAX_SUBJECT_SCORE = 0.2;
const MAX_WEEK_SCORE = 0.1;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWordSet(text) {
  return new Set((normalizeText(text).match(WORD_PATTERN) || []).filter((word) => word.length > 3));
}

function getKeywordSet(list = []) {
  return new Set(
    list
      .map((item) => normalizeText(item))
      .filter(Boolean)
  );
}

function getSubject(note = {}) {
  const subject = note.subject ?? note.tags?.[0] ?? "";
  return normalizeText(subject);
}

function getWordCount(note = {}) {
  if (Number.isFinite(note.wordCount) && note.wordCount > 0) {
    return note.wordCount;
  }

  return (String(note.content || "").match(/\b\w+\b/g) || []).length;
}

function getTitleWords(title = "") {
  return getWordSet(title);
}

function compareNotes(candidate, existing) {
  const breakdown = [];
  let score = 0;

  const candidateTags = getKeywordSet(candidate.tags || []);
  const existingTags = getKeywordSet(existing.tags || []);
  const sharedTags = [...candidateTags].filter((tag) => existingTags.has(tag));
  if (sharedTags.length > 0) {
    const tagScore = Math.min(MAX_TAG_SCORE, sharedTags.length * 0.15);
    score += tagScore;
    breakdown.push({ check: "tags", score: tagScore, details: sharedTags });
  }

  const candidateSubject = getSubject(candidate);
  const existingSubject = getSubject(existing);
  if (candidateSubject && existingSubject && candidateSubject === existingSubject) {
    score += MAX_SUBJECT_SCORE;
    breakdown.push({ check: "subject", score: MAX_SUBJECT_SCORE, details: [candidateSubject] });
  }

  const candidateTitleWords = getTitleWords(candidate.title);
  const existingTitleWords = getTitleWords(existing.title);
  const sharedTitleWords = [...candidateTitleWords].filter((word) => existingTitleWords.has(word));
  if (sharedTitleWords.length > 0) {
    const titleScore = Math.min(MAX_TITLE_SCORE, sharedTitleWords.length * 0.08);
    score += titleScore;
    breakdown.push({ check: "title", score: titleScore, details: sharedTitleWords });
  }

  const candidateWordCount = getWordCount(candidate);
  const existingWordCount = getWordCount(existing);
  const largerCount = Math.max(candidateWordCount, existingWordCount);
  const smallerCount = Math.min(candidateWordCount, existingWordCount);

  if (largerCount > 0) {
    const ratio = smallerCount / largerCount;
    if (ratio >= 0.7) {
      score += MAX_LENGTH_SCORE;
      breakdown.push({ check: "length", score: MAX_LENGTH_SCORE, details: [ratio.toFixed(2)] });
    }
  }

  const candidateDate = new Date(candidate.createdAt || Date.now());
  const existingDate = new Date(existing.createdAt || Date.now());
  const diffDays = Math.abs(candidateDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24);
  if (Number.isFinite(diffDays) && diffDays <= 7) {
    score += MAX_WEEK_SCORE;
    breakdown.push({ check: "created_week", score: MAX_WEEK_SCORE, details: [Math.round(diffDays)] });
  }

  return {
    score: Number(Math.min(score, 1).toFixed(2)),
    breakdown,
  };
}

function summarizeMatch(candidate, existing, comparison) {
  return {
    noteId: existing._id,
    title: existing.title,
    tags: existing.tags || [],
    subject: getSubject(existing) || null,
    wordCount: getWordCount(existing),
    createdAt: existing.createdAt,
    score: comparison.score,
    breakdown: comparison.breakdown,
  };
}

function splitContentBlocks(content = "") {
  return String(content)
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);
}

function mergeTags(primaryTags = [], secondaryTags = []) {
  const merged = [];
  const seen = new Set();

  for (const tag of [...primaryTags, ...secondaryTags]) {
    const normalized = String(tag || "").trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    merged.push(normalized);
  }

  return merged;
}

export function mergeNoteDraftWithExisting(existingNote, draftNote = {}) {
  const existingTitle = String(existingNote?.title || "").trim();
  const draftTitle = String(draftNote?.title || "").trim();
  const mergedTitle = draftTitle.length > existingTitle.length ? draftTitle : existingTitle;

  const contentBlocks = [
    ...splitContentBlocks(existingNote?.content || ""),
    ...splitContentBlocks(draftNote?.content || ""),
  ];

  const mergedContent = [];
  const seenBlocks = new Set();

  for (const block of contentBlocks) {
    const key = block.toLowerCase();
    if (seenBlocks.has(key)) continue;
    seenBlocks.add(key);
    mergedContent.push(block);
  }

  const existingTags = Array.isArray(existingNote?.tags) ? existingNote.tags : [];
  const draftTags = Array.isArray(draftNote?.tags) ? draftNote.tags : [];

  return {
    title: mergedTitle || draftTitle || existingTitle,
    content: mergedContent.join("\n\n"),
    tags: mergeTags(existingTags, draftTags),
  };
}

export function computeCspaScore(candidateNote, existingNotes = []) {
  let bestMatch = null;

  for (const existingNote of existingNotes) {
    if (!existingNote || existingNote.deleted) continue;

    const comparison = compareNotes(candidateNote, existingNote);

    if (!bestMatch || comparison.score > bestMatch.score) {
      bestMatch = summarizeMatch(candidateNote, existingNote, comparison);
    }
  }

  const score = bestMatch?.score ?? 0;

  return {
    score,
    isDuplicate: score >= 0.8,
    isRelated: score >= 0.45 && score < 0.8,
    bestMatch,
    message: score >= 0.8
      ? "You may have duplicate notes."
      : score >= 0.45
        ? "This note looks related to an existing note."
        : "No strong match found.",
  };
}
