// server.js
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const pdf = require('pdf-parse');

const app = express();
const port = process.env.PORT || 3001;

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// memória para última imagem recebida
let cachedImageBase64 = null;

// SYSTEM FINAL (SIMPLIFICADO E COMPATÍVEL COM OLLAMA)
const systemInstruction =
  "És um assistente médico especializado para médicos. Respondes sempre em Português de Portugal. " +
  "Quando analisas exames imagiológicos ou clínicos, usa linguagem técnica avançada. " +
  "Formato obrigatório, não use markdown nem caracteres especiais, use formato HTML: ACHADOS: descrição \n\nIMPRESSÃO DIAGNÓSTICA:\n\n diagnóstico direto\n";

// ROTA DE CHAT
app.post('/api/chat', upload.single('fileUpload'), async (req, res) => {
  try {
    let userPrompt = (req.body.text || "").trim();
    const uploadedFile = req.file;

    // 1) NOVA IMAGEM → atualiza cache
    if (uploadedFile && uploadedFile.mimetype?.startsWith('image/')) {
      cachedImageBase64 = uploadedFile.buffer.toString('base64');
      console.log("[LOG] Imagem recebida e armazenada em cache.");
    }

    // 2) Se só imagem → aguarda pergunta
    if (!userPrompt && cachedImageBase64) {
      return res.json({ reply: "Imagem recebida. Descreve o que pretendes analisar." });
    }

    // 3) Payload multimodal para Ollama
    const userMessage = { role: "user", content: userPrompt || "Elabora o laudo com base na imagem fornecida." };
    if (cachedImageBase64) userMessage.images = [cachedImageBase64];

    const payload = {
      model: "amsaravi/medgemma-4b-it:q8",
      stream: false,
      options: { temperature: 0.2 },
      messages: [
        { role: "system", content: systemInstruction },
        userMessage
      ]
    };

    console.log("[LOG] Enviando payload para Ollama...");

    const r = await axios.post("http://localhost:11434/api/chat", payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[LOG] Resposta recebida do modelo.");
    return res.json({ reply: r.data?.message?.content || "" });

  } catch (err) {
    console.error("[LOG][ERRO OLLAMA]", err.message);
    return res.status(500).json({ error: "Erro ao comunicar com o modelo." });
  }
});

// START SERVER
app.listen(port, () => {
  console.log(`✅ Syrus AI Backend ativo em http://localhost:${port}`);
});
