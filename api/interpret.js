// api/interpret.js
export default async function handler(req, res) {
  // 设置CORS头 - 简化版本
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 添加健康检查端点（GET请求）
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'API服务正常运行',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hasApiKey: !!process.env.DEEPSEEK_API_KEY
    });
  }

  // 处理POST请求
  if (req.method === 'POST') {
    try {
      // 解析请求体
      let body;
      try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (parseError) {
        return res.status(400).json({
          error: '请求体格式错误',
          details: parseError.message
        });
      }

      const { test, hexagram, lines, lineDetails } = body;

      // 测试连接
      if (test) {
        return res.status(200).json({
          message: '后端API连接正常',
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

      console.log('收到卦象解读请求:', {
        hexagram: hexagram.name,
        lines: lines,
        environment: process.env.NODE_ENV
      });

      // 调用DeepSeek API
      const interpretation = await callDeepSeekAPI(hexagram, lines, lineDetails);

      // 返回解读结果
      return res.status(200).json({
        interpretation: interpretation,
        hexagram: hexagram,
        timestamp: new Date().toISOString(),
        success: true
      });

    } catch (error) {
      console.error('API处理错误:', error);
      
      // 提供更详细的错误信息
      if (error.message.includes('API密钥') || error.message.includes('401')) {
        return res.status(401).json({
          error: 'API密钥配置错误',
          details: error.message,
          suggestion: '请检查Vercel环境变量中的DEEPSEEK_API_KEY配置'
        });
      } else if (error.message.includes('频率限制') || error.message.includes('429')) {
        return res.status(429).json({
          error: 'API调用频率限制',
          details: error.message,
          suggestion: '请稍后重试或检查API配额'
        });
      } else {
        return res.status(500).json({
          error: '服务器内部错误',
          details: error.message,
          suggestion: '请检查服务器日志或联系管理员'
        });
      }
    }
  }

  // 其他不允许的请求方法
  return res.status(405).json({ 
    error: '方法不允许',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
}

// 调用DeepSeek API
async function callDeepSeekAPI(hexagram, lines, lineDetails) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('DeepSeek API密钥未配置');
    throw new Error('DeepSeek API密钥未配置 - 请在Vercel环境变量中设置DEEPSEEK_API_KEY');
  }

  const apiUrl = 'https://api.deepseek.com/chat/completions';

  // 构建爻线描述
  const linesDescription = lineDetails ? lineDetails.map(line => 
    `${line.position}: ${line.type}爻${line.changing ? '（变爻）' : ''}`
  ).join('；') : lines.join(', ');

  const requestBody = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `你是专业的易经六爻卜卦解读专家。请根据用户提供的卦象信息，用专业但通俗易懂的语言进行详细解读。
        
解读原则：
1. 保持专业性和准确性，基于易经经典
2. 提供积极正向的引导和建议
3. 从多个角度进行详细分析
4. 语言温暖亲切但保持专业感
5. 给出实用的建议和行动指引`
      },
      {
        role: "user",
        content: `请为我详细解读以下六爻卦象：

## 卦象信息
- **卦名**: ${hexagram.name}
- **卦序**: 第${hexagram.id}卦
- **基础卦辞**: ${hexagram.interpretation}

## 六爻构成（从下往上）
${lineDetails ? lineDetails.map((line, index) => 
  `${index + 1}. ${line.position}: ${line.type}爻${line.changing ? '（变爻）' : ''}`
).join('\n') : lines.join(', ')}

请从以下方面进行详细解读：
1. 整体运势和卦象核心含义
2. 对事业工作的具体启示
3. 对感情人际关系的指导
4. 健康方面的注意事项
5. 变爻的特殊含义（如果有变爻）
6. 综合建议和行动指引

请用温暖、专业、积极的语言进行解读，给出实用且具体的建议。`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: false
  };

  console.log('调用DeepSeek API...', {
    model: requestBody.model,
    hexagram: hexagram.name
  });

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiResponse.ok) {
      let errorText;
      try {
        errorText = await apiResponse.text();
      } catch {
        errorText = '无法读取错误响应';
      }
      
      console.error('DeepSeek API错误:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorText
      });
      
      if (apiResponse.status === 401) {
        throw new Error('DeepSeek API密钥无效或已过期');
      } else if (apiResponse.status === 429) {
        throw new Error('DeepSeek API调用频率限制，请稍后重试');
      } else if (apiResponse.status >= 500) {
        throw new Error('DeepSeek API服务器错误，请稍后重试');
      } else {
        throw new Error(`DeepSeek API请求失败: ${apiResponse.status} ${apiResponse.statusText}`);
      }
    }

    const data = await apiResponse.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('DeepSeek API返回数据格式异常:', data);
      throw new Error('DeepSeek API返回数据格式错误');
    }

    console.log('DeepSeek API调用成功');
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('DeepSeek API调用异常:', error);
    throw error;
  }
}
