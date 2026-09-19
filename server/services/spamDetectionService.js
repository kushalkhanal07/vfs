import crypto from "crypto";

/*
 * SPAM DETECTION ALGORITHM
 *
 * A note gets points for every rule it breaks:
 *   Rule 1  Exact copy of another note                +40
 *   Rule 2  Almost the same words as another note     +30  (only checked if Rule 1 did not match)
 *   Rule 3  More than 10 notes in the last 5 minutes  +15
 *   Rule 4  Looks like gibberish                      +10
 *   Rule 5  Fewer than 5 words                         +5
 *   Rule 6  Too many empty / very short lines          +5
 *
 *   score >= 60        -> spam
 *   40 <= score < 60   -> warning
 */

// ---------------- Helper functions ----------------

const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";

// Put one item at the end of a list.
function addToList(list, item) {
  list[list.length] = item;
}

// A word character is a letter (a-z, A-Z), a digit (0-9) or "_".
function isWordCharacter(ch) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_"
  );
}

// Change "A".."Z" into "a".."z". Every other character stays the same.
function toSmallLetters(word) {
  let result = "";

  for (let i = 0; i < word.length; i++) {
    let ch = word[i];

    if (ch >= "A" && ch <= "Z") {
      for (let j = 0; j < UPPERCASE_LETTERS.length; j++) {
        if (ch === UPPERCASE_LETTERS[j]) {
          ch = LOWERCASE_LETTERS[j];
          break;
        }
      }
    }

    result = result + ch;
  }

  return result;
}

// Break text into words.
// Example: "Hi, my_note 42!" -> ["Hi", "my_note", "42"]
function getWords(text) {
  const words = [];
  let currentWord = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (isWordCharacter(ch)) {
      currentWord = currentWord + ch;
    } else if (currentWord !== "") {
      addToList(words, currentWord);
      currentWord = "";
    }
  }

  if (currentWord !== "") {
    addToList(words, currentWord);
  }

  return words;
}

// Unique small-letter words that are 4 to 20 characters long.
// "list" holds the words, "lookup" tells us quickly if a word is present.
function getUniqueWords(text) {
  const allWords = getWords(text);
  const list = [];
  const lookup = {};

  for (let i = 0; i < allWords.length; i++) {
    const word = toSmallLetters(allWords[i]);

    if (word.length < 4 || word.length > 20) {
      continue;
    }

    // "#" in front stops words like "constructor" clashing with built-in object keys
    const key = "#" + word;

    if (lookup[key] !== true) {
      lookup[key] = true;
      addToList(list, word);
    }
  }

  return { list, lookup };
}

// Jaccard similarity = common words / all different words
//   all different words = wordsA + wordsB - common
//   0 means nothing is shared, 1 means exactly the same words
function jaccardSimilarity(wordsA, wordsB) {
  let common = 0;

  for (let i = 0; i < wordsA.list.length; i++) {
    if (wordsB.lookup["#" + wordsA.list[i]] === true) {
      common = common + 1;
    }
  }

  const allDifferent = wordsA.list.length + wordsB.list.length - common;

  return common / allDifferent;
}

// Round to the nearest whole number (0.5 goes up). For numbers >= 0.
function roundToWholeNumber(value) {
  const decimalPart = value % 1;
  const wholePart = value - decimalPart;

  return decimalPart >= 0.5 ? wholePart + 1 : wholePart;
}

// ---------------- Main algorithm ----------------

export function computeNoteSpamScore(content, existingNotes = []) {
  let score = 0;
  const penalties = [];

  const contentHash = computeContentHash(content);

  // RULE 1: exact copy of another note (+40)
  let isExactCopy = false;

  for (let i = 0; i < existingNotes.length; i++) {
    const note = existingNotes[i];

    if (note.contentHash === contentHash && !note.deleted) {
      isExactCopy = true;
      break;
    }
  }

  if (isExactCopy) {
    score = score + 40;
    addToList(penalties, "exact_duplicate");
  }

  // RULE 2: more than 85% of the words are the same as another note (+30)
  if (!isExactCopy) {
    const newWords = getUniqueWords(content);

    for (let i = 0; i < existingNotes.length; i++) {
      const note = existingNotes[i];

      if (note.deleted) {
        continue;
      }

      const oldWords = getUniqueWords(note.content);

      if (newWords.list.length > 0 && oldWords.list.length > 0) {
        const similarity = jaccardSimilarity(newWords, oldWords);

        if (similarity > 0.85) {
          score = score + 30;
          addToList(penalties, "high_similarity");
          break;
        }
      }
    }
  }

  // RULE 3: more than 10 notes in the last 5 minutes (+15)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  let recentNotes = 0;

  for (let i = 0; i < existingNotes.length; i++) {
    const note = existingNotes[i];

    if (!note.deleted && new Date(note.createdAt) > fiveMinutesAgo) {
      recentNotes = recentNotes + 1;
    }
  }

  if (recentNotes > 10) {
    score = score + 15;
    addToList(penalties, "rapid_creation");
  }

  // RULE 4: gibberish (+10)
  //   average word length < 2   OR   more than 30% of words are longer than 15 letters
  const allWords = getWords(content);
  const wordCount = allWords.length;

  if (wordCount > 0) {
    let totalLetters = 0;
    let longWords = 0;

    for (let i = 0; i < wordCount; i++) {
      totalLetters = totalLetters + allWords[i].length;

      if (allWords[i].length > 15) {
        longWords = longWords + 1;
      }
    }

    const averageWordLength = totalLetters / wordCount;
    const longWordRatio = longWords / wordCount;

    if (averageWordLength < 2 || longWordRatio > 0.3) {
      score = score + 10;
      addToList(penalties, "gibberish_content");
    }
  }

  // RULE 5: fewer than 5 words (+5)
  if (wordCount < 5) {
    score = score + 5;
    addToList(penalties, "minimal_content");
  }

  // RULE 6: too much empty space (+5)
  //   average characters per line < 3   AND   note is longer than 50 characters
  let lineCount = 1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") {
      lineCount = lineCount + 1;
    }
  }

  const averageCharactersPerLine = content.length / lineCount;

  if (averageCharactersPerLine < 3 && content.length > 50) {
    score = score + 5;
    addToList(penalties, "excessive_whitespace");
  }

  return {
    score: score > 100 ? 100 : score,
    isSpam: score >= 60,
    isWarning: score >= 40 && score < 60,
    penalties,
    contentHash,
  };
}

// How similar two notes are, from 0 to 100 (percent).
export function checkNoteSimilarity(newContent, existingNote) {
  const newWords = getUniqueWords(newContent);
  const oldWords = getUniqueWords(existingNote.content);

  if (newWords.list.length === 0 || oldWords.list.length === 0) {
    return 0;
  }

  return roundToWholeNumber(jaccardSimilarity(newWords, oldWords) * 100);
}

// SHA-256 fingerprint of a note (used by Rule 1).
// Node's crypto, trim and toLowerCase are kept here on purpose: this hash is saved in the
// database, so it must stay exactly the same as before or old copies would not be found.
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
