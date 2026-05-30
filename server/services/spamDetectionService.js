import crypto from "crypto";

/**
 * Compute spam score for note content
 * Score 0-100, threshold >60 = spam
 */
export function computeNoteSpamScore(content, existingNotes = []) {
  let score = 0;
  const penalties = [];

  // 1. EXACT DUPLICATE CHECK (40 pts)
  const contentHash = crypto
    .createHash("sha256")
    .update(content.trim().toLowerCase())
    .digest("hex");

  const exactMatch = existingNotes.find(
    (n) => n.contentHash === contentHash && !n.deleted
  );
  if (exactMatch) {
    score += 40;
    penalties.push("exact_duplicate");
  }

  // 2. HIGH SIMILARITY CHECK (30 pts)
  // Jaccard similarity on word sets (words >= 4 chars)
  if (!exactMatch) {
    const words = new Set(
      (content.toLowerCase().match(/\b\w{4,}\b/g) || []).filter(
        (w) => w.length <= 20
      )
    );
    
    for (const note of existingNotes) {
      if (note.deleted) continue;
      const noteWords = new Set(
        (note.content.toLowerCase().match(/\b\w{4,}\b/g) || []).filter(
          (w) => w.length <= 20
        )
      );

      if (words.size > 0 && noteWords.size > 0) {
        const intersection = new Set([...words].filter((w) => noteWords.has(w)));
        const union = new Set([...words, ...noteWords]);
        const similarity = intersection.size / union.size;

        if (similarity > 0.85) {
          score += 30;
          penalties.push("high_similarity");
          break;
        }
      }
    }
  }

  // 3. RAPID CREATION PATTERN (15 pts)
  // More than 10 notes in last 5 minutes = suspicious
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentCount = existingNotes.filter(
    (n) => !n.deleted && new Date(n.createdAt) > fiveMinAgo
  ).length;
  if (recentCount > 10) {
    score += 15;
    penalties.push("rapid_creation");
  }

  // 4. GIBBERISH DETECTION (10 pts)
  // Low ratio of real dictionary-like words (avg word length sanity check)
  const allWords = content.match(/\b\w+\b/g) || [];
  if (allWords.length > 0) {
    const avgLen = allWords.reduce((s, w) => s + w.length, 0) / allWords.length;
    const longWordRatio = allWords.filter((w) => w.length > 15).length / allWords.length;

    if (avgLen < 2 || longWordRatio > 0.3) {
      score += 10;
      penalties.push("gibberish_content");
    }
  }

  // 5. EMPTY / MINIMAL CONTENT (5 pts)
  const wordCount = allWords.length;
  if (wordCount < 5) {
    score += 5;
    penalties.push("minimal_content");
  }

  // 6. EXCESSIVE WHITESPACE / FORMATTING (5 pts)
  const lineCount = content.split("\n").length;
  const avgCharsPerLine = content.length / lineCount;
  if (avgCharsPerLine < 3 && content.length > 50) {
    score += 5;
    penalties.push("excessive_whitespace");
  }

  return {
    score: Math.min(score, 100),
    isSpam: score >= 60,
    isWarning: score >= 40 && score < 60,
    penalties,
    contentHash,
  };
}

/**
 * Check similarity between current content and existing notes
 * Returns similarity percentage (0-100)
 */
export function checkNoteSimilarity(newContent, existingNote) {
  const newWords = new Set(
    (newContent.toLowerCase().match(/\b\w{4,}\b/g) || []).filter(
      (w) => w.length <= 20
    )
  );

  const existingWords = new Set(
    (existingNote.content.toLowerCase().match(/\b\w{4,}\b/g) || []).filter(
      (w) => w.length <= 20
    )
  );

  if (newWords.size === 0 || existingWords.size === 0) {
    return 0;
  }

  const intersection = new Set([...newWords].filter((w) => existingWords.has(w)));
  const union = new Set([...newWords, ...existingWords]);
  const jaccardSimilarity = intersection.size / union.size;

  return Math.round(jaccardSimilarity * 100);
}

export function computeContentHash(content) {
  return crypto
    .createHash("sha256")
    .update(content.trim().toLowerCase())
    .digest("hex");
}

function normalizeWords(text) {
  return (String(text || "")
    .toLowerCase()
    .match(/\b[a-z0-9]{2,}\b/g) || [])
    .filter((word) => word.length > 3);
}

function normalizeTags(tags = []) {
  return Array.from(
    new Set(
      (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function getSubject(note = {}) {
  const subject = String(note.subject || note.folderName || "").trim().toLowerCase();
  if (subject) return subject;

  const tags = normalizeTags(note.tags);
  return tags[0] || "";
}

function getWordCount(text) {
  return (String(text || "").trim().match(/\b\w+\b/g) || []).length;
}

function getDateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysApart(left, right) {
  const leftDate = getDateValue(left);
  const rightDate = getDateValue(right);
  if (!leftDate || !rightDate) return null;

  return Math.abs(leftDate.getTime() - rightDate.getTime()) / (1000 * 60 * 60 * 24);
}

export function computeNoteCspaScore(candidateNote, existingNotes = []) {
  const candidateTitle = String(candidateNote?.title || "").trim();
  const candidateContent = String(candidateNote?.content || "").trim();
  const candidateTags = normalizeTags(candidateNote?.tags);
  const candidateSubject = getSubject(candidateNote);
  const candidateTitleWords = new Set(normalizeWords(candidateTitle));
  const candidateWordCount = getWordCount(candidateContent || candidateTitle);
  const candidateCreatedAt = candidateNote?.createdAt || new Date();

  let bestMatch = null;
  let bestScore = 0;
  let bestReasons = [];

  for (const existingNote of existingNotes) {
    if (!existingNote || existingNote.deleted) continue;

    const existingTitle = String(existingNote.title || "").trim();
    const existingContent = String(existingNote.content || "").trim();
    const existingTags = normalizeTags(existingNote.tags);
    const existingSubject = getSubject(existingNote);
    const existingTitleWords = new Set(normalizeWords(existingTitle));
    const existingWordCount = getWordCount(existingContent || existingTitle);
    const existingCreatedAt = existingNote.createdAt || existingNote.updatedAt || new Date();

    let score = 0;
    const reasons = [];

    const sharedTags = candidateTags.filter((tag) => existingTags.includes(tag));
    if (sharedTags.length > 0) {
      const tagScore = Math.min(sharedTags.length * 0.15, 0.4);
      score += tagScore;
      reasons.push(`shared_tags:${sharedTags.join(",")}`);
    }

    if (candidateSubject && existingSubject && candidateSubject === existingSubject) {
      score += 0.2;
      reasons.push(`same_subject:${candidateSubject}`);
    }

    const sharedTitleWords = [...candidateTitleWords].filter((word) => existingTitleWords.has(word));
    if (sharedTitleWords.length > 0) {
      const titleScore = Math.min(sharedTitleWords.length * 0.08, 0.25);
      score += titleScore;
      reasons.push(`title_overlap:${sharedTitleWords.join(",")}`);
    }

    if (candidateWordCount > 0 && existingWordCount > 0) {
      const shorter = Math.min(candidateWordCount, existingWordCount);
      const longer = Math.max(candidateWordCount, existingWordCount);
      const ratio = shorter / longer;

      if (ratio >= 0.7) {
        score += 0.1;
        reasons.push(`similar_length:${ratio.toFixed(2)}`);
      }
    }

    const gapInDays = daysApart(candidateCreatedAt, existingCreatedAt);
    if (gapInDays !== null && gapInDays <= 7) {
      score += 0.1;
      reasons.push(`same_week:${Math.round(gapInDays)}d`);
    }

    score = Math.min(score, 1);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = existingNote;
      bestReasons = reasons;
    }
  }

  return {
    score: Number(bestScore.toFixed(2)),
    scorePercent: Math.round(bestScore * 100),
    isDuplicate: bestScore >= 0.8,
    isRelated: bestScore >= 0.45 && bestScore < 0.8,
    reasons: bestReasons,
    bestMatch: bestMatch
      ? {
          _id: bestMatch._id,
          title: bestMatch.title,
          tags: bestMatch.tags || [],
          createdAt: bestMatch.createdAt,
          score: Number(bestScore.toFixed(2)),
        }
      : null,
  };
}
