<div align="center">

# 🤖 Whats Bot

### Bot para WhatsApp com TypeScript, Puppeteer e Deploy no Railway

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)

**[📋 Reportar Bug](https://github.com/BigOnwer/whats-bot/issues)** • **[💡 Sugerir Feature](https://github.com/BigOnwer/whats-bot/issues)**

> 🚧 **Projeto de portfólio em desenvolvimento.**

</div>

---

## 📖 Sobre o Projeto

O **Whats Bot** é um bot para WhatsApp construído com TypeScript e Puppeteer, rodando em um servidor Node.js containerizado com Docker. O bot automatiza interações no WhatsApp via automação de browser headless com Chromium, e é deployado no Railway com healthcheck e política de restart automático em caso de falha.

O projeto explora na prática automação de browser, containerização com Docker e deploy de serviços long-running em produção.

---

## ✨ Funcionalidades

- 🤖 **Automação do WhatsApp** via Puppeteer com Chromium headless
- 🐳 **Containerizado com Docker** — ambiente isolado e reproduzível
- 🚀 **Deploy no Railway** com healthcheck em `/status` e restart automático
- 🔧 **Escrito em TypeScript** com compilação para produção
- ♻️ **Imagem otimizada** — devDependencies removidas após o build

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Linguagem** | TypeScript |
| **Runtime** | Node.js 20 |
| **Automação** | Puppeteer + Chromium |
| **Container** | Docker (node:20-bullseye-slim) |
| **Deploy** | Railway |
| **Build** | Nixpacks (Railway) |

---

## 🗂️ Estrutura do Projeto

```
whats-bot/
├── src/                  # Código-fonte TypeScript
├── Dockerfile            # Imagem Docker com Chromium
├── railway.toml          # Configuração de deploy no Railway
├── tsconfig.json         # Configuração do TypeScript
└── package.json          # Dependências e scripts
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 20+
- npm
- Docker (opcional, para rodar via container)

### Rodando com Node.js

```bash
# 1. Clone o repositório
git clone https://github.com/BigOnwer/whats-bot.git
cd whats-bot

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Compile e inicie
npm run build
npm start
```

### Rodando com Docker

```bash
# 1. Build da imagem
docker build -t whats-bot .

# 2. Rode o container
docker run -p 3000:3000 --env-file .env whats-bot
```

Acesse [http://localhost:3000/status](http://localhost:3000/status) para verificar se o serviço está de pé.

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Porta do servidor (padrão: 3000)
PORT=3000

# Adicione aqui outras variáveis necessárias para o bot
```

---

## 🐳 Docker em Detalhe

O `Dockerfile` usa `node:20-bullseye-slim` como base e instala o **Chromium** e todas as suas dependências de sistema diretamente via `apt-get`, sem depender do download automático do Puppeteer. Isso garante compatibilidade total em ambiente Linux e reduz falhas no build.

Variáveis de ambiente configuradas automaticamente no container:

```dockerfile
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

---

## 🚂 Deploy no Railway

O projeto está configurado para deploy no Railway via `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/status"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

O Railway verifica a rota `/status` para confirmar que o serviço está saudável, e reinicia automaticamente o container em caso de falha.

### Passos para deploy

1. Faça fork ou clone o repositório
2. Conecte o repositório ao [Railway](https://railway.app/)
3. Configure as variáveis de ambiente no painel do Railway
4. O deploy acontece automaticamente a cada push na branch `main`

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ☕ por **[Gustavo Leal](https://github.com/BigOnwer)**

</div>
