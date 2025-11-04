// 主应用逻辑 - Vercel版本

// 存储历史记录
let divinationHistory = JSON.parse(localStorage.getItem('divinationHistory')) || [];

// DOM元素
const startBtn = document.getElementById('startBtn');
const clearBtn = document.getElementById('clearBtn');
const testBtn = document.getElementById('testBtn');
const hexagramDisplay = document.getElementById('hexagramDisplay');
const interpretationResult = document.getElementById('interpretationResult');
const historyList = document.getElementById('historyList');

// API配置
const API_CONFIG = {
    baseUrl: '/api/interpret'
};

// 初始化
function init() {
    console.log('=== 六爻卜卦网站初始化 ===');
    
    // 初始化显示历史记录
    displayHistory();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 绑定事件监听器
function bindEventListeners() {
    startBtn.addEventListener('click', performDivination);
    clearBtn.addEventListener('click', clearHistory);
    testBtn.addEventListener('click', testApiConnection);
}

// 改进的API测试函数
// 添加到 app.js 中
async function diagnoseAPIIssue() {
  console.log('🔧 诊断API问题...');
  console.log('当前URL:', window.location.href);
  
  const endpoints = [
    '/api/test',      // 先测试这个简单的
    '/api/interpret'  // 再测试主要的
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n=== 测试 ${endpoint} ===`);
    
    try {
      // 方法1: 直接访问（在浏览器地址栏测试）
      console.log(`请在浏览器中访问: ${window.location.origin}${endpoint}`);
      
      // 方法2: 用 fetch 测试
      const response = await fetch(endpoint);
      console.log('状态:', response.status);
      console.log('状态文本:', response.statusText);
      
      const text = await response.text();
      console.log('响应内容:', text);
      
      if (response.status === 404) {
        console.log('❌ 404错误 - API路由不存在');
        console.log('可能的原因:');
        console.log('1. API文件不在正确位置');
        console.log('2. Vercel配置错误');
        console.log('3. 文件扩展名问题');
      }
      
    } catch (error) {
      console.log('💥 请求失败:', error.message);
    }
  }
}

// 运行诊断
diagnoseAPIIssue();
async function testES6API() {
  console.log('🧪 测试 ES6 模块 API...');
  
  const endpoints = [
    '/api/test',
    '/api/interpret'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 测试: ${endpoint}`);
    
    try {
      // 测试 GET
      console.log('📨 发送 GET 请求...');
      const getResponse = await fetch(endpoint);
      const getText = await getResponse.text();
      
      console.log(`📊 状态: ${getResponse.status}`);
      console.log(`📄 类型: ${getResponse.headers.get('content-type')}`);
      
      if (getResponse.ok) {
        try {
          const data = JSON.parse(getText);
          console.log('✅ GET 成功:', data);
        } catch (e) {
          console.log('❌ GET 响应不是 JSON:', getText.substring(0, 100));
        }
      } else {
        console.log('❌ GET 失败:', getText.substring(0, 100));
      }
      
      // 测试 POST
      console.log('📨 发送 POST 请求...');
      const postResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, message: '测试请求' })
      });
      const postText = await postResponse.text();
      
      console.log(`📊 状态: ${postResponse.status}`);
      
      if (postResponse.ok) {
        try {
          const data = JSON.parse(postText);
          console.log('✅ POST 成功:', data);
        } catch (e) {
          console.log('❌ POST 响应不是 JSON:', postText.substring(0, 100));
        }
      } else {
        console.log('❌ POST 失败:', postText.substring(0, 100));
      }
      
    } catch (error) {
      console.log('💥 请求异常:', error.message);
    }
  }
}

// 运行测试
testES6API();

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
    
    // 计算卦象ID用于显示
    const hexagramId = calculateHexagramId(lines);
    const hexagram = hexagrams[hexagramId];
    
    // 显示卦名
    const nameElement = document.createElement('div');
    nameElement.className = 'hexagram-name fade-in';
    nameElement.textContent = `${hexagram.name}`;
    hexagramDisplay.appendChild(nameElement);
    
    // 从下到上显示六爻
    for (let i = 5; i >= 0; i--) {
        const lineValue = lines[i];
        const lineData = lineValues[lineValue];
        const lineNumber = i + 1;
        const positionNames = ['上爻', '五爻', '四爻', '三爻', '二爻', '初爻'];
        
        const lineContainer = document.createElement('div');
        lineContainer.className = 'line-container fade-in';
        lineContainer.style.animationDelay = `${(5-i)*0.1}s`;
        
        const numberElement = document.createElement('div');
        numberElement.className = 'line-number';
        numberElement.textContent = positionNames[i];
        numberElement.title = `数值: ${lineValue} (${lineData.type}${lineData.changing ? '变' : ''})`;
        
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
    valuesText.innerHTML = `爻值: ${lines.join(', ')}<br>卦序: 第${hexagramId}卦`;
    valuesText.style.marginTop = '15px';
    valuesText.style.textAlign = 'center';
    valuesText.style.fontSize = '0.9em';
    valuesText.style.color = '#666';
    valuesText.className = 'fade-in';
    hexagramDisplay.appendChild(valuesText);
}

// 解读卦象
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
    `;
    interpretationResult.appendChild(basicInfo);
    
    // 使用后端API进行AI解读
    await interpretWithBackendAPI(hexagram, lines);
}

// 使用后端API进行解读
async function interpretWithBackendAPI(hexagram, lines) {
    const statusMsg = document.createElement('div');
    statusMsg.className = 'status-message status-info';
    statusMsg.innerHTML = '<div class="loading"></div>正在通过AI进行智能解读...';
    interpretationResult.appendChild(statusMsg);
    
    try {
        const interpretation = await callBackendAPI(hexagram, lines);
        
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

// 调用后端API
// 调用后端API - 修复版本
async function callBackendAPI(hexagram, lines) {
    console.log('调用后端API...');
    
    const requestData = {
        hexagram: {
            id: calculateHexagramId(lines),
            name: hexagram.name,
            interpretation: hexagram.interpretation
        },
        lines: lines,
        lineDetails: lines.map((line, index) => {
            const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
            const lineType = lineValues[line].type;
            const isChanging = lineValues[line].changing;
            return {
                position: positions[index],
                value: line,
                type: lineType,
                changing: isChanging
            };
        })
    };

    console.log('发送API请求:', requestData);
    
    try {
        const response = await fetch('/api/interpret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            // 添加超时设置
            signal: AbortSignal.timeout(30000) // 30秒超时
        });

        console.log('API响应状态:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API错误详情:', errorData);
            
            if (response.status === 401) {
                throw new Error('API密钥配置错误');
            } else if (response.status === 429) {
                throw new Error('API调用频率限制，请稍后重试');
            } else if (response.status === 500) {
                throw new Error('服务器内部错误，请稍后重试');
            } else {
                throw new Error(`API请求失败: ${response.status} ${errorData.error || response.statusText}`);
            }
        }

        const data = await response.json();
        console.log('API响应数据:', data);

        if (!data.interpretation) {
            throw new Error('API返回数据格式错误');
        }

        return data.interpretation;

    } catch (error) {
        console.error('API调用异常:', error);
        
        // 如果是网络错误，提供更友好的提示
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查网络连接或禁用浏览器扩展后重试');
        }
        
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接后重试');
        }
        
        throw error;
    }
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
