// src/index.ts
import express, { Request, Response } from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from "qrcode"
const cors = require('cors');

const app = express();
app.use(express.json());

// ✅ CORS CONFIGURADO AQUI (ANTES DAS ROTAS)
app.use(cors({
  origin: 'https://gs-lab.vercel.app',
  credentials: true
}));

let whatsappClient: Client;
let isClientReady = false;
let qrCodeData: string | null = null

// Inicializa o cliente do WhatsApp
const initializeWhatsApp = () => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: '.wwebjs_auth'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  });

  // Evento: QR Code para autenticação
  whatsappClient.on("qr", async (qr) => {
    console.log("✅ QR gerado! Acesse http://localhost:3333/qr para escanear.")
    qrCodeData = await qrcode.toDataURL(qr)
  })

  // Evento: Cliente pronto
  whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp conectado e pronto!');
    isClientReady = true;
  });

  // Evento: Autenticação
  whatsappClient.on('authenticated', () => {
    console.log('✅ Autenticado com sucesso!');
  });

  // Evento: Desconectado
  whatsappClient.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
    isClientReady = false;
  });

  // Evento: Erro de autenticação
  whatsappClient.on('auth_failure', (message) => {
    console.error('❌ Falha na autenticação:', message);
    console.log('💡 Dica: Delete as pastas .wwebjs_auth e .wwebjs_cache e tente novamente');
  });

  // Evento: Erro geral
  whatsappClient.on('error', (error) => {
    console.error('❌ Erro no cliente:', error);
  });

  // Evento: Mensagem recebida (para o bot responder)
  whatsappClient.on('message', async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
    
    // Exemplo de resposta automática
    if (message.body.toLowerCase() === 'oi') {
      await message.reply('Olá! Como posso ajudar?');
    }
  });

  whatsappClient.initialize();
};

app.get("/qr", (req, res) => {
  if (!qrCodeData) {
    return res.send("<h2>QR code ainda não foi gerado. Atualize a página em alguns segundos...</h2>")
  }
  res.send(`
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;">
      <h2>Escaneie este QR com o WhatsApp</h2>
      <img src="${qrCodeData}" />
    </div>
  `)
})

// Rota: Verificar status da conexão
app.get('/status', (req: Request, res: Response) => {
  res.json({
    connected: isClientReady,
    message: isClientReady ? 'WhatsApp conectado' : 'WhatsApp não conectado'
  });
});

// Rota: Enviar mensagem para um número específico
app.post('/send-message', async (req: Request, res: Response) => {
  try {
    if (!isClientReady) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não está conectado. Verifique o status.'
      });
    }

    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: 'Campos "number" e "message" são obrigatórios'
      });
    }

    // Formata o número (adiciona código do país se necessário)
    // Formato: 5511999999999@c.us (Brasil)
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    await whatsappClient.sendMessage(chatId, message);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      to: number
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota: Enviar mensagem para múltiplos números
app.post('/send-bulk', async (req: Request, res: Response) => {
  try {
    if (!isClientReady) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp não está conectado'
      });
    }

    const { numbers, message } = req.body;

    if (!numbers || !Array.isArray(numbers) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Campos "numbers" (array) e "message" são obrigatórios'
      });
    }

    const results = [];

    for (const number of numbers) {
      try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await whatsappClient.sendMessage(chatId, message);
        results.push({ number, success: true });
        
        // Delay entre mensagens para evitar bloqueio
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({ 
          number, 
          success: false, 
          error: error instanceof Error ? error.message : 'Erro desconhecido' 
        });
      }
    }

    res.json({
      success: true,
      message: 'Envio em lote concluído',
      results
    });

  } catch (error) {
    console.error('Erro no envio em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no envio em lote',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Inicializa o WhatsApp
initializeWhatsApp();

// Inicia o servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Aguardando conexão do WhatsApp...`);
})

// Tratamento de encerramento gracioso
process.on('SIGINT', async () => {
  console.log('\n⏳ Encerrando servidor...');
  if (whatsappClient) {
    await whatsappClient.destroy()
  }
  process.exit(0)
})