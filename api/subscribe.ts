// /pages/api/subscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
const dbName = "myWebsiteDB";
const collectionName = "subscribers";

// Global cached client to prevent "Topology is closed"
let cachedClient: MongoClient;
let cachedDb: any;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  if (!cachedClient) {
    cachedClient = new MongoClient(uri!);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

// Start subscriber watcher once
async function startSubscriberWatcher() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection(collectionName);

    // Watch for new inserts
    const changeStream = collection.watch([{ $match: { operationType: "insert" } }]);
    changeStream.on("change", (change: { fullDocument: { email: any; }; }) => {
      console.log("📢 New subscription detected:", change.fullDocument.email);
      // You can trigger blog-related logic here, e.g., send welcome email or notify admin
    });

    console.log("✅ Subscriber watcher started");
  } catch (err) {
    console.error("❌ Failed to start subscriber watcher:", err);
  }
}

// Only start once (serverless-safe)
if (process.env.SUBSCRIBER_WATCHER_STARTED !== "true") {
  startSubscriberWatcher();
  process.env.SUBSCRIBER_WATCHER_STARTED = "true";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Insert new subscriber
    await collection.insertOne({ email, subscribedAt: new Date() });

    // Send welcome email
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
  } catch (error: any) {
    console.error("Subscription error:", error.message, error.stack);
    return res.status(500).json({ error: error.message });
  }
}
