require("dotenv").config();
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function test() {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello WellNest!" }],
    });

    console.log("✅ AI Replied:", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ OpenAI Error:", error.message);
  }
}

test();
