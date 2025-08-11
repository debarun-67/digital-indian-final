// server.js
// Merged backend for contact form and AI chatbot

// Load environment variables from a .env file
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require("fs");
const crypto = require("crypto"); 
const axios = require('axios'); // Required for the Gemini API call

const app = express();
const port = 3001; 

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// A simple in-memory store for session tokens.
const tokenStore = {};

// Define a simple FAQ system for the chatbot
const faqResponses = {
  "what services do you offer?": "We offer Telecom Infrastructure, Geospatial & GIS Solutions, Skill Development, and Consultancy & Business Incubation.",
  "what are your business hours?": "Our business hours are Monday - Sunday, from 9:00 AM to 8:00 PM.",
  "how do i contact support?": "You can contact our support team via email at info@digitalindian.co.in or by calling +91 7908735132.",
  "how can i book a meeting?": "You can book a meeting by using the 'View Calendar' option on our contact page to schedule a time that works for you."
};

// Create a Nodemailer transporter using your email service's credentials from .env
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify the transporter connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server connection is ready!');
  }
});

// New endpoint to generate a unique session token for the contact form
app.get('/api/token', (req, res) => {
    const token = crypto.randomUUID();
    tokenStore[token] = Date.now();
    console.log("New token generated:", token);
    res.json({ token });
});


// Define the API endpoint to handle form submissions
app.post('/api/send-email', upload.single('document'), async (req, res) => {
  // Extract form data and the token
  const { name, email, company, phone, message, token } = req.body;
  const document = req.file;

  // Step 1: Validate the session token
  const storedToken = tokenStore[token];
  if (!storedToken) {
    console.error("Token verification failed: Invalid or missing token.");
    if (document?.path) fs.unlinkSync(document.path);
    return res.status(400).json({ success: false, message: "Invalid session token." });
  }

  delete tokenStore[token];

  console.log('Received form data:', req.body);
  if (document) {
    console.log('Received document:', document.originalname);
  }

  // Step 2: Set up email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'ankurr.era@gmail.com',
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Message from Your Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    attachments: []
  };

  if (document) {
    mailOptions.attachments.push({
      filename: document.originalname,
      content: document.buffer
    });
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    if (document?.path) fs.unlinkSync(document.path);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    if (document?.path) fs.unlinkSync(document.path);
    res.status(500).json({ success: false, message: 'Error sending email.' });
  }
});

// New chat endpoint for the AI chatbot
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message.toLowerCase().trim();

  // FIX: Handle date-related queries with a hardcoded response
  if (userMessage.includes("date") || userMessage.includes("today")) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return res.status(200).json({ reply: `Hello! Today is ${formattedDate}.` });
  }

  // Step 1: Check if the user's message matches an FAQ
  if (faqResponses[userMessage]) {
    return res.status(200).json({ reply: faqResponses[userMessage] });
  }

  // Step 2: If not an FAQ, use the Gemini API to generate a response
  try {
    const chatHistory = [];
    chatHistory.push({
      role: "user",
      parts: [
        { text: `You are an AI assistant for the company 'Digital Indian'. Your goal is to be friendly and helpful. If a user asks a question, provide a concise and professional response. The user asked: "${userMessage}".` }
      ]
    });

    const payload = { contents: chatHistory };
    const apiKey = process.env.GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    // Add a check to ensure the API key is provided
    if (!apiKey) {
      console.error("Error: GEMINI_API_KEY is not set in the environment variables.");
      return res.status(500).json({ reply: "I'm sorry, my API key is not configured. Please contact the administrator." });
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const geminiData = await response.json();
    
    // Add checks to prevent crashes if the API response is not as expected
    if (geminiData.candidates && geminiData.candidates.length > 0 && geminiData.candidates[0].content) {
        const replyText = geminiData.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: replyText });
    } else {
        console.error("Invalid response from Gemini API:", geminiData);
        res.status(500).json({ reply: "I'm sorry, I received an invalid response. Please try again." });
    }

  } catch (error) {
    console.error("Error with AI model call:", error.message);
    res.status(500).json({ reply: "I'm sorry, I couldn't process that request right now. Please try again later." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening at https://digitalindian2.vercel.app`);
});
