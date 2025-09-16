require('dotenv').config();
const { Claude } = require('@anthropic-ai/sdk');

const claude = new Claude({
  apiKey: process.env.CLAUDE_API_KEY
});

async function generateResponse(prompt) {
  const response = await claude.complete({
    prompt: prompt,
    model: "claude-2",
    max_tokens: 1000
  });
  return response.completion;
}

module.exports = { generateResponse };