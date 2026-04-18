import Directory from "../models/directoryModel.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";
import Session from "../models/sessionModel.js";
import OTP from "../models/otpModel.js";
import { normalizeRole } from "../permission.js";
import Stripe from "stripe";
import { appConfig } from "../config/appConfig.js";

const STRIPE_STORAGE_LIMIT_BYTES = 10485760;

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
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7,
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
  res.clearCookie("sid");
  res.status(204).end();
};

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await Session.findById(sid);
  await Session.deleteMany({ userId: session.userId });
  res.clearCookie("sid");
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

    if (user.subscriptionActive && user.storageLimit >= STRIPE_STORAGE_LIMIT_BYTES) {
      return res.status(200).json({ message: "Storage already upgraded" });
    }

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
              description: "Increase storage from 5 MB to 10 MB",
            },
          },
        },
      ],
      success_url: `${appConfig.clientOrigin}/?stripe_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appConfig.clientOrigin}/?stripe_checkout=cancelled`,
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

    const user = await User.findById(req.user._id);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment is not completed" });
    }

    if (user.stripeCustomerId && session.customer !== user.stripeCustomerId) {
      return res.status(403).json({ error: "Checkout session does not belong to this user" });
    }

    if (!user.stripeCustomerId && typeof session.customer === "string") {
      user.stripeCustomerId = session.customer;
    }

    user.storageLimit = Math.max(user.storageLimit, STRIPE_STORAGE_LIMIT_BYTES);
    user.subscriptionActive = true;
    await user.save();

    const storagePercent =
      user.storageLimit > 0
        ? Math.round((user.storageUsed / user.storageLimit) * 100)
        : 0;

    return res.status(200).json({ 
      message: "Storage upgraded successfully",
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit,
      storagePercent,
      subscriptionActive: user.subscriptionActive,
    });
  } catch (err) {
    next(err);
  }
};
