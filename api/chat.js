import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Taburai Assistant." },
        { role: "user", content: prompt },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ?? "Maaf, saya tidak mengerti.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);

    return res.status(500).json({
      reply: "⚠️ Maaf, server sedang bermasalah. Coba lagi nanti.",
    });
  }
}
