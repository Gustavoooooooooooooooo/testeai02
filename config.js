// ===== CONFIG.JS =====
// Escolha sua opção preferida e configure aqui

const CONFIG = {
  // ❌ DESCOMENTE para usar Make.com
  // WEBHOOK_URL: 'https://hook.make.com/COPIE_SUA_URL_AQUI',
  // USE_LOCAL_SERVER: false,

  // ✅ DESCOMENTE para usar servidor local Node.js
  WEBHOOK_URL: 'http://localhost:3001/chat',
  USE_LOCAL_SERVER: true,

  // Opções de modelo (OpenRouter)
  MODELS: [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Recomendado)', fast: true },
    { id: 'claude-3-opus', name: 'Claude 3 Opus (Mais poderoso)', fast: false },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', fast: true },
    { id: 'mistral/mixtral-8x7b', name: 'Mixtral (Rápido)', fast: true },
  ],

  // Temperatura (0 = determinístico, 1 = criativo)
  TEMPERATURE: 0.7,

  // Max tokens por resposta
  MAX_TOKENS: 1024,

  // Debug mode
  DEBUG: true,
};

export default CONFIG;

/*
=============================================================
📚 GUIA DE CONFIGURAÇÃO
=============================================================

OPÇÃO 1: Make.com (Recomendado para produção)
─────────────────────────────────────────────────
✅ Vantagens:
  - Sem código backend necessário
  - Escalável
  - Interface visual
  - Rate limiting automático

❌ Desvantagens:
  - Delay um pouco maior (5-10s)
  - Free tier limitado
  - Requer ativar scenario manualmente

COMO CONFIGURAR:
  1. Acesse https://www.make.com
  2. Crie novo scenario
  3. Adicione webhook → Custom webhook
  4. Copie a URL (https://hook.make.com/...)
  5. Adicione módulo HTTP Request
  6. Configure conforme o GUIA_WEBHOOK_MAKE.md
  7. Cole a URL aqui em WEBHOOK_URL
  8. Comente a linha USE_LOCAL_SERVER


OPÇÃO 2: Servidor Node.js Local (Melhor para desenvolvimento)
─────────────────────────────────────────────────────────────
✅ Vantagens:
  - Resposta ultra rápida
  - Total controle
  - Sem dependências externas
  - Fácil de debugar

❌ Desvantagens:
  - Precisa manter servidor rodando
  - Não escala para múltiplos usuários
  - Requer Node.js instalado

COMO CONFIGURAR:
  1. npm install express cors dotenv axios body-parser
  2. Crie arquivo .env:
     OPENROUTER_API_KEY=sk-or-...
     PORT=3001
  3. Rode: node server.js
  4. A URL já está configurada como http://localhost:3001/chat
  5. Certifique-se que USE_LOCAL_SERVER = true


EXEMPLO DE .env PARA OPÇÃO 2:
─────────────────────────────
OPENROUTER_API_KEY=sk-or-v01.8ca4f7c0d2e3c8b1a9f6e5d4c3b2a1f0-kT4

Obtenha em: https://openrouter.ai/keys


COMO TESTAR SUA CONFIGURAÇÃO:
─────────────────────────────
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como você está?"}'

ou para Make.com:

curl -X POST https://hook.make.com/... \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como você está?"}'


MODELOS DISPONÍVEIS:
──────────────────
- claude-3-5-sonnet: Melhor qualidade/velocidade
- claude-3-opus: Mais poderoso
- gpt-4-turbo: Excelente
- mistral/mixtral-8x7b: Ultra rápido
- meta-llama/llama-2-70b: Grátis!

=============================================================
*/
