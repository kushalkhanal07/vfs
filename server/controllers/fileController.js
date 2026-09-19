import crypto from "crypto";
import { createWriteStream } from "fs";
import { readFile, rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import SpamModeration from "../models/spamModerationModel.js";

const SPAM_THRESHOLD = 0.15;
const RISKY_EXTENSIONS = [".exe", ".bat", ".cmd", ".vbs", ".js", ".scr", ".pif"];
const FILENAME_DANGEROUS_WORDS = [
  "gift",
  "click",
  "bonus",
  "winner",
  "reward",
  "prize",
  "claim",
  "crypto",
  "invoice",
  "urgent",
  "verify",
  "password",
  "account",
  "payment",
  "reset",
  "bank",
  "otp",
  "security",
  "offer",
  "limited",
];

const SUSPICIOUS_PHRASES = [
  "click here",
  "free download",
  "urgent",
  "act now",
  "limited time",
  "claim your prize",
  "you won",
  "winner",
  "verify your account",
  "confirm password",
  "reset your password",
  "bank details",
  "security alert",
  "account suspended",
  "update payment",
  "send otp",
  "crypto giveaway",
  "investment guaranteed",
  "double your money",
  "make money fast",
  "risk free",
  "exclusive offer",
  "download now",
  "open attachment",
  "enable macros",
  "invoice attached",
  "wire transfer",
  "gift card",
  "immediate action required",
  "congratulations",
];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectSpam(filename, contentBuffer) {
  const lowerFilename = String(filename || "untitled").toLowerCase();
  const extension = path.extname(lowerFilename);
  const reasons = [];

  // Explicitly allow mp4 as requested.
  if (extension === ".mp4") {
    return {
      isSpam: false,
      spamScore: 0,
      matchedFilenameWords: [],
      matchedPhrases: [],
      reasons: [],
    };
  }

  let spamScore = 0;

  if (RISKY_EXTENSIONS.includes(extension)) {
    spamScore += 0.35;
    reasons.push(`risky_extension:${extension}`);
  }


  const matchedFilenameWords = FILENAME_DANGEROUS_WORDS.filter((word) =>
    lowerFilename.includes(word)
  );
  if (matchedFilenameWords.length > 0) {
    spamScore += 0.25 + Math.min(0.15, (matchedFilenameWords.length - 1) * 0.05);
    reasons.push(`filename_keywords:${matchedFilenameWords.join(",")}`);
  }

  const matchedPhrases = [];
  if (contentBuffer && contentBuffer.length > 0) {
    const contentStr = contentBuffer.toString("utf8").toLowerCase();
    let hasRepeatingChars = false;



    for (const phrase of SUSPICIOUS_PHRASES) {
      if (contentStr.includes(phrase)) {
        matchedPhrases.push(phrase);
      }
    }
    if (matchedPhrases.length > 0) {
      spamScore += Math.min(0.6, matchedPhrases.length * 0.12);
      reasons.push(`content_phrases:${matchedPhrases.join(",")}`);
    }


  }

  return {
    isSpam: spamScore >= SPAM_THRESHOLD,
    spamScore,
    matchedFilenameWords,
    matchedPhrases,
    reasons,
  };
}

// SHA-256 fingerprint of the file bytes. Same bytes always give the same hash,
// even if the file name is different.
function computeFileHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Find an active (not deleted) file of this user with the same content.
// Files uploaded before hashing existed have no fileHash yet: those with the same
// size are hashed from disk once, and the hash is saved for next time.
async function findDuplicateFile(userId, fileHash, fileSize, excludeFileId = null) {
  const excludeFilter = excludeFileId ? { _id: { $ne: excludeFileId } } : {};

  const match = await File.findOne({ userId, fileHash, deleted: false, ...excludeFilter })
    .select("name")
    .lean();
  if (match) return match;

  const oldFiles = await File.find({
    userId,
    deleted: false,
    size: fileSize,
    fileHash: { $exists: false },
    ...excludeFilter,
  }).select("name extension");

  for (const oldFile of oldFiles) {
    try {
      const oldFileHash = computeFileHash(await readFile(`./storage/${oldFile.id}${oldFile.extension}`));
      oldFile.fileHash = oldFileHash;
      await oldFile.save();

      if (oldFileHash === fileHash) {
        return { _id: oldFile._id, name: oldFile.name };
      }
    } catch (err) {
      // File missing on disk: nothing to compare
    }
  }

  return null;
}

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  try {
    const user = await User.findById(req.user._id);
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);
    const advertisedSize = parseInt(req.headers["content-length"]) || 0;

    // Check storage limit
    if (user.storageUsed + advertisedSize > user.storageLimit) {
      return res.status(413).json({ 
        error: "Storage limit exceeded",
        message: `Your storage is full. You have ${user.storageLimit - user.storageUsed} bytes remaining.`,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const contentBuffer = Buffer.concat(chunks);
    const fileSize = contentBuffer.length;

    if (user.storageUsed + fileSize > user.storageLimit) {
      return res.status(413).json({
        error: "Storage limit exceeded",
        message: `Your storage is full. You have ${user.storageLimit - user.storageUsed} bytes remaining.`,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
      });
    }

    // Duplicate check: block files whose content is already in the user's vault
    const fileHash = computeFileHash(contentBuffer);
    const duplicate = await findDuplicateFile(req.user._id, fileHash, fileSize);
    if (duplicate) {
      return res.status(409).json({
        error: `Duplicate file: this content is already in your vault as "${duplicate.name}"`,
        existingFileId: duplicate._id,
      });
    }

    const spamResult = detectSpam(filename, contentBuffer);
    if (spamResult.isSpam) {
      console.warn("[UPLOAD_BLOCKED]", {
        userId: req.user._id?.toString(),
        filename,
        spamScore: spamResult.spamScore,
        reasons: spamResult.reasons,
        matchedFilenameWords: spamResult.matchedFilenameWords,
        matchedPhrases: spamResult.matchedPhrases,
      });

      try {
        await SpamModeration.create({
          itemType: "file",
          itemId: filename,
          userId: req.user._id,
          fileName: filename,
          spamScore: spamResult.spamScore,
          reasons: spamResult.reasons,
          status: "blocked",
          metadata: {
            matchedFilenameWords: spamResult.matchedFilenameWords,
            matchedPhrases: spamResult.matchedPhrases,
            extension,
            fileSize,
          },
        });
      } catch (logError) {
        console.error("Failed to persist spam moderation record", logError);
      }

      return res.status(422).json({
        error: "Potential spam content detected",
        message: "Upload blocked because the file appears unsafe.",
      });
    }

    const insertedFile = await File.insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: req.user._id,
      size: fileSize,
      fileHash,
      lastAccessed: new Date(),
      accessCount: 0,
      isShared: false,
    });

    const fileId = insertedFile.id;
    const fullFileName = `${fileId}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);

    try {
      await new Promise((resolve, reject) => {
        writeStream.on("error", reject);
        writeStream.on("finish", resolve);
        writeStream.end(contentBuffer);
      });

      // Update user's storage used after successful write.
      user.storageUsed += fileSize;
      await user.save();

      // Log analytics activity
      try {
        const AnalyticsService = (await import("../services/analyticsService.js")).default;
        await AnalyticsService.logActivity({ userId: req.user._id, activityType: "file_upload", activityCount: 1, duration: 0, subject: null });
      } catch (e) {
        console.error("Failed to log analytics for file upload", e);
      }

      return res.status(201).json({ message: "File Uploaded", fileSize });
    } catch (err) {
      await File.deleteOne({ _id: insertedFile.insertedId });
      return res.status(404).json({ message: "Could not Upload File" });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = await File.findOneAndUpdate(
    {
      _id: id,
      $or: [{ userId: req.user._id }, { sharedWith: req.user._id }],
    },
    {
      $inc: { accessCount: 1 },
      $set: { lastAccessed: new Date() },
    },
    {
      new: true,
    }
  ).lean();
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // If "download" is requested, set the appropriate headers
  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    return res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.name = req.body.newFilename;
    await file.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    if (file.deleted) {
      return res.status(200).json({ message: "File already in trash" });
    }

    const user = await User.findById(req.user._id);

    file.deleted = true;
    await file.save();

    user.storageUsed = Math.max(0, user.storageUsed - (file.size || 0));
    await user.save();

    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const restoreFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    if (!file.deleted) {
      return res.status(200).json({ message: "File is already active" });
    }

    if (file.fileHash) {
      const duplicate = await findDuplicateFile(req.user._id, file.fileHash, file.size, file._id);
      if (duplicate) {
        return res.status(409).json({
          error: `Cannot restore: the same content already exists as "${duplicate.name}"`,
        });
      }
    }

    const user = await User.findById(req.user._id);
    const restoredUsage = user.storageUsed + (file.size || 0);

    if (restoredUsage > user.storageLimit) {
      return res.status(413).json({
        error: "Storage limit exceeded",
        message: "Cannot restore file because your current storage is full.",
      });
    }

    file.deleted = false;
    await file.save();

    user.storageUsed = restoredUsage;
    await user.save();

    return res.status(200).json({ message: "File Restored Successfully" });
  } catch (err) {
    next(err);
  }
};

export const permanentDeleteFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  }).select("extension size deleted");

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    if (!file.deleted) {
      const user = await User.findById(req.user._id);
      user.storageUsed = Math.max(0, user.storageUsed - (file.size || 0));
      await user.save();
    }

    await rm(`./storage/${id}${file.extension}`);
    await file.deleteOne();
    return res.status(200).json({ message: "File Permanently Deleted" });
  } catch (err) {
    next(err);
  }
};

export const toggleStarFile = async (req, res, next) => {
  const { id } = req.params;
  const file = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  if (!file) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    file.starred = !file.starred;
    await file.save();
    return res.status(200).json({ message: "Star status updated", starred: file.starred });
  } catch (err) {
    next(err);
  }
};

export const shareFileWithUser = async (req, res, next) => {
  const { id } = req.params;
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Recipient email is required" });
  }

  try {
    const file = await File.findOne({
      _id: id,
      userId: req.user._id,
      deleted: false,
    });

    if (!file) {
      return res.status(404).json({ error: "File not found!" });
    }

    const targetUser = await User.findOne({
      email: {
        $regex: new RegExp(`^${escapeRegex(email)}$`, "i"),
      },
    }).select("_id email name");

    if (!targetUser) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot share a file with yourself" });
    }

    file.isShared = true;
    if (!Array.isArray(file.sharedWith)) {
      file.sharedWith = [];
    }

    const isAlreadyShared = file.sharedWith.some(
      (sharedUserId) => sharedUserId.toString() === targetUser._id.toString()
    );

    if (!isAlreadyShared) {
      file.sharedWith.push(targetUser._id);
    }

    await file.save();

    return res.status(200).json({
      message: "File shared successfully",
      sharedWithEmail: targetUser.email,
      fileId: file._id,
      isShared: file.isShared,
    });
  } catch (err) {
    next(err);
  }
};

export const getFilesByType = async (req, res, next) => {
  const { type } = req.params;
  const user = req.user;

  try {
    let extensions = [];
    
    if (type === "videos") {
      extensions = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv"];
    } else if (type === "pictures") {
      extensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"];
    } else if (type === "docs") {
      extensions = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt", ".txt"];
    }

    const files = await File.find({
      userId: user._id,
      deleted: false,
      extension: { $in: extensions },
    }).lean();

    return res.status(200).json({
      files: files.map((file) => ({ ...file, id: file._id })),
    });
  } catch (err) {
    next(err);
  }
};

export const getStarredItems = async (req, res, next) => {
  const user = req.user;

  try {
    const starredFiles = await File.find({
      userId: user._id,
      deleted: false,
      starred: true,
    }).lean();

    const starredDirs = await Directory.find({
      userId: user._id,
      deleted: false,
      starred: true,
    }).lean();

    return res.status(200).json({
      files: starredFiles.map((file) => ({ ...file, id: file._id })),
      directories: starredDirs.map((dir) => ({ ...dir, id: dir._id })),
    });
  } catch (err) {
    next(err);
  }
};
