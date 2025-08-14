import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function sendBlogNotification() {
  const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");
  const blogsPath = path.join(process.cwd(), "data", "blogs.json");

  const subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf-8"));
  const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
  const latestBlog = blogs[blogs.length - 1];

  if (!latestBlog) {
    console.log("No blog found to send");
    return;
  }

  if (!subscribers || subscribers.length === 0) {
    console.log("No subscribers to send emails to.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  for (const email of subscribers) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `New Blog: ${latestBlog.title}`,
        text: `Check out our latest blog: ${latestBlog.title}\n\nRead here: ${process.env.NEXT_PUBLIC_BASE_URL}/blog/${latestBlog.slug}`,
      });
      console.log(`Email sent to ${email}: ${info.response}`);
    } catch (error) {
      console.error(`Error sending to ${email}:`, error);
    }
  }
}
