// js/config.js - Netlify构建时替换版本
const DEEPSEEK_API_KEY = "DEEPSEEK_API_KEY_PLACEHOLDER"; // Netlify构建时会替换这个占位符

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
    // 检查密钥不是占位符且长度足够
    const configured = key && key !== "DEEPSEEK_API_KEY_PLACEHOLDER" && key.length > 20;
    console.log('API配置状态:', { configured, keyLength: key ? key.length : 0 });
    return configured;
}
