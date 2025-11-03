// js/app.js - 修复版本

// 存储历史记录
let divinationHistory = JSON.parse(localStorage.getItem('divinationHistory')) || [];

// DOM元素
const startBtn = document.getElementById('startBtn');
const clearBtn = document.getElementById('clearBtn');
const hexagramDisplay = document.getElementById('hexagramDisplay');
const interpretationResult = document.getElementById('interpretationResult');
const historyList = document.getElementById('historyList');

// 初始化
function init() {
    console.log('=== 六爻卜卦网站初始化 ===');
    
    // 显示API状态
    showApiStatus();
    
    // 初始化显示历史记录
    displayHistory();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 添加API测试功能
    addApiTestFeature();
}

// 显示API状态
function showApiStatus() {
    const status = isApiConfigured() ? '✅ 已配置' : '❌ 未配置';
    console.log('DeepSeek API状态:', status);
}

// 添加API测试功能
function addApiTestFeature() {
    // 在按钮组旁边添加测试按钮
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试API连接';
    testBtn.className = 'secondary-btn';
    testBtn.onclick = testApiConnection;
    
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.appendChild(testBtn);
    }
}

// 测试API连接
async function testApiConnection() {
    console.log('开始测试API连接...');
    
    if (!isApiConfigured()) {
        alert('❌ API未配置，请检查环境变量设置');
        return;
    }
    
    const apiKey = getApiKey();
    console.log('测试使用的API密钥长度:', apiKey.length);
    
    try {
        const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_CONFIG.modelConfig.model,
                messages: [
                    {
                        role: "user",
                        content: "请回复'连接成功'测试API连接"
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            alert('✅ API连接测试成功！');
            console.log('API测试成功:', data);
        } else {
            const errorText = await response.text();
            console.error('API测试失败:', response.status, errorText);
            alert(`❌ API连接失败: ${response.status}\n请检查API密钥是否正确`);
        }
    } catch (error) {
        console.error('API测试异常:', error);
        alert('❌ 网络连接失败，请检查网络设置');
    }
}

// 绑定事件监听器
function bindEventListeners() {
    startBtn.addEventListener('click', performDivination);
    clearBtn.addEventListener('click', clearHistory);
}

// 执行占卜函数
async function performDivination() {
    // 禁用按钮并显示加载状态
    setButtonLoadingState(true);
    
    // 清空显示区域
    hexagramDisplay.innerHTML = '<p>正在生成卦象...</p>';
    interpretationResult.innerHTML = '<p>正在解读卦象...</p>';
    
    try {
        // 生成六爻
        const lines = generateHexagramLines();
        console.log('生成的六爻:', lines);
        
        // 显示卦象
        displayHexagram(lines);
        
        // 解读卦象
        await interpretHexagram(lines);
        
        // 保存到历史记录
        saveToHistory(lines);
        
    } catch (error) {
        console.error('占卜过程中出错:', error);
        interpretationResult.innerHTML = `
            <div class="status-message status-error">
                <h3>解读失败</h3>
                <p>${error.message}</p>
                <p>将使用基础解读</p>
            </div>
        `;
        // 即使AI解读失败，也显示基础解读
        const hexagramId = calculateHexagramId(lines);
        const hexagram = hexagrams[hexagramId] || hexagrams[1];
        useBasicInterpretation(hexagram, lines);
    } finally {
        // 恢复按钮状态
        setButtonLoadingState(false);
    }
}

// 设置按钮加载状态
function setButtonLoadingState(loading) {
    if (loading) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<div class="loading"></div>占卜中...';
    } else {
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-text">开始占卜</span>';
    }
}

// 生成六爻
function generateHexagramLines() {
    const lines = [];
    for (let i = 0; i < 6; i++) {
        // 模拟投掷三枚硬币（0=反面，1=正面）
        const coin1 = Math.floor(Math.random() * 2);
        const coin2 = Math.floor(Math.random() * 2);
        const coin3 = Math.floor(Math.random() * 2);
        
        // 计算爻值（2=阴，3=阳）
        const sum = coin1 + coin2 + coin3;
        
        // 转换为六爻数值（6,7,8,9）
        let lineValue;
        if (sum === 0) lineValue = 6; // 老阴，变爻 (3个反面)
        else if (sum === 1) lineValue = 7; // 少阳 (1个正面)
        else if (sum === 2) lineValue = 8; // 少阴 (2个正面)
        else lineValue = 9; // 老阳，变爻 (3个正面)
        
        lines.push(lineValue);
    }
    return lines;
}

// 显示卦象
function displayHexagram(lines) {
    hexagramDisplay.innerHTML = '';
    
    // 从下到上显示六爻
    for (let i = 5; i >= 0; i--) {
        const lineValue = lines[i];
        const lineData = lineValues[lineValue];
        const lineNumber = i + 1;
        
        const lineContainer = document.createElement('div');
        lineContainer.className = 'line-container fade-in';
        lineContainer.style.animationDelay = `${(5-i)*0.1}s`;
        
        const numberElement = document.createElement('div');
        numberElement.className = 'line-number';
        numberElement.textContent = lineNumber;
        
        const lineElement = document.createElement('div');
        if (lineData.type === '阳') {
            lineElement.className = `line ${lineData.changing ? 'changing-line' : ''}`;
            lineElement.style.width = '200px';
        } else {
            lineElement.className = `broken-line ${lineData.changing ? 'changing-line' : ''}`;
            lineElement.style.width = '200px';
            
            const segment1 = document.createElement('div');
            segment1.className = 'line-segment';
            
            const segment2 = document.createElement('div');
            segment2.className = 'line-segment';
            
            lineElement.appendChild(segment1);
            lineElement.appendChild(segment2);
        }
        
        lineContainer.appendChild(numberElement);
        lineContainer.appendChild(lineElement);
        hexagramDisplay.appendChild(lineContainer);
    }
    
    // 显示爻的数值
    const valuesText = document.createElement('p');
    valuesText.textContent = `爻值: ${lines.join(', ')}`;
    valuesText.style.marginTop = '15px';
    valuesText.style.textAlign = 'center';
    valuesText.className = 'fade-in';
    hexagramDisplay.appendChild(valuesText);
}

// 解读卦象 - 修复版本
async function interpretHexagram(lines) {
    console.log('开始解读卦象，爻线:', lines);
    
    // 基于实际生成的六爻计算卦象
    const hexagramId = calculateHexagramId(lines);
    const hexagram = hexagrams[hexagramId] || hexagrams[1];
    
    console.log('计算得到的卦象:', {
        id: hexagramId,
        name: hexagram.name,
        interpretation: hexagram.interpretation
    });
    
    // 显示卦名
    const nameElement = document.createElement('div');
    nameElement.className = 'hexagram-name fade-in';
    nameElement.textContent = hexagram.name;
    
    interpretationResult.innerHTML = '';
    interpretationResult.appendChild(nameElement);
    
    // 显示卦象的基本信息
    const basicInfo = document.createElement('div');
    basicInfo.className = 'interpretation-section fade-in';
    basicInfo.innerHTML = `
        <h3>卦象信息</h3>
        <p><strong>卦名：</strong>${hexagram.name}</p>
        <p><strong>卦序：</strong>第${hexagramId}卦</p>
        <p><strong>基础卦辞：</strong>${hexagram.interpretation}</p>
        <p><strong>六爻详情：</strong>${lines.map((line, index) => {
            const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
            return `${positions[index]}(${lineValues[line].type}${lineValues[line].changing ? '变' : ''})`;
        }).join(' → ')}</p>
    `;
    interpretationResult.appendChild(basicInfo);
    
    // 如果有API已配置，使用DeepSeek API进行解读
    if (isApiConfigured()) {
        await interpretWithDeepSeekAPI(hexagram, lines);
    } else {
        // 使用基础解读
        useBasicInterpretation(hexagram, lines);
    }
}

// 使用DeepSeek API进行解读
async function interpretWithDeepSeekAPI(hexagram, lines) {
    const statusMsg = document.createElement('div');
    statusMsg.className = 'status-message status-info';
    statusMsg.innerHTML = '<div class="loading"></div>正在通过AI进行智能解读...';
    interpretationResult.appendChild(statusMsg);
    
    try {
        const interpretation = await callDeepSeekAPI(hexagram, lines);
        
        // 移除状态消息
        statusMsg.remove();
        
        // 显示AI解读结果
        const aiInterpretation = document.createElement('div');
        aiInterpretation.className = 'interpretation-section fade-in';
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = "AI 智能解读";
        
        const contentElement = document.createElement('div');
        contentElement.innerHTML = `<p>${interpretation.replace(/\n/g, '<br>')}</p>`;
        
        aiInterpretation.appendChild(titleElement);
        aiInterpretation.appendChild(contentElement);
        interpretationResult.appendChild(aiInterpretation);
        
    } catch (error) {
        console.error('AI解读失败:', error);
        statusMsg.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'status-message status-error';
        errorMsg.innerHTML = `
            <h3>AI解读失败</h3>
            <p>${error.message}</p>
            <p>将使用基础解读</p>
        `;
        interpretationResult.appendChild(errorMsg);
        
        // 回退到基础解读
        useBasicInterpretation(hexagram, lines);
    }
}

// 调用DeepSeek API - 修复版本
async function callDeepSeekAPI(hexagram, lines) {
    console.log('调用DeepSeek API...');
    
    if (!isApiConfigured()) {
        throw new Error('API未配置');
    }

    const apiKey = getApiKey();
    console.log('API调用详情:', {
        keyLength: apiKey.length,
        keyPreview: apiKey.substring(0, 8) + '...',
        hexagram: hexagram.name
    });

    // 构建请求数据
    const requestData = {
        model: DEEPSEEK_CONFIG.modelConfig.model,
        messages: [
            {
                role: "system",
                content: `你是专业的易经六爻卜卦解读专家。请根据用户提供的卦象信息，用专业但通俗易懂的语言进行详细解读。解读应该积极正面，给出实用的建议和指导。请从整体运势、事业、感情、健康等多个方面进行分析。`
            },
            {
                role: "user",
                content: `请为我详细解读以下六爻卦象：

卦名：${hexagram.name}
卦序：第${calculateHexagramId(lines)}卦
基础卦辞：${hexagram.interpretation}

六爻构成（从下到上）：
${lines.map((line, index) => {
    const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    const lineType = lineValues[line].type;
    const isChanging = lineValues[line].changing;
    return `${positions[index]}：${lineType}爻${isChanging ? '（变爻）' : ''}（数值${line}）`;
}).join('\n')}

请从以下方面进行详细解读：
1. 整体运势和这个卦象的核心含义
2. 对事业工作的具体启示和建议
3. 对感情人际关系的指导
4. 健康方面的注意事项
5. 变爻的特殊含义（如果有变爻）
6. 综合建议和行动指引

请用温暖、专业、积极的语言进行解读，给出实用的建议。`
            }
        ],
        temperature: DEEPSEEK_CONFIG.modelConfig.temperature,
        max_tokens: DEEPSEEK_CONFIG.modelConfig.max_tokens,
        stream: false
    };

    console.log('发送API请求...');
    
    const response = await fetch(DEEPSEEK_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });

    console.log('API响应状态:', response.status, response.statusText);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误详情:', errorText);
        
        if (response.status === 401) {
            throw new Error('API密钥无效或已过期');
        } else if (response.status === 429) {
            throw new Error('API调用频率限制，请稍后重试');
        } else {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
    }

    const data = await response.json();
    console.log('API响应数据:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API返回数据格式错误');
    }

    return data.choices[0].message.content;
}

// 使用基础解读
function useBasicInterpretation(hexagram, lines) {
    // 计算变爻数量
    const changingLines = lines.filter(line => line === 6 || line === 9).length;
    
    const sections = [
        { 
            title: "卦辞解读", 
            content: hexagram.interpretation 
        },
        { 
            title: "卦象分析", 
            content: `本卦包含 ${changingLines} 个变爻，${changingLines > 0 ? '预示变化较多，需要灵活应对' : '相对稳定，可按计划行事'}。` 
        },
        { 
            title: "整体运势", 
            content: getRandomInterpretation('overall') 
        },
        { 
            title: "事业工作", 
            content: getRandomInterpretation('career') 
        },
        { 
            title: "感情人际", 
            content: getRandomInterpretation('relationship') 
        },
        { 
            title: "健康生活", 
            content: getRandomInterpretation('health') 
        },
        { 
            title: "行动建议", 
            content: getRandomInterpretation('advice') 
        }
    ];
    
    sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'interpretation-section fade-in';
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = section.title;
        
        const contentElement = document.createElement('p');
        contentElement.textContent = section.content;
        
        sectionElement.appendChild(titleElement);
        sectionElement.appendChild(contentElement);
        interpretationResult.appendChild(sectionElement);
    });
}

// 辅助函数：根据类型获取随机解读
function getRandomInterpretation(type) {
    const interpretations = {
        overall: [
            "当前运势平稳，宜稳扎稳打，积累实力",
            "机遇与挑战并存，需要谨慎决策，把握时机",
            "运势呈上升趋势，可积极进取，开拓新局面",
            "需要耐心等待时机成熟，不宜贸然行动",
            "变动因素较多，需要灵活应对，随机应变"
        ],
        career: [
            "工作进展顺利，踏实努力有望获得认可",
            "面临新的挑战，需要提升专业能力应对",
            "合作机会增多，宜加强沟通，建立良好关系",
            "需要明确目标，集中精力，避免分散",
            "有晋升发展机会，宜主动争取，展现能力"
        ],
        relationship: [
            "感情关系稳定和谐，宜用心经营",
            "需要加强沟通理解，增进彼此了解",
            "新的缘分可能出现，保持开放心态",
            "宜主动表达情感，增进亲密关系",
            "关系面临考验，需要耐心经营，相互支持"
        ],
        health: [
            "身体状况良好，继续保持健康生活习惯",
            "需要注意劳逸结合，避免过度劳累",
            "宜加强锻炼，提升身体素质",
            "小病小痛需及时调理，防微杜渐",
            "精神状态佳，保持身心平衡和谐"
        ],
        advice: [
            "保持信心，坚持正道，自然会有好的结果",
            "多听取他人意见，集思广益，避免独断",
            "把握时机，果断行动，不要犹豫不决",
            "以柔克刚，避免正面冲突，智慧应对",
            "厚积薄发，耐心积累，等待最佳时机"
        ]
    };
    
    const list = interpretations[type] || interpretations.overall;
    return list[Math.floor(Math.random() * list.length)];
}

// 保存到历史记录
function saveToHistory(lines) {
    const hexagramId = calculateHexagramId(lines);
    const hexagram = hexagrams[hexagramId] || hexagrams[1];
    
    const record = {
        date: new Date().toLocaleString(),
        lines: [...lines],
        name: hexagram.name,
        id: hexagramId
    };
    
    divinationHistory.unshift(record);
    if (divinationHistory.length > 10) {
        divinationHistory = divinationHistory.slice(0, 10);
    }
    
    localStorage.setItem('divinationHistory', JSON.stringify(divinationHistory));
    displayHistory();
}

// 显示历史记录
function displayHistory() {
    historyList.innerHTML = '';
    
    if (divinationHistory.length === 0) {
        historyList.innerHTML = '<p>暂无占卜记录</p>';
        return;
    }
    
    divinationHistory.forEach(record => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const dateElement = document.createElement('div');
        dateElement.className = 'history-date';
        dateElement.textContent = record.date;
        
        const hexagramElement = document.createElement('div');
        hexagramElement.className = 'history-hexagram';
        
        // 从下到上显示六爻
        for (let i = 5; i >= 0; i--) {
            const lineValue = record.lines[i];
            const lineData = lineValues[lineValue];
            
            const lineElement = document.createElement('div');
            if (lineData.type === '阳') {
                lineElement.className = 'history-line';
            } else {
                lineElement.className = 'history-line history-broken-line';
            }
            
            hexagramElement.appendChild(lineElement);
        }
        
        const nameElement = document.createElement('div');
        nameElement.className = 'history-name';
        nameElement.textContent = record.name;
        
        historyItem.appendChild(dateElement);
        historyItem.appendChild(hexagramElement);
        historyItem.appendChild(nameElement);
        historyList.appendChild(historyItem);
    });
}

// 清除历史记录
function clearHistory() {
    if (confirm('确定要清除所有占卜记录吗？')) {
        divinationHistory = [];
        localStorage.removeItem('divinationHistory');
        displayHistory();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);
