import { Types } from "mongoose";
import fs from "fs/promises";
import path from "path";
import User from "../models/userModel.js";
import Note from "../models/noteModel.js";
import File from "../models/fileModel.js";
import RevisionSession from "../models/revisionSessionModel.js";
import RevisionHistory from "../models/revisionHistoryModel.js";
import RevisionSchedule from "../models/revisionScheduleModel.js";
import SearchHistory from "../models/searchHistoryModel.js";
import Notification from "../models/notificationModel.js";
import ActivityLog from "../models/activityLogModel.js";
import Session from "../models/sessionModel.js";
import SubjectProgress from "../models/subjectProgressModel.js";
import SpamModeration from "../models/spamModerationModel.js";
import AdminActionLog from "../models/adminActionLogModel.js";
import Feedback from "../models/feedbackModel.js";
import AdminSettings from "../models/adminSettingsModel.js";
import Subject from "../models/subjectModel.js";
import { normalizeRole } from "../permission.js";

const DEFAULT_ADMIN_SETTINGS = {
  key: "global",
  uploadSizeLimit: 5242880,
  allowedFileTypes: ["pdf", "docx", "pptx", "png", "jpg", "jpeg", "txt"],
  spamThreshold: 0.15,
  revisionSettings: {
    defaultIntervalDays: 1,
    reminderLeadMinutes: 10,
    streakGraceDays: 1,
  },
  notificationSettings: {
    dailyDigestEnabled: true,
    broadcastEnabled: true,
  },
  storageLimitBytes: 5242880,
};

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDay(date) {
  return date.toISOString().slice(0, 10);
}

function fillSeries(rows = [], days = 30, fieldName = "count") {
  const lookup = new Map(rows.map((row) => [row.date, row[fieldName] ?? row.count ?? 0]));
  const series = [];
  const start = startOfDay(addDays(new Date(), -(days - 1)));

  for (let index = 0; index < days; index += 1) {
    const date = addDays(start, index);
    const key = formatDay(date);
    series.push({ date: key, count: Number(lookup.get(key) || 0) });
  }

  return series;
}

function buildPagination(page = 1, limit = 10) {
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

function normalizeRoleLabel(role) {
  const normalized = normalizeRole(role);
  return normalized === "Super Admin" ? "Admin" : normalized;
}

function getStreakStats(dates = []) {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDates = [...new Set(dates.map((date) => formatDay(startOfDay(new Date(date)))))].sort(
    (left, right) => right.localeCompare(left),
  );

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = new Date(uniqueDates[index - 1]);
    const current = new Date(uniqueDates[index]);
    const diffDays = Math.round((previous - current) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak += 1;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = tempStreak;

  return { currentStreak, longestStreak };
}

async function getCountsByUser(model, field, match = {}) {
  const rows = await model
    .aggregate([
      { $match: match },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ])
    .exec();

  return new Map(rows.map((row) => [String(row._id), row.count]));
}

async function getDailyCounts(model, dateField = "createdAt", match = {}, days = 30) {
  const startDate = startOfDay(addDays(new Date(), -(days - 1)));
  const rows = await model
    .aggregate([
      { $match: { ...match, [dateField]: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ])
    .exec();

  return fillSeries(rows, days);
}

async function logAdminAction(adminId, action, entityType, entityId = null, details = {}, req = null, status = "success") {
  try {
    await AdminActionLog.create({
      adminId,
      action,
      entityType,
      entityId,
      details,
      status,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || null,
      userAgent: req?.headers?.["user-agent"] || null,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

async function removeFileFromStorage(fileDoc) {
  if (!fileDoc?._id || !fileDoc?.extension) {
    return;
  }

  const storagePath = path.resolve(process.cwd(), "storage", `${fileDoc._id}${fileDoc.extension}`);
  await fs.rm(storagePath, { force: true });
}

async function getSubjectMasterySeries() {
  const rows = await SubjectProgress.aggregate([
    {
      $group: {
        _id: "$subject",
        mastery: { $avg: "$mastery" },
        totalReviews: { $sum: "$totalReviews" },
        successfulReviews: { $sum: "$successfulReviews" },
      },
    },
    { $project: { _id: 0, subject: "$_id", mastery: { $round: ["$mastery", 0] }, totalReviews: 1, successfulReviews: 1 } },
    { $sort: { mastery: -1, subject: 1 } },
  ]).exec();

  return rows.filter((row) => row.subject);
}

async function getProductivitySeries(days = 30) {
  const activity = await getDailyCounts(ActivityLog, "createdAt", { activityType: { $in: ["study_session_create", "study_session_start", "revision_complete", "file_upload", "note_create"] } }, days);
  const focusRows = await ActivityLog.aggregate([
    {
      $match: {
        activityType: { $in: ["study_session_create", "study_session_start"] },
        createdAt: { $gte: startOfDay(addDays(new Date(), -(days - 1))) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalDuration: { $sum: "$duration" },
      },
    },
    { $project: { _id: 0, date: "$_id", totalDuration: 1 } },
    { $sort: { date: 1 } },
  ]).exec();

  const focusLookup = new Map(focusRows.map((row) => [row.date, Math.round((row.totalDuration || 0) / 60)]));

  return activity.map((row) => ({
    date: row.date,
    activities: row.count,
    focusMinutes: Number(focusLookup.get(row.date) || 0),
  }));
}

export class AdminService {
  static async getDashboardOverview() {
    const thirtyDays = 30;
    const today = startOfDay(new Date());
    const yesterday = addDays(today, -1);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalNotes,
      totalFiles,
      totalRevisionSessions,
      completedRevisions,
      recentCompletedRevisions,
      missedRevisions,
      spamFilesDetected,
      spamNotesDetected,
      notificationsSent,
      storageAgg,
      userGrowthTrend,
      dailyActivityTrend,
      revisionTrend,
      subjectPopularityRows,
      storageUsageRows,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "Active" }),
      User.countDocuments({ status: "Suspended" }),
      Note.countDocuments({ deleted: false }),
      File.countDocuments({ deleted: false }),
      RevisionSession.countDocuments({}),
      RevisionSession.countDocuments({ status: "completed" }),
      RevisionHistory.countDocuments({ reviewDate: { $gte: addDays(today, -thirtyDays) } }),
      RevisionSession.countDocuments({ status: "scheduled", revisionDate: { $lt: yesterday } }),
      SpamModeration.countDocuments({ itemType: "file", status: "blocked" }),
      Note.countDocuments({ isSpamFlagged: true, deleted: false }),
      Notification.countDocuments({}),
      User.aggregate([
        {
          $group: {
            _id: null,
            storageUsed: { $sum: "$storageUsed" },
            storageLimit: { $sum: "$storageLimit" },
          },
        },
      ]).exec(),
      getDailyCounts(User, "createdAt", {}, thirtyDays),
      getDailyCounts(ActivityLog, "createdAt", {}, thirtyDays),
      getDailyCounts(RevisionSession, "createdAt", { status: "completed" }, thirtyDays),
      RevisionSession.aggregate([
        { $match: { subject: { $ne: null } } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 8 },
        { $project: { _id: 0, subject: "$_id", count: 1 } },
      ]).exec(),
      User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            storageUsed: 1,
            storageLimit: 1,
            usage: {
              $cond: [
                { $gt: ["$storageLimit", 0] },
                { $round: [{ $multiply: [{ $divide: ["$storageUsed", "$storageLimit"] }, 100] }, 0] },
                0,
              ],
            },
          },
        },
        { $sort: { storageUsed: -1 } },
        { $limit: 10 },
      ]).exec(),
    ]);

    const storageTotals = storageAgg[0] || { storageUsed: 0, storageLimit: 0 };
    const totalStoragePercent = storageTotals.storageLimit > 0
      ? Math.round((storageTotals.storageUsed / storageTotals.storageLimit) * 100)
      : 0;

    const subjectPopularity = subjectPopularityRows.map((row) => ({
      label: row.subject,
      value: row.count,
    }));

    const storageUsage = storageUsageRows.map((row) => ({
      label: row.name,
      value: row.usage,
      storageUsed: row.storageUsed,
      storageLimit: row.storageLimit,
      email: row.email,
    }));

    const currentStreakDates = await RevisionHistory.find({ reviewDate: { $gte: addDays(today, -90) } })
      .select("reviewDate")
      .lean();
    const streakStats = getStreakStats(currentStreakDates.map((row) => row.reviewDate));

    const averageRecallScoreRow = await RevisionHistory.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$reviewScore" },
        },
      },
    ]).exec();

    const averageRecallScore = averageRecallScoreRow[0]?.avgScore
      ? Math.round(averageRecallScoreRow[0].avgScore * 20)
      : 0;

    return {
      summary: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalNotes,
        totalFiles,
        totalRevisionSessions,
        completedRevisions,
        missedRevisions,
        spamFilesDetected,
        spamNotesDetected,
        notificationsSent,
        storageUsed: storageTotals.storageUsed || 0,
        storageLimit: storageTotals.storageLimit || 0,
        storagePercent: totalStoragePercent,
        averageRecallScore,
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
        recentCompletedRevisions,
      },
      charts: {
        userGrowthTrend,
        dailyActivityTrend,
        revisionCompletionTrend: revisionTrend,
        subjectPopularity,
        storageUsage,
      },
    };
  }

  static async getUsers({ search, status, role, page = 1, limit = 10, sort = "-createdAt" } = {}) {
    const { skip, limit: safeLimit, page: safePage } = buildPagination(page, limit);
    const filter = {};

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (status) {
      filter.status = status;
    }

    if (role) {
      filter.role = role === "Admin" ? { $in: ["Admin", "Super Admin"] } : role;
    }

    const [items, total, noteCounts, fileCounts, revisionCounts, loginSessions] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
      User.countDocuments(filter),
      getCountsByUser(Note, "userId", { deleted: false }),
      getCountsByUser(File, "userId", { deleted: false }),
      getCountsByUser(RevisionSession, "user", {}),
      Session.find({}).select("userId").lean(),
    ]);

    const loggedInUsers = new Set(loginSessions.map((session) => String(session.userId)));

    const users = items.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: normalizeRoleLabel(user.role),
      status: user.status || "Active",
      filesCount: fileCounts.get(String(user._id)) || 0,
      notesCount: noteCounts.get(String(user._id)) || 0,
      revisionCount: revisionCounts.get(String(user._id)) || 0,
      isLoggedIn: loggedInUsers.has(String(user._id)),
      storageUsed: user.storageUsed || 0,
      storageLimit: user.storageLimit || 0,
      joinedDate: user.createdAt,
      picture: user.picture,
    }));

    return {
      users,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1),
      },
    };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).lean();

    if (!user) {
      return null;
    }

    const [noteCount, fileCount, revisionCount, recentActivity, recentSearches, subjectMastery, storageAgg] = await Promise.all([
      Note.countDocuments({ userId, deleted: false }),
      File.countDocuments({ userId, deleted: false }),
      RevisionSession.countDocuments({ user: userId }),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(12).lean(),
      SearchHistory.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      SubjectProgress.find({ userId }).sort({ mastery: -1 }).lean(),
      File.aggregate([
        { $match: { userId: new Types.ObjectId(String(userId)), deleted: false } },
        {
          $group: {
            _id: null,
            storageUsed: { $sum: "$size" },
          },
        },
      ]).exec(),
    ]);

    const storageUsed = storageAgg[0]?.storageUsed || user.storageUsed || 0;
    const storagePercent = user.storageLimit > 0 ? Math.round((storageUsed / user.storageLimit) * 100) : 0;

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: normalizeRoleLabel(user.role),
        status: user.status || "Active",
        picture: user.picture,
        storageUsed,
        storageLimit: user.storageLimit,
        storagePercent,
        joinedAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      analytics: {
        noteCount,
        fileCount,
        revisionCount,
        recentActivity,
        recentSearches,
        subjectMastery,
      },
    };
  }

  static async updateUserStatus(userId, status, adminId, req = null) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true },
    ).lean();

    if (user) {
      await logAdminAction(adminId, "update_user_status", "user", userId, { status }, req);
    }

    return user;
  }

  static async updateUserRole(userId, role, adminId, req = null) {
    const normalizedRole = role === "Admin" ? "Super Admin" : role;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: normalizedRole } },
      { new: true },
    ).lean();

    if (user) {
      await logAdminAction(adminId, "update_user_role", "user", userId, { role: normalizedRole }, req);
    }

    return user;
  }

  static async deleteUser(userId, adminId, req = null) {
    const user = await User.findById(userId).lean();

    if (!user) {
      return null;
    }

    const files = await File.find({ userId }).lean();
    await Promise.all(files.map((fileDoc) => removeFileFromStorage(fileDoc)));

    await Promise.all([
      Session.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      File.deleteMany({ userId }),
      RevisionSession.deleteMany({ user: userId }),
      RevisionHistory.deleteMany({ userId }),
      RevisionSchedule.deleteMany({ userId }),
      SearchHistory.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      ActivityLog.deleteMany({ userId }),
      SubjectProgress.deleteMany({ userId }),
      SpamModeration.deleteMany({ userId }),
      Feedback.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    await logAdminAction(adminId, "delete_user", "user", userId, { email: user.email }, req);

    return user;
  }

  static async getLearningAnalytics() {
    const [mastery, revisions, productivity, leaderboard] = await Promise.all([
      getSubjectMasterySeries(),
      RevisionSession.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]).exec(),
      getProductivitySeries(30),
      SubjectProgress.aggregate([
        {
          $group: {
            _id: "$userId",
            avgMastery: { $avg: "$mastery" },
            totalReviews: { $sum: "$totalReviews" },
          },
        },
        { $sort: { avgMastery: -1, totalReviews: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            name: "$user.name",
            email: "$user.email",
            mastery: { $round: ["$avgMastery", 0] },
            totalReviews: 1,
          },
        },
      ]).exec(),
    ]);

    return {
      mastery,
      revisions,
      productivity,
      leaderboard,
    };
  }

  static async getRevisionAnalytics() {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = addDays(today, -30);

    const [
      totalRevisionSessions,
      completedSessions,
      missedSessions,
      upcomingSessions,
      averageRecallScoreRow,
      revisionTrend,
      streakDates,
    ] = await Promise.all([
      RevisionSession.countDocuments({}),
      RevisionSession.countDocuments({ status: "completed" }),
      RevisionSession.countDocuments({ status: "scheduled", revisionDate: { $lt: today } }),
      RevisionSession.countDocuments({ status: "scheduled", revisionDate: { $gte: today } }),
      RevisionHistory.aggregate([
        { $group: { _id: null, avgScore: { $avg: "$reviewScore" } } },
      ]).exec(),
      getDailyCounts(RevisionSession, "createdAt", { status: "completed" }, 30),
      RevisionHistory.find({ reviewDate: { $gte: thirtyDaysAgo } }).select("reviewDate").lean(),
    ]);

    const streakStats = getStreakStats(streakDates.map((row) => row.reviewDate));
    const averageRecallScore = averageRecallScoreRow[0]?.avgScore
      ? Math.round(averageRecallScoreRow[0].avgScore * 20)
      : 0;

    return {
      summary: {
        totalRevisionSessions,
        completedSessions,
        missedSessions,
        upcomingSessions,
        averageRecallScore,
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
      },
      trend: revisionTrend,
    };
  }

  static async getFiles({ search, type, page = 1, limit = 10 } = {}) {
    const { skip, limit: safeLimit, page: safePage } = buildPagination(page, limit);
    const filter = { deleted: false };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ name: regex }, { extension: regex }, { originalName: regex }];
    }

    if (type) {
      filter.extension = type.startsWith(".") ? type : `.${type}`;
    }

    const [rows, total] = await Promise.all([
      File.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            extension: 1,
            size: 1,
            createdAt: 1,
            updatedAt: 1,
            lastAccessed: 1,
            accessCount: 1,
            ownerName: "$owner.name",
            ownerEmail: "$owner.email",
            ownerId: "$owner._id",
            userId: 1,
            fileHash: 1,
            mimeType: 1,
          },
        },
      ]).exec(),
      File.countDocuments(filter),
    ]);

    return {
      files: rows.map((row) => ({
        ...row,
        id: String(row._id),
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1),
      },
    };
  }

  static async deleteFile(fileId, adminId, req = null) {
    const file = await File.findById(fileId).lean();

    if (!file) {
      return null;
    }

    await removeFileFromStorage(file);
    await File.deleteOne({ _id: fileId });
    await logAdminAction(adminId, "delete_file", "file", fileId, { fileName: file.name }, req);
    return file;
  }

  static async getStorageAnalytics() {
    const [storageByUser, extensionBreakdown, totals, topFiles] = await Promise.all([
      User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            storageUsed: 1,
            storageLimit: 1,
            percent: {
              $cond: [
                { $gt: ["$storageLimit", 0] },
                { $round: [{ $multiply: [{ $divide: ["$storageUsed", "$storageLimit"] }, 100] }, 0] },
                0,
              ],
            },
          },
        },
        { $sort: { storageUsed: -1 } },
        { $limit: 10 },
      ]).exec(),
      File.aggregate([
        { $group: { _id: "$extension", count: { $sum: 1 }, totalSize: { $sum: "$size" } } },
        { $sort: { totalSize: -1 } },
      ]).exec(),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalStorageUsed: { $sum: "$storageUsed" },
            totalStorageLimit: { $sum: "$storageLimit" },
          },
        },
      ]).exec(),
      File.aggregate([
        { $sort: { size: -1 } },
        { $limit: 5 },
        { $project: { name: 1, size: 1, extension: 1, userId: 1 } },
      ]).exec(),
    ]);

    const summary = totals[0] || { totalStorageUsed: 0, totalStorageLimit: 0 };

    return {
      summary: {
        totalStorageUsed: summary.totalStorageUsed || 0,
        totalStorageLimit: summary.totalStorageLimit || 0,
        totalStoragePercent: summary.totalStorageLimit > 0
          ? Math.round((summary.totalStorageUsed / summary.totalStorageLimit) * 100)
          : 0,
      },
      storageByUser: storageByUser.map((row) => ({
        ...row,
        id: String(row._id),
      })),
      extensionBreakdown: extensionBreakdown.map((row) => ({
        extension: row._id || "unknown",
        count: row.count,
        totalSize: row.totalSize,
      })),
      topFiles,
    };
  }

  static async getSearchAnalytics() {
    const [topQueries, failedSearches, totals, userSearches] = await Promise.all([
      SearchHistory.aggregate([
        { $group: { _id: "$query", count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 15 },
        { $project: { _id: 0, query: "$_id", count: 1, avgResults: { $round: ["$avgResults", 0] } } },
      ]).exec(),
      SearchHistory.aggregate([
        { $match: { resultsCount: 0 } },
        { $group: { _id: "$query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, query: "$_id", count: 1 } },
      ]).exec(),
      SearchHistory.aggregate([
        { $group: { _id: null, totalSearches: { $sum: 1 }, successSearches: { $sum: { $cond: [{ $gt: ["$resultsCount", 0] }, 1, 0] } } } },
      ]).exec(),
      SearchHistory.aggregate([
        { $group: { _id: "$userId", searches: { $sum: 1 } } },
        { $sort: { searches: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, userId: "$_id", name: "$user.name", email: "$user.email", searches: 1 } },
      ]).exec(),
    ]);

    const summary = totals[0] || { totalSearches: 0, successSearches: 0 };

    return {
      summary: {
        totalSearches: summary.totalSearches || 0,
        successSearches: summary.successSearches || 0,
        failedSearches: Math.max((summary.totalSearches || 0) - (summary.successSearches || 0), 0),
        successRate: summary.totalSearches > 0
          ? Math.round(((summary.successSearches || 0) / summary.totalSearches) * 100)
          : 0,
      },
      topQueries,
      failedSearches,
      userSearches,
    };
  }

  static async getSpamAnalytics({ page = 1, limit = 10 } = {}) {
    const { skip, limit: safeLimit, page: safePage } = buildPagination(page, limit);
    const [items, total, noteCount, blockedCount] = await Promise.all([
      SpamModeration.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: safeLimit },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            itemType: 1,
            itemId: 1,
            fileName: 1,
            title: 1,
            spamScore: 1,
            reasons: 1,
            status: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
          },
        },
      ]).exec(),
      SpamModeration.countDocuments({}),
      Note.countDocuments({ isSpamFlagged: true, deleted: false }),
      SpamModeration.countDocuments({ itemType: "file", status: "blocked" }),
    ]);

    return {
      overview: {
        totalIncidents: total,
        noteIncidents: noteCount,
        blockedFiles: blockedCount,
      },
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1),
      },
    };
  }

  static async getSpamIncident(spamId) {
    const record = await SpamModeration.findById(spamId).lean();

    if (!record) {
      return null;
    }

    const user = await User.findById(record.userId).select("name email role status picture").lean();
    return {
      ...record,
      id: String(record._id),
      user,
    };
  }

  static async reviewSpamIncident(spamId, payload, adminId, req = null) {
    const update = {
      status: payload.status || "reviewed",
      notes: payload.notes || "",
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    const record = await SpamModeration.findByIdAndUpdate(spamId, { $set: update }, { new: true }).lean();

    if (record) {
      await logAdminAction(adminId, "review_spam_incident", record.itemType, spamId, { status: update.status }, req);
    }

    return record;
  }

  static async getSubjects() {
    const subjects = await Subject.find().sort({ order: 1, name: 1 }).lean();
    return subjects.map((subject) => ({
      ...subject,
      id: String(subject._id),
    }));
  }

  static async createSubject(payload, adminId, req = null) {
    const subject = await Subject.create({
      name: payload.name,
      description: payload.description || "",
      color: payload.color || "#2563eb",
      active: payload.active ?? true,
      order: payload.order || 0,
      createdBy: adminId,
      updatedBy: adminId,
    });

    await logAdminAction(adminId, "create_subject", "subject", subject._id, { name: subject.name }, req);
    return subject.toObject();
  }

  static async updateSubject(subjectId, payload, adminId, req = null) {
    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        $set: {
          name: payload.name,
          description: payload.description ?? "",
          color: payload.color ?? "#2563eb",
          active: payload.active ?? true,
          order: payload.order ?? 0,
          updatedBy: adminId,
        },
      },
      { new: true },
    ).lean();

    if (subject) {
      await logAdminAction(adminId, "update_subject", "subject", subjectId, { name: subject.name }, req);
    }

    return subject;
  }

  static async deleteSubject(subjectId, adminId, req = null) {
    const subject = await Subject.findByIdAndDelete(subjectId).lean();

    if (subject) {
      await logAdminAction(adminId, "delete_subject", "subject", subjectId, { name: subject.name }, req);
    }

    return subject;
  }

  static async getNotifications() {
    const notifications = await Notification.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          message: 1,
          type: 1,
          isRead: 1,
          createdAt: 1,
          userId: 1,
          userName: "$user.name",
          userEmail: "$user.email",
        },
      },
    ]).exec();

    return notifications;
  }

  static async createNotifications(payload, adminId, req = null) {
    const targetUserIds = Array.isArray(payload.targetUserIds) ? payload.targetUserIds : [];
    const broadcast = payload.broadcast !== false;
    const query = payload.role ? { role: payload.role === "Admin" ? { $in: ["Admin", "Super Admin"] } : payload.role } : {};

    const recipients = broadcast && targetUserIds.length === 0
      ? await User.find({ ...query, status: "Active" }).select("_id").lean()
      : await User.find({ _id: { $in: targetUserIds } }).select("_id").lean();

    const docs = recipients.map((user) => ({
      userId: user._id,
      title: payload.title,
      message: payload.message,
      type: payload.type || "system",
      metadata: payload.metadata || null,
      actionUrl: payload.actionUrl || null,
    }));

    if (docs.length === 0) {
      return { created: 0 };
    }

    await Notification.insertMany(docs);
    await logAdminAction(adminId, "create_notifications", "notification", null, { count: docs.length }, req);
    return { created: docs.length };
  }

  static async getFeedback() {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).lean();
    return feedback.map((item) => ({
      ...item,
      id: String(item._id),
    }));
  }

  static async updateFeedback(feedbackId, payload, adminId, req = null) {
    const update = {
      status: payload.status || "resolved",
      adminReply: payload.adminReply || "",
      resolvedBy: adminId,
      resolvedAt: new Date(),
    };

    const feedback = await Feedback.findByIdAndUpdate(feedbackId, { $set: update }, { new: true }).lean();

    if (feedback) {
      await logAdminAction(adminId, "update_feedback", "feedback", feedbackId, { status: update.status }, req);
    }

    return feedback;
  }

  static async getSystemLogs() {
    const [logins, uploads, searches, revisions, notifications, adminActions] = await Promise.all([
      Session.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "login" },
            entityType: { $literal: "session" },
            createdAt: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            details: { $literal: { message: "User session created" } },
          },
        },
      ]).exec(),
      ActivityLog.aggregate([
        { $match: { activityType: "file_upload" } },
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "file_upload" },
            entityType: { $literal: "file" },
            createdAt: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            details: "$meta",
          },
        },
      ]).exec(),
      SearchHistory.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "search" },
            entityType: { $literal: "search" },
            createdAt: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            details: { query: "$query", resultsCount: "$resultsCount" },
          },
        },
      ]).exec(),
      RevisionHistory.aggregate([
        { $sort: { reviewDate: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "revision" },
            entityType: { $literal: "revision" },
            createdAt: "$reviewDate",
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            details: { reviewScore: "$reviewScore", contentType: "$contentType", timeSpent: "$timeSpent" },
          },
        },
      ]).exec(),
      Notification.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "notification" },
            entityType: { $literal: "notification" },
            createdAt: 1,
            userId: 1,
            userName: "$user.name",
            userEmail: "$user.email",
            details: { title: "$title", type: "$type", isRead: "$isRead" },
          },
        },
      ]).exec(),
      AdminActionLog.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "adminId",
            foreignField: "_id",
            as: "admin",
          },
        },
        { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            event: { $literal: "admin_action" },
            entityType: 1,
            createdAt: 1,
            adminId: 1,
            userName: "$admin.name",
            userEmail: "$admin.email",
            details: { action: "$action", entityId: "$entityId", status: "$status", details: "$details" },
          },
        },
      ]).exec(),
    ]);

    const items = [...logins, ...uploads, ...searches, ...revisions, ...notifications, ...adminActions]
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 200);

    return {
      items,
      counts: {
        logins: logins.length,
        uploads: uploads.length,
        searches: searches.length,
        revisions: revisions.length,
        notifications: notifications.length,
        adminActions: adminActions.length,
      },
    };
  }

  static async getAdminSettings() {
    const settings = await AdminSettings.findOne({ key: "global" }).lean();
    return settings || DEFAULT_ADMIN_SETTINGS;
  }

  static async updateAdminSettings(payload, adminId, req = null) {
    const settings = await AdminSettings.findOneAndUpdate(
      { key: "global" },
      {
        $set: {
          uploadSizeLimit: payload.uploadSizeLimit ?? DEFAULT_ADMIN_SETTINGS.uploadSizeLimit,
          allowedFileTypes: payload.allowedFileTypes ?? DEFAULT_ADMIN_SETTINGS.allowedFileTypes,
          spamThreshold: payload.spamThreshold ?? DEFAULT_ADMIN_SETTINGS.spamThreshold,
          revisionSettings: payload.revisionSettings ?? DEFAULT_ADMIN_SETTINGS.revisionSettings,
          notificationSettings: payload.notificationSettings ?? DEFAULT_ADMIN_SETTINGS.notificationSettings,
          storageLimitBytes: payload.storageLimitBytes ?? DEFAULT_ADMIN_SETTINGS.storageLimitBytes,
          updatedBy: adminId,
        },
        $setOnInsert: { key: "global" },
      },
      { new: true, upsert: true },
    ).lean();

    await logAdminAction(adminId, "update_admin_settings", "settings", settings?._id || null, { keys: Object.keys(payload || {}) }, req);
    return settings;
  }
}

export default AdminService;
