function generateRandomHexagram() {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const num = Math.floor(Math.random() * 4);
    const line = num < 2 ? "阳" : "阴";
    lines.push(line);
  }
  return lines.reverse();
}

function renderHexagram(hexagram) {
  return hexagram.map(line => 
    `<div>${line === "阳" ? "———" : "— —"}</div>`
  ).join("");
}
