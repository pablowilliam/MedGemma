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

// memory for the last image received
let cachedImageBase64 = null;

// SYSTEM FINAL (SSimplified and compatible with Ollama.)
const systemInstruction =  "You are a specialized medical AI assistant for healthcare professionals. Always respond exclusively in English. " +
  "When analyzing clinical or imaging exams, use advanced medical terminology appropriate for physicians. " +
  "Mandatory output format, do not use markdown or special characters. Use HTML only: " +
  "FINDINGS: detailed description\n\nDIAGNOSTIC IMPRESSION:\n\n direct diagnosis";

// CHAT ROUTE
app.post('/api/chat', upload.single('fileUpload'), async (req, res) => {
  try {
    let userPrompt = (req.body.text || "").trim();
    const uploadedFile = req.file;

    // 1) NEW IMAGE → update cache
    if (uploadedFile && uploadedFile.mimetype?.startsWith('image/')) {
      cachedImageBase64 = uploadedFile.buffer.toString('base64');
      console.log("[LOG] Image received and stored in cache.");
    }

    // 2) If only image → await question
    if (!userPrompt && cachedImageBase64) {
      return res.json({ reply: "Image received. Describe what you want to analyze." });
    }

    // 3) Multimodal payload to Ollama
    const userMessage = { role: "user", content: userPrompt || "Prepare the report based on the image provided." };
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

    console.log("[LOG] Sending payload to Ollama...");

    const r = await axios.post("http://localhost:11434/api/chat", payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[LOG] Response received from the template.");
    return res.json({ reply: r.data?.message?.content || "" });

  } catch (err) {
    console.error("[LOG][ERRO OLLAMA]", err.message);
    return res.status(500).json({ error: "Error communicating with the model." });
  }
});

// START SERVER
app.listen(port, () => {
  console.log(`✅ Syrus AI Backend active in http://localhost:${port}`);
});
