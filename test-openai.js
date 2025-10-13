// test-openai.js
require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: "Write a one-line commit message for adding login validation" }],
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    console.log("✅ API working! Sample output:\n", response.data.choices[0].message.content);
  } catch (err) {
    console.error("❌ API Error:", err.response?.data || err.message);
  }
})();
