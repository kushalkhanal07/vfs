const XSS_PATTERNS = [
  "<script",
  "javascript:",
  "onerror=",
  "onload=",
  "alert(",
  "document.cookie",
  "eval(",
  "onmouseover=",
];

const SQL_PATTERNS = [
  "drop table",
  "select *",
  "union select",
  "insert into",
  "--",
  "1=1",
  "or 1=",
];

const PHISHING_PATTERNS = [
  "verify your account",
  "click here immediately",
  "your password",
  "enter your credentials",
  "urgent action",
];

const SUSPICIOUS_DOMAINS = [".ru", ".tk", ".xyz", "bit.ly", "tinyurl"];

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function extractUrls(text) {
  return text.match(/https?:\/\/[^\s]+/g) || [];
}

export function scanNoteContent(note = {}) {
  let threatScore = 0;
  const flags = [];

  const content = normalizeText(note.content);
  const title = normalizeText(note.title);
  const combined = `${content} ${title}`;

  const xssHits = XSS_PATTERNS.filter((pattern) => combined.includes(pattern));
  if (xssHits.length > 0) {
    threatScore += 0.4;
    flags.push("XSS_ATTEMPT");
  }

  const sqlHits = SQL_PATTERNS.filter((pattern) => combined.includes(pattern));
  if (sqlHits.length > 0) {
    threatScore += 0.35;
    flags.push("SQL_INJECTION");
  }

  const urls = extractUrls(combined);
  const badUrls = urls.filter((url) => SUSPICIOUS_DOMAINS.some((domain) => url.includes(domain)));
  if (badUrls.length > 0) {
    threatScore += 0.2;
    flags.push("SUSPICIOUS_LINK");
  }

  const phishingHits = PHISHING_PATTERNS.filter((pattern) => combined.includes(pattern));
  if (phishingHits.length >= 2) {
    threatScore += 0.25;
    flags.push("PHISHING_ATTEMPT");
  }

  if (note.isShared && threatScore > 0) {
    threatScore += 0.1;
  }

  threatScore = Math.max(0, Math.min(1, threatScore));

  return {
    threatScore: Number(threatScore.toFixed(2)),
    flags,
    action:
      threatScore >= 0.7
        ? "BLOCK_AND_REPORT"
        : threatScore >= 0.4
          ? "QUARANTINE"
          : "SAFE",
    message:
      threatScore >= 0.7
        ? "Note blocked - malicious content detected"
        : threatScore >= 0.4
          ? "Note hidden pending review"
          : "Note is clean",
  };
}