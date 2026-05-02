// ===== ALTERNATIVA LOCAL: Servidor Node.js + Express =====
// Use isso se quiser hospedar localmente em vez do Make.com

// 1. Instale dependências:
// npm install express cors dotenv axios body-parser

// 2. Crie arquivo .env:
// OPENROUTER_API_KEY=sk-or-seu-key-aqui
// PORT=3001

// 3. Rode com: node server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Armazena histórico de conversas (em produção, use banco de dados)
const conversations = new Map();

// 🔑 Rota principal: POST /chat
app.post('/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Recupera histórico da conversa
    let messages = [];
    if (conversationId && conversations.has(conversationId)) {
      messages = conversations.get(conversationId);
    }

    // Adiciona nova mensagem ao histórico
    messages.push({
      role: 'user',
      content: message,
    });

    // Chama OpenRouter API
    const response = await axios.post(
      'https://api.openrouter.ai/api/v1/chat/completions',
      {
        model: 'claude-3-5-sonnet', // Mude conforme desejado
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'AI Chat Local Server',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Salva resposta no histórico
    messages.push({
      role: 'assistant',
      content: aiResponse,
    });

    // Salva conversa (se tiver ID)
    if (conversationId) {
      conversations.set(conversationId, messages);
    }

    // Retorna resposta
    res.json({
      response: aiResponse,
      conversationId: conversationId || Date.now(),
      usage: {
        input_tokens: response.data.usage.prompt_tokens,
        output_tokens: response.data.usage.completion_tokens,
      },
    });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({
      error: 'Erro ao processar mensagem',
      details: error.message,
    });
  }
});

// 🔍 Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'Servidor rodando! ✅' });
});

// 📝 Rota para obter histórico
app.get('/history/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const history = conversations.get(conversationId) || [];
  res.json({ conversationId, messages: history });
});

// 🗑️ Rota para limpar histórico
app.delete('/history/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  conversations.delete(conversationId);
  res.json({ message: 'Histórico deletado' });
});

// Inicia servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✨ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 POST /chat - Enviar mensagem`);
  console.log(`📊 GET /history/:id - Ver histórico`);
  console.log(`🧹 DELETE /history/:id - Limpar histórico`);
});
