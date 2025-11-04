// api/interpret.js - 使用 ES6 模块语法
export default async function handler(req, res) {
  // CORS 设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 健康检查
  if (req.method === 'GET') {
    return res.json({
      status: '易经解读 API 服务正常',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  }
  
  // 处理 POST 请求
  if (req.method === 'POST') {
    try {
      let body;
      try {
        body = req.body;
        // Vercel 会自动解析 JSON，但为了安全还是检查一下
        if (typeof body === 'string') {
          body = JSON.parse(body);
        }
      } catch (e) {
        return res.status(400).json({ 
          error: '无效的 JSON 格式',
          details: e.message
        });
      }
      
      const { test, hexagram, lines, lineDetails } = body || {};
      
      // 测试请求
      if (test) {
        return res.json({
          message: 'API 连接测试成功',
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
        lineDetails: lineDetails
      });
      
      // 调用 DeepSeek API 或返回测试数据
      let interpretation;
      if (process.env.DEEPSEEK_API_KEY) {
        interpretation = await callDeepSeekAPI(hexagram, lines, lineDetails);
      } else {
        interpretation = generateTestInterpretation(hexagram, lines);
      }
      
      return res.json({
        interpretation: interpretation,
        hexagram: hexagram,
        timestamp: new Date().toISOString(),
        success: true,
        source: process.env.DEEPSEEK_API_KEY ? 'deepseek' : 'test'
      });
      
    } catch (error) {
      console.error('API 处理错误:', error);
      return res.status(500).json({
        error: '服务器内部错误',
        details: error.message,
        suggestion: '请检查控制台日志'
      });
    }
  }
  
  return res.status(405).json({ 
    error: '方法不允许',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
}

// 调用 DeepSeek API
async function callDeepSeekAPI(hexagram, lines, lineDetails) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DeepSeek API 密钥未配置');
  }

  const apiUrl = 'https://api.deepseek.com/chat/completions';

  const requestBody = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: `你是专业的易经六爻卜卦解读专家。请根据用户提供的卦象信息，用专业但通俗易懂的语言进行详细解读。`
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

请从整体运势、事业、感情、健康等方面进行详细解读，给出实用建议。`
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: false
  };

  console.log('调用 DeepSeek API...');

  const apiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    throw new Error(`DeepSeek API 错误: ${apiResponse.status} - ${errorText}`);
  }

  const data = await apiResponse.json();
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('DeepSeek API 返回数据格式错误');
  }

  return data.choices[0].message.content;
}

// 生成测试解读
function generateTestInterpretation(hexagram, lines) {
  return `
# ${hexagram.name}卦解读

## 卦象概述
${hexagram.interpretation}

## 爻线分析
当前爻线：${lines.join(', ')}

## 整体运势
此卦象提示需要保持平和心态，审时度势。

## 事业建议
稳步推进，避免冒进。

## 人际关系  
以诚相待，化解矛盾。

## 健康提示
注意身心平衡，劳逸结合。

*此为测试解读，实际使用请配置 DeepSeek API 密钥*
  `.trim();
}
