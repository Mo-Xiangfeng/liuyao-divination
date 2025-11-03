// 主应用逻辑

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
    // 检查API配置状态
    checkApiStatus();
    
    // 初始化显示历史记录
    displayHistory();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 检查API状态
function checkApiStatus() {
    if (!isApiConfigured()) {
        console.warn('DeepSeek API密钥未配置，将使用基础解读功能');
        // 可以在控制台显示提示，但不对用户显示
    } else {
        console.log('DeepSeek API已配置，智能解读功能可用');
    }
}
// 调用DeepSeek API
async function callDeepSeekAPI(hexagram, lines) {
    if (!isApiConfigured()) {
        throw new Error('API未配置');
    }

    // 构建请求数据
    const requestData = {
        model: API_CONFIG.model,
        messages: [
            {
                role: "system",
                content: `你是一位精通易经六爻卜卦的专家，请根据用户提供的卦象进行专业、详细且积极的解读。
                请遵循以下解读原则：
                1. 保持专业性和准确性
                2. 提供积极正向的引导
                3. 从多个角度进行详细分析
                4. 语言通俗易懂但保持专业感
                5. 给出实用的建议和指引`
            },
            {
                role: "user",
                content: `请为我解读以下六爻卦象：
                卦名：${hexagram.name}
                基础卦辞：${hexagram.interpretation}
                六爻数值：${lines.join(', ')}
                爻象详情：${lines.map((line, index) => {
                    const positionNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
                    return `${positionNames[index]}：${lineValues[line].type}爻${lineValues[line].changing ? '（变爻）' : ''}`;
                }).join('；')}
                
                请从以下几个方面进行详细解读：
                1. 整体运势和卦象核心含义
                2. 对事业/工作的具体启示
                3. 对感情/人际关系的影响  
                4. 健康方面的注意事项
                5. 变爻的特殊含义和影响（如果有变爻）
                6. 综合建议和行动指引
                7. 近期需要注意的事项
                
                请用专业但亲切的语言进行解读，保持积极正向的引导，给出实用的建议。`
            }
        ],
        temperature: API_CONFIG.temperature,
        max_tokens: API_CONFIG.max_tokens
    };
    
    console.log('发送API请求:', { 
        url: DEEPSEEK_API_URL,
        keyLength: getApiKey().length 
    });
    
    // 发送请求到DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getApiKey()}`
        },
        body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', response.status, errorText);
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API返回数据格式错误');
    }
    
    return data.choices[0].message.content;
}
// 绑定事件监听器
function bindEventListeners() {
    // 开始占卜
    startBtn.addEventListener('click', performDivination);
    
    // 清除记录
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
        
        // 显示卦象
        displayHexagram(lines);
        
        // 解读卦象
        await interpretHexagram(lines);
        
        // 保存到历史记录
        saveToHistory(lines);
        
    } catch (error) {
        console.error('占卜过程中出错:', error);
        interpretationResult.innerHTML = '<div class="status-message status-error">解读过程中出现错误，请重试</div>';
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
        // 模拟投掷三枚硬币
        const coin1 = Math.floor(Math.random() * 2);
        const coin2 = Math.floor(Math.random() * 2);
        const coin3 = Math.floor(Math.random() * 2);
        
        // 计算爻值（2=阴，3=阳）
        const sum = coin1 + coin2 + coin3;
        
        // 转换为六爻数值（6,7,8,9）
        let lineValue;
        if (sum === 0) lineValue = 6; // 老阴，变爻
        else if (sum === 1) lineValue = 7; // 少阳
        else if (sum === 2) lineValue = 8; // 少阴
        else lineValue = 9; // 老阳，变爻
        
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

// 解读卦象
// 解读卦象
async function interpretHexagram(lines) {
    // 基于实际生成的六爻计算卦象（而不是随机选择）
    const hexagramId = calculateHexagramId(lines);
    const hexagram = hexagrams[hexagramId] || hexagrams[1];
    
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
        errorMsg.textContent = `AI解读失败: ${error.message}，将使用基础解读`;
        interpretationResult.appendChild(errorMsg);
        
        // 回退到基础解读
        useBasicInterpretation(hexagram, lines);
    }
}
// 使用基础解读
function useBasicInterpretation(hexagram, lines) {
    // 计算变爻数量
    const changingLines = lines.filter(line => line === 6 || line === 9).length;
    
    const sections = [
        { title: "卦辞解读", content: hexagram.interpretation },
        { title: "卦象分析", content: `本卦包含${changingLines}个变爻，${changingLines > 0 ? '预示变化较多，需要灵活应对' : '相对稳定，可按计划行事'}.` },
        { title: "整体运势", content: getRandomInterpretation('overall') },
        { title: "事业", content: getRandomInterpretation('career') },
        { title: "感情", content: getRandomInterpretation('relationship') },
        { title: "健康", content: getRandomInterpretation('health') },
        { title: "建议", content: getRandomInterpretation('advice') }
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
            "当前运势平稳，宜稳扎稳打",
            "机遇与挑战并存，需要谨慎决策",
            "运势上升，可积极进取",
            "需要耐心等待时机成熟",
            "变动较多，需灵活应对"
        ],
        career: [
            "工作进展顺利，有望获得认可",
            "面临新的挑战，需要提升能力",
            "合作机会增多，宜加强沟通",
            "需要明确目标，避免分散精力",
            "有晋升机会，宜主动争取"
        ],
        relationship: [
            "感情稳定，关系和谐",
            "需要更多沟通和理解",
            "新的缘分可能出现",
            "宜主动表达情感",
            "关系面临考验，需要耐心经营"
        ],
        health: [
            "身体状况良好，继续保持",
            "需要注意休息，避免过度劳累",
            "宜加强锻炼，提升体质",
            "小病小痛需及时调理",
            "精神状态佳，身心平衡"
        ],
        advice: [
            "保持信心，坚持正道",
            "多听取他人意见，避免独断",
            "把握时机，果断行动",
            "以柔克刚，避免正面冲突",
            "厚积薄发，等待最佳时机"
        ]
    };
    
    const list = interpretations[type] || interpretations.overall;
    return list[Math.floor(Math.random() * list.length)];
}

// 保存到历史记录
function saveToHistory(lines) {
    // 计算卦象
    const hexagramId = calculateHexagramId(lines);
    const hexagram = hexagrams[hexagramId] || hexagrams[1];
    
    const record = {
        date: new Date().toLocaleString(),
        lines: [...lines], // 复制数组
        name: hexagram.name
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