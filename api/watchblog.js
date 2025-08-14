import fs from "fs";
import path from "path";
import sendBlogNotification from "./sendBlogNotification.js";

const blogsFile = path.join(process.cwd(), "data", "blogs.json");

let lastModified = null;

setInterval(() => {
  fs.stat(blogsFile, (err, stats) => {
    if (err) {
      console.error("Error reading blogs file:", err);
      return;
    }

    // If file modification time changes → send notifications
    if (!lastModified || stats.mtimeMs > lastModified) {
      lastModified = stats.mtimeMs;
      console.log("Detected new blog update. Sending notifications...");
      sendBlogNotification();
    }
  });
}, 50); // check every 5 seconds
