import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = crypto.randomUUID();
  res.status(200).json({ token });
}
