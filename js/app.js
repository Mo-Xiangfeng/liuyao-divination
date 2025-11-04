document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const clearBtn = document.getElementById("clearBtn");
  const display = document.getElementById("hexagramDisplay");
  const resultDiv = document.getElementById("interpretationResult");
  const historyList = document.getElementById("historyList");

  startBtn.addEventListener("click", async () => {
    const hexagram = generateRandomHexagram();
    display.innerHTML = renderHexagram(hexagram);

    const question = `请根据以下卦象进行易经解读：${hexagram.join(",")}`;
    resultDiv.innerHTML = `<p>AI 正在解读中...</p>`;

    const answer = await askDeepSeek(question);
    resultDiv.innerHTML = `<p>${answer}</p>`;

    const item = document.createElement("div");
    item.innerHTML = `<strong>${new Date().toLocaleString()}</strong><br>${answer}`;
    historyList.prepend(item);
  });

  clearBtn.addEventListener("click", () => {
    historyList.innerHTML = "";
    resultDiv.innerHTML = "<p>卦象生成后将显示详细解读</p>";
    display.innerHTML = "<p>点击“开始占卜”生成卦象</p>";
  });
});
