import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
  try {
    const mongodbUrl = process.env.MONGODB_URL;
    if (!mongodbUrl) {
      throw new Error("MONGODB_URL is not set");
    }

    await mongoose.connect(mongodbUrl);

    console.log("Database connected");
  } catch (err) {
    console.log(err);
    console.log("Could Not Connect to the Database");
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Database Disconnected!");
  process.exit(0);
});
