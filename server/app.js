import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import revisionRoutes from "./routes/revisionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sessionReminderRoutes from "./routes/sessionReminderRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import { appConfig } from "./config/appConfig.js";
import http from "http";
import { initSocket } from "./utils/socket.js";
import { bootstrapReminderQueue } from "./services/reminder.queue.js";
import { bootstrapRevisionReminderQueue } from "./services/revisionReminder.queue.js";

await connectDB();

const app = express();
app.use(cookieParser(appConfig.secretKey));
app.use(express.json());
app.use(
  cors({
    origin: appConfig.clientOrigin,
    credentials: true,
  })
);

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);

// New module routes
app.use("/api/notes", notesRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/session-reminders", sessionReminderRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong!" });
});

const server = http.createServer(app);

// initialize socket.io
initSocket(server);

await bootstrapReminderQueue();
await bootstrapRevisionReminderQueue();

server.listen(appConfig.port, () => {
  console.log(`Server Started on port ${appConfig.port}`);
});
