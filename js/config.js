// js/config.js - 正确的环境变量配置
const DEEPSEEK_CONFIG = {
    // 方法1: 从Netlify环境变量获取（构建时替换）
    apiKey: "DEEPSEEK_API_KEY",
    
    // 方法2: 备用方案 - 从localStorage获取用户输入的密钥
    getApiKey: function() {
        // 首先检查用户是否手动输入过密钥
        const userKey = localStorage.getItem('user_deepseek_api_key');
        if (userKey && userKey.length > 20) {
            console.log('使用用户输入的API密钥');
            return userKey;
        }
        
        // 然后使用Netlify环境变量
        if (this.apiKey && this.apiKey !== "DEEPSEEK_API_KEY" && this.apiKey.length > 20) {
            console.log('使用Netlify环境变量API密钥');
            return this.apiKey;
        }
        
        console.log('未找到有效的API密钥');
        return "";
    },
    
    apiUrl: "https://api.deepseek.com/chat/completions",
    
    modelConfig: {
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 2000
    }
};

// 兼容旧代码的函数
function getApiKey() {
    return DEEPSEEK_CONFIG.getApiKey();
}

function isApiConfigured() {
    const key = getApiKey();
    const isConfigured = key && key.length > 20;
    console.log('API配置检查:', { 
        isConfigured, 
        keyLength: key ? key.length : 0,
        keyPreview: key ? key.substring(0, 8) + '...' : '无'
    });
    return isConfigured;
}
