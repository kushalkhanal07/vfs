const EXTENSION_WEIGHTS = {
  ".pdf": 1,
  ".docx": 0.95,
  ".pptx": 0.92,
  ".xlsx": 0.85,
  ".doc": 0.8,
  ".ppt": 0.78,
  ".txt": 0.55,
  ".md": 0.58,
  ".csv": 0.5,
  ".png": 0.3,
  ".jpg": 0.3,
  ".jpeg": 0.3,
  ".gif": 0.28,
  ".mp4": 0.32,
  ".zip": 0.4,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeScore(value) {
  return clamp(value, 0, 1);
}

function getDaysSince(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY;

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return Number.POSITIVE_INFINITY;

  const elapsedMs = Date.now() - parsedDate.getTime();
  return elapsedMs / (1000 * 60 * 60 * 24);
}

function getRecencyScore(lastAccessed) {
  const daysSince = getDaysSince(lastAccessed);
  if (!Number.isFinite(daysSince)) {
    return 0.18;
  }

  return normalizeScore(1 - clamp(daysSince / 30, 0, 1));
}

function getAccessScore(accessCount) {
  const safeCount = Number(accessCount) || 0;
  return normalizeScore(Math.log1p(safeCount) / Math.log1p(30));
}

function getSizeScore(size) {
  const safeSize = Math.max(0, Number(size) || 0);
  const normalizedSize = clamp(
    Math.log1p(safeSize) / Math.log1p(50 * 1024 * 1024),
    0,
    1
  );

  return normalizeScore(1 - normalizedSize);
}

function getSharedScore(isShared) {
  return isShared ? 1 : 0;
}

function getExtensionScore(extension) {
  return EXTENSION_WEIGHTS[String(extension || "").toLowerCase()] || 0.2;
}

export function calculateFileImportance(file) {
  const recencyScore = getRecencyScore(file.lastAccessed);
  const accessScore = getAccessScore(file.accessCount);
  const sizeScore = getSizeScore(file.size);
  const sharedScore = getSharedScore(file.isShared);
  const extensionScore = getExtensionScore(file.extension);

  const rawScore =
    recencyScore * 0.35 +
    accessScore * 0.25 +
    sizeScore * 0.15 +
    sharedScore * 0.15 +
    extensionScore * 0.1;

  const importanceScore = normalizeScore(Number(rawScore.toFixed(3)));
  const safeAccessCount = Number(file.accessCount) || 0;
  const isFrequentlyVisited = safeAccessCount > 3;
  const isSharedFile = Boolean(file.isShared);

  let category = "LOW";
  if (isSharedFile || isFrequentlyVisited || importanceScore >= 0.67) {
    category = "HIGH";
  } else if (importanceScore >= 0.4) {
    category = "MEDIUM";
  }

  return {
    importanceScore,
    category,
    importanceCategory: category,
    isFrequentlyVisited,
    isSharedFile,
  };
}

export function sortFilesByImportance(files) {
  return [...files].sort((left, right) => {
    if (right.importanceScore !== left.importanceScore) {
      return right.importanceScore - left.importanceScore;
    }

    const rightAccessed = Number.isFinite(new Date(right.lastAccessed || 0).getTime())
      ? new Date(right.lastAccessed || 0).getTime()
      : 0;
    const leftAccessed = Number.isFinite(new Date(left.lastAccessed || 0).getTime())
      ? new Date(left.lastAccessed || 0).getTime()
      : 0;
    return rightAccessed - leftAccessed;
  });
}

export function sortFilesByRecency(files) {
  return [...files].sort((left, right) => {
    const rightAccessed = Number.isFinite(new Date(right.lastAccessed || 0).getTime())
      ? new Date(right.lastAccessed || 0).getTime()
      : 0;
    const leftAccessed = Number.isFinite(new Date(left.lastAccessed || 0).getTime())
      ? new Date(left.lastAccessed || 0).getTime()
      : 0;
    return rightAccessed - leftAccessed;
  });
}
