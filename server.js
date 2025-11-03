import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(".")); // 让 index.html 可直接访问

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// 前端调用这个接口代为访问 DeepSeek
app.post("/api/chat", async (req, res) => {
  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("调用 DeepSeek 出错:", err);
    res.status(500).json({ error: "服务器调用 DeepSeek 失败" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ 服务器运行在 http://localhost:${PORT}`));
