// api/interpret.js - Vercel Serverless Function

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 只允许POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { test, hexagram, lines, lineDetails } = req.body;

        // 测试连接
        if (test) {
            return res.status(200).json({
                message: '后端API连接正常',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        }

        // 验证必要参数
        if (!hexagram || !lines) {
            return res.status(400).json({
                error: '缺少必要参数: hexagram 和 lines'
            });
        }

        console.log('收到卦象解读请求:', {
            hexagram: hexagram.name,
            lines: lines
        });

        // 调用DeepSeek API
        const interpretation = await callDeepSeekAPI(hexagram, lines, lineDetails);

        // 返回解读结果
        res.status(200).json({
            interpretation: interpretation,
            hexagram: hexagram,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API处理错误:', error);
        
        if (error.message.includes('API密钥') || error.message.includes('401')) {
            return res.status(401).json({
                error: 'API密钥配置错误: ' + error.message
            });
        } else if (error.message.includes('频率限制') || error.message.includes('429')) {
            return res.status(429).json({
                error: 'API调用频率限制: ' + error.message
            });
        } else {
            return res.status(500).json({
                error: '服务器内部错误: ' + error.message
            });
        }
    }
}

// 调用DeepSeek API
async function callDeepSeekAPI(hexagram, lines, lineDetails) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        throw new Error('DeepSeek API密钥未配置');
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
5. 给出实用的建议和行动指引

请确保解读内容：
- 符合卦象的传统含义
- 对用户有实际帮助
- 保持积极乐观的基调
- 涵盖生活各个方面`
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

## 解读要求
请从以下方面进行详细解读：

### 1. 整体运势
- 这个卦象的核心含义和象征
- 当前的整体运势趋势
- 需要注意的关键点

### 2. 事业工作
- 对职业发展的启示
- 工作环境的分析
- 建议的行动方向

### 3. 感情人际  
- 感情关系的指导
- 人际交往的建议
- 家庭关系的提示

### 4. 健康生活
- 身体健康注意事项
- 心理状态建议
- 生活作息指导

### 5. 变爻分析
${lineDetails && lineDetails.some(line => line.changing) ? 
    '分析变爻的特殊含义和对整体卦象的影响' : 
    '本卦无变爻，相对稳定'
}

### 6. 综合建议
- 具体的行动建议
- 需要避免的事项
- 最佳时机把握

请用温暖、专业、积极的语言进行解读，给出实用且具体的建议。`
            }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
    };

    console.log('调用DeepSeek API...');

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API错误:', response.status, errorText);
        
        if (response.status === 401) {
            throw new Error('DeepSeek API密钥无效或已过期');
        } else if (response.status === 429) {
            throw new Error('DeepSeek API调用频率限制');
        } else {
            throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText}`);
        }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('DeepSeek API返回数据格式错误');
    }

    return data.choices[0].message.content;
}
