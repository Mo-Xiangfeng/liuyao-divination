// api/test.js - 创建这个文件
export default async function handler(req, res) {
  console.log('测试API被调用');
  
  return res.status(200).json({
    success: true,
    message: '测试API正常工作！',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
