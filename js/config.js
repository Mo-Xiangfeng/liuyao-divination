// js/config.js - 修复版本
// Netlify环境变量在构建时注入，我们需要在运行时读取

const DEEPSEEK_API_KEY = (function() {
    // 方法1: 尝试从全局变量读取（Netlify在构建时注入）
    if (typeof window !== 'undefined' && window.DEEPSEEK_API_KEY) {
        console.log('使用window环境变量');
        return window.DEEPSEEK_API_KEY;
    }
    
    // 方法2: 尝试从Netlify的函数环境读取
    if (typeof process !== 'undefined' && process.env && process.env.DEEPSEEK_API_KEY) {
        console.log('使用process环境变量');
        return process.env.DEEPSEEK_API_KEY;
    }
    
    // 方法3: 硬编码测试（临时使用，部署前移除）
    // return "sk-d622410a1d734203a69deaead3b4c5b2";
    
    console.log('未找到API密钥');
    return "";
})();

console.log('API配置调试:', {
    hasKey: !!DEEPSEEK_API_KEY,
    keyLength: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.length : 0,
    keyPreview: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 8) + '...' : '无',
    userAgent: navigator.userAgent
});

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const API_CONFIG = {
    model: "deepseek-chat",
    temperature: 0.7,
    max_tokens: 2000
};

function getApiKey() {
    return DEEPSEEK_API_KEY;
}

function isApiConfigured() {
    const key = getApiKey();
    const configured = key && key.length > 20; // DeepSeek密钥通常较长
    console.log('API配置检查:', { 
        configured, 
        keyLength: key ? key.length : 0,
        keyExists: !!key
    });
    return configured;
}
