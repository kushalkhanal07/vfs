import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";
import { appConfig } from "./config/appConfig.js";

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

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong!" });
});

app.listen(appConfig.port, () => {
  console.log(`Server Started on port ${appConfig.port}`);
});
