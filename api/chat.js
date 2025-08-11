import axios from "axios";

const faqResponses = {
  "what services do you offer?": "We offer Telecom Infrastructure, Geospatial & GIS Solutions, Skill Development, and Consultancy & Business Incubation.",
  "what are your business hours?": "Our business hours are Monday - Sunday, from 9:00 AM to 8:00 PM.",
  "how do i contact support?": "You can contact our support team via email at info@digitalindian.co.in or by calling +91 7908735132.",
  "how can i book a meeting?": "You can book a meeting by using the 'View Calendar' option on our contact page.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body.message?.toLowerCase().trim();

  // Date query
  if (userMessage.includes("date") || userMessage.includes("today")) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return res.status(200).json({ reply: `Hello! Today is ${formattedDate}.` });
  }

  // FAQ match
  if (faqResponses[userMessage]) {
    return res.status(200).json({ reply: faqResponses[userMessage] });
  }

  // Gemini API
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ reply: "API key not configured" });
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `You are an AI assistant for the company 'Digital Indian'. Your goal is to be friendly and helpful. If a user asks a question, provide a concise and professional response. The user asked: "${userMessage}".` },
          ],
        },
      ],
    };

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ reply: "Invalid AI response" });
    }
  } catch (error) {
    console.error("Gemini API error:", error.message);
    res.status(500).json({ reply: "Error processing request" });
  }
}
