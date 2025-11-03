export async function askDeepSeek(prompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "（无响应）";
}
