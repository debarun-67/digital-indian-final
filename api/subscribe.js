// /pages/api/subscribe.js
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
const dbName = "myWebsiteDB";
const collectionName = "subscribers";

// Cached MongoDB connection
let cachedClient = null;
async function connectToDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db(dbName);
}

// Start watcher once at server start
async function startSubscriberWatcher() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);

    const changeStream = collection.watch();
    changeStream.on("change", (change) => {
      console.log("📢 New subscription detected:", change);
      // You can call your blog-related logic here automatically
      // e.g., refreshBlogPosts();
    });

    console.log("✅ Subscriber watcher started");
  } catch (err) {
    console.error("❌ Failed to start subscriber watcher:", err);
  }
}

// Run the watcher immediately
startSubscriberWatcher();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);

    // Check if already subscribed
    const existing = await collection.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already subscribed" });
    }

    // Store in DB
    await collection.insertOne({ email, subscribedAt: new Date() });

    // Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Digital Indian" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Digital Indian!",
      html: `
        <h2>Thanks for subscribing! 🎉</h2>
        <p>You'll now receive updates from us directly in your inbox.</p>
        <p>— The Team</p>
      `,
    });

    return res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription error:", error.message, error.stack);
    return res.status(500).json({ error: error.message });
  }
}
