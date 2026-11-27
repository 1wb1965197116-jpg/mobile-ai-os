async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured on the server");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: 1800
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "AI provider request failed");
  const result = data?.choices?.[0]?.message?.content;
  if (typeof result !== "string") throw new Error("Unexpected AI provider response");
  return result;
}

module.exports = {
  orchestrateAI: async (type, input) => {
    if (type === "chat") {
      const text = String(input || "").trim();
      if (!text) throw new Error("Text is required");
      return callOpenAI([
        { role: "system", content: "You are Mobile AI OS, a helpful assistant. Give clear, practical answers." },
        { role: "user", content: text }
      ]);
    }

    if (type === "image") {
      if (!input || !Buffer.isBuffer(input.data) || !String(input.mimetype || "").startsWith("image/")) {
        throw new Error("A valid image upload is required");
      }
      const imageUrl = `data:${input.mimetype};base64,${input.data.toString("base64")}`;
      return callOpenAI([{
        role: "user",
        content: [
          { type: "text", text: "Read and transcribe visible text in this image. If it contains a document, summarize its key information. Clearly state when text is unreadable." },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }]);
    }

    throw new Error("Unknown AI operation");
  }
};
