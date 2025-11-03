// js/config.js
const DEEPSEEK_API_KEY = 
    typeof process !== 'undefined' && process.env && process.env.DEEPSEEK_API_KEY 
    ? process.env.DEEPSEEK_API_KEY 
    : (window.DEEPSEEK_API_KEY || "fallback-key-if-needed");

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
    return DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 10;
}