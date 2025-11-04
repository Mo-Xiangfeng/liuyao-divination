// api/ping.js - 创建这个文件
export default function handler(req, res) {
  console.log('Ping API 被调用');
  return res.json({ 
    message: 'PONG!',
    success: true,
    timestamp: new Date().toISOString()
  });
}
