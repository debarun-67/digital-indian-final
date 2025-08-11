// api/generate-token.js
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const token = crypto.randomUUID();
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error generating token:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
