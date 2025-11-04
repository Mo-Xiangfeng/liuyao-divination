// api/interpret.js - 使用 module.exports
module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查端点
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API服务正常运行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hasApiKey: !!process.env.DEEPSEEK_API_KEY,
      message: '易经六爻解读API'
    });
  }

  // 处理POST请求
  if (req.method === 'POST') {
    try {
      let body;
      try {
        body = req.body;
        // 如果body是字符串，尝试解析
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
      } catch (parseError) {
        return res.status(400).json({
          error: '请求体格式错误',
          details: '请检查JSON格式'
        });
      }

      const { test, hexagram, lines, lineDetails } = body || {};

      // 测试连接
      if (test) {
        return res.status(200).json({
          message: 'API连接测试成功',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          hasApiKey: !!process.env.DEEPSEEK_API_KEY
        });
      }

      // 验证必要参数
      if (!hexagram || !lines) {
        return res.status(400).json({
          error: '缺少必要参数',
          required: ['hexagram', 'lines'],
          received: {
            hexagram: !!hexagram,
            lines: !!lines
          }
        });
      }

      console.log('收到卦象解读请求:', hexagram.name);

      // 调用DeepSeek API
      const interpretation = await callDeepSeekAPI(hexagram, lines, lineDetails);

      return res.status(200).json({
        interpretation: interpretation,
        hexagram: hexagram,
        timestamp: new Date().toISOString(),
        success: true
      });

    } catch (error) {
      console.error('API处理错误:', error);
      
      return res.status(500).json({
        error: '服务器内部错误',
        details: error.message,
        suggestion: '请稍后重试'
      });
    }
  }

  return res.status(405).json({ 
    error: '方法不允许',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
};

// 调用DeepSeek API
async function callDeepSeekAPI(hexagram, lines, lineDetails) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置');
  }

  const apiUrl = 'https://api.deepseek.com/chat/completions';

  const requestBody = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "你是专业的易经六爻卜卦解读专家。请根据用户提供的卦象信息，用专业但通俗易懂的语言进行详细解读。"
      },
      {
        role: "user",
        content: `请解读以下卦象：
卦名: ${hexagram.name}
卦辞: ${hexagram.interpretation}
爻线: ${lines.join(', ')}

请给出详细的解读和建议。`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  const apiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!apiResponse.ok) {
    throw new Error(`DeepSeek API请求失败: ${apiResponse.status}`);
  }

  const data = await apiResponse.json();
  return data.choices[0].message.content;
}
