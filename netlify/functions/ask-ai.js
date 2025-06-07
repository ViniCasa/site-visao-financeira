// Conteúdo para: netlify/functions/ask-ai.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. Pega a pergunta do usuário que veio do site
    const { prompt } = JSON.parse(event.body);

    // 2. Pega a chave secreta da API, que está guardada de forma segura no Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    // 3. Verifica se a chave foi configurada
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "A chave da API (GEMINI_API_KEY) não foi configurada no painel do Netlify." })
        };
    }
    
    // 4. Prepara a chamada para a IA do Google
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };

    try {
        // 5. Faz a chamada segura para a IA do Google
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Erro da API Gemini: ${errorData.error?.message || response.statusText}` })
            };
        }

        const result = await response.json();
        
        // 6. Retorna a resposta da IA para o seu site
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};