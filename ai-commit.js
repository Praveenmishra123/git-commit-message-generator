#!/usr/bin/env node

/**
 * Smart Commit Message Generator
 * --------------------------------
 * This script uses OpenAI to generate commit messages
 * from your staged git changes.
 *
 * Prerequisites:
 * 1. .env file with:
 *    OPENAI_API_KEY=your_key_here
 *    OPENAI_MODEL=gpt-4o-mini
 *
 * 2. Run with:
 *    node ai-commit.js
 */

require("dotenv").config();
const { execSync } = require("child_process");
const axios = require("axios");
const readline = require("readline");

// Helper for user input
const ask = (query) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
};

(async () => {
  try {
    // 🔑 Check API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OpenAI API key in .env file.");
      console.error("Please add: OPENAI_API_KEY=your_api_key_here");
      process.exit(1);
    }

    // 📄 Get staged diff
    const diff = execSync("git diff --cached", { encoding: "utf-8" });
    if (!diff.trim()) {
      console.log("⚠️  No staged changes found. Run `git add .` first.");
      process.exit(0);
    }

    // 🧠 Prompt Design
    const prompt = `
You are a code-aware assistant.
Convert the following git diff into a clear, professional commit message.

Rules:
- Use the Conventional Commits format: <type>(scope): short description
- Keep it under 72 characters.
- Use lowercase, imperative style ("add", "fix", "update", etc.)
- Add a one-line body only if useful.
- Return ONLY the commit message.

Examples:
Diff: update login validation
Commit: fix(auth): handle missing user tokens correctly

Diff: add API endpoint for user preferences
Commit: feat(api): add endpoint for user preferences

Now here’s the diff:
${diff}
`;

    console.log("🧠 Generating AI-based commit message...");

    // 🚀 Send to OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const message = response.data.choices?.[0]?.message?.content?.trim();

    if (!message) {
      throw new Error("No message returned from OpenAI.");
    }

    console.log("\n✨ Suggested Commit Message:");
    console.log("--------------------------------------------------");
    console.log(message);
    console.log("--------------------------------------------------");

    const confirm = await ask("Do you want to use this commit message? (y/n): ");
    if (confirm.toLowerCase() === "y") {
      execSync(`git commit -m "${message}"`, { stdio: "inherit" });
      console.log("✅ Commit created successfully!");
    } else {
      console.log("❌ Commit aborted.");
    }

  } catch (err) {
    console.error("💥 Error:", err.response?.data || err.message);
  }
})();
