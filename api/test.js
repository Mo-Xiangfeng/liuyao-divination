// api/test.js - 使用 ES6 模块
export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json({
      status: 'success',
      message: '测试 API 正常工作！',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      type: 'ES6 Module'
    });
  }
  
  if (req.method === 'POST') {
    return res.json({
      status: 'success',
      message: 'POST 请求处理成功',
      timestamp: new Date().toISOString(),
      body: req.body
    });
  }
  
  return res.status(405).json({ error: '方法不允许' });
}
