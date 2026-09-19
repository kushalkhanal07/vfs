import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import OTP from "../models/otpModel.js";
import { normalizeRole } from "../permission.js";
import Stripe from "stripe";
import { appConfig } from "../config/appConfig.js";
import { sessionCookieOptions, SESSION_MAX_AGE } from "../utils/cookieOptions.js";

// Every successful Stripe payment adds this much storage
const STORAGE_UPGRADE_BYTES = 5 * 1024 * 1024;

const stripe = appConfig.stripeSecretKey
  ? new Stripe(appConfig.stripeSecretKey, { apiVersion: "2025-03-31.basil" })
  : null;

export const register = async (req, res, next) => {
  const { name, email, password, otp } = req.body;

  if (typeof password !== "string" || password.length < 3) {
    return res.status(400).json({
      error: "Password must be at least 3 characters long.",
    });
  }

  const otpRecord = await OTP.findOne({ email, otp });

  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or Expired OTP!" });
  }

  await otpRecord.deleteOne();

  const session = await mongoose.startSession();

  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        role: "User",
        status: "Active",
        rootDirId,
      },
      { session }
    );

    session.commitTransaction();

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    session.abortTransaction();
    console.log(err);
    if (err.code === 121) {
      res
        .status(400)
        .json({ error: "Invalid input, please enter valid details" });
    } else if (err.code === 11000) {
      if (err.keyValue.email) {
        return res.status(409).json({
          error: "This email already exists",
          message:
            "A user with this email address already exists. Please try logging in or use a different email.",
        });
      }
    } else {
      next(err);
    }
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  if (user.status === "Suspended") {
    return res.status(403).json({ error: "Your account is suspended." });
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  const allSessions = await Session.find({ userId: user.id });

  if (allSessions.length >= 2) {
    await allSessions[0].deleteOne();
  }

  const session = await Session.create({ userId: user._id });

  res.cookie("sid", session.id, {
    ...sessionCookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  res.json({ message: "logged in" });
};

export const getAllUsers = async (req, res) => {
  const allUsers = await User.find().lean();
  const allSessions = await Session.find().lean();
  const allSessionsUserId = allSessions.map(({ userId }) => userId.toString());
  const allSessionsUserIdSet = new Set(allSessionsUserId);

  const transformedUsers = allUsers.map(({ _id, name, email, role, status }) => ({
    id: _id,
    name,
    email,
    role: normalizeRole(role),
    status: status || "Active",
    isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
  }));
  res.status(200).json(transformedUsers);
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: normalizeRole(req.user.role),
    status: req.user.status || "Active",
  });
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid", sessionCookieOptions);
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await Session.findById(sid);
  await Session.deleteMany({ userId: session.userId });
  res.clearCookie("sid", sessionCookieOptions);
  res.status(204).end();
};

export const getStorageInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const storagePercent =
      user.storageLimit > 0
        ? Math.round((user.storageUsed / user.storageLimit) * 100)
        : 0;
    
    res.status(200).json({
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      storagePercent,
      subscriptionActive: user.subscriptionActive,
      upgrade: {
        available: Boolean(stripe),
        bytes: STORAGE_UPGRADE_BYTES,
        amount: appConfig.stripeStorageUpgradeAmount,
        currency: appConfig.stripeCurrency,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createStorageCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe is not configured on the server",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: user.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: appConfig.stripeCurrency,
            unit_amount: appConfig.stripeStorageUpgradeAmount,
            product_data: {
              name: "VFS Storage Upgrade",
              description: `Add ${STORAGE_UPGRADE_BYTES / 1048576} MB to your storage`,
            },
          },
        },
      ],
      success_url: `${appConfig.clientOrigin}/dashboard?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appConfig.clientOrigin}/dashboard?stripe_checkout=cancelled`,
      metadata: {
        userId: user._id.toString(),
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    next(err);
  }
};

export const confirmStorageCheckout = async (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    if (!stripe) {
      return res.status(500).json({
        error: "Stripe is not configured on the server",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment is not completed" });
    }

    const user = await User.findById(req.user._id);
    const customerMatches = !user.stripeCustomerId || session.customer === user.stripeCustomerId;

    if (session.metadata?.userId !== user._id.toString() || !customerMatches) {
      return res.status(403).json({ error: "Checkout session does not belong to this user" });
    }

    const setFields = { subscriptionActive: true };
    if (!user.stripeCustomerId && typeof session.customer === "string") {
      setFields.stripeCustomerId = session.customer;
    }

    // Add storage only if this checkout session was never used before.
    // One atomic update, so a page refresh or a double request cannot add storage twice.
    const upgradedUser = await User.findOneAndUpdate(
      { _id: user._id, stripeCheckoutSessionIds: { $ne: sessionId } },
      {
        $inc: { storageLimit: STORAGE_UPGRADE_BYTES },
        $push: { stripeCheckoutSessionIds: sessionId },
        $set: setFields,
      },
      { new: true }
    );

    const currentUser = upgradedUser || user;
    const storagePercent =
      currentUser.storageLimit > 0
        ? Math.round((currentUser.storageUsed / currentUser.storageLimit) * 100)
        : 0;

    return res.status(200).json({
      message: upgradedUser
        ? `Storage increased by ${STORAGE_UPGRADE_BYTES / 1048576} MB`
        : "This payment was already applied",
      storageUsed: currentUser.storageUsed,
      storageLimit: currentUser.storageLimit,
      storagePercent,
      subscriptionActive: currentUser.subscriptionActive,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * USER PROFILE ENDPOINTS
 */

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name email picture role status storageUsed storageLimit")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return res.status(400).json({ error: "Name is required" });
    }

    const update = {};
    if (typeof name === "string") update.name = name.trim();
    if (typeof email === "string") update.email = email.trim();

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select("name email picture role status").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    // handle duplicate email error
    if (err && err.code === 11000 && err.keyValue && err.keyValue.email) {
      return res.status(409).json({ error: "Email already in use" });
    }
    next(err);
  }
};

export const getDashboardProfile = async (req, res, next) => {
  try {
    const Note = (await import("../models/noteModel.js")).default;
    const RevisionSchedule = (await import("../models/revisionScheduleModel.js")).default;
    const RevisionHistory = (await import("../models/revisionHistoryModel.js")).default;
    const File = (await import("../models/fileModel.js")).default;

    const userId = req.user._id;

    const [user, totalNotes, totalFiles, upcomingRevisions, revisionHistory] = await Promise.all([
      User.findById(userId)
        .select("name email picture role subscriptionActive")
        .lean(),
      Note.countDocuments({ userId, deleted: false, isArchived: false }),
      File.countDocuments({ userId, deleted: false }),
      RevisionSchedule.countDocuments({ userId, isActive: true }),
      RevisionHistory.find({ userId }).sort({ reviewDate: -1 }).limit(10).lean(),
    ]);

    // Calculate study streak
    let currentStreak = 0;
    if (revisionHistory.length > 0) {
      let tempStreak = 1;
      let lastDate = null;

      for (const review of revisionHistory) {
        const reviewDate = new Date(review.reviewDate);
        reviewDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          lastDate = reviewDate;
        } else {
          const diffTime = Math.abs(lastDate - reviewDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            break;
          }

          lastDate = reviewDate;
        }
      }

      currentStreak = tempStreak;
    }

    res.json({
      user: {
        ...user,
        loginProvider: user.password ? "email" : "google",
      },
      stats: {
        totalNotes,
        totalFiles,
        upcomingRevisions,
        revisionStreak: currentStreak,
      },
    });
  } catch (err) {
    next(err);
  }
};
