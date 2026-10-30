require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 30 }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) return callback(null, true);
    callback(new Error("Please upload a PDF or plain text file."));
  }
});

const languageNames = {
  English: "clear, simple English",
  Pidgin: "Nigerian Pidgin English",
  Hausa: "simple Hausa"
};

const systemPrompt = (language) => `You are AccessAI, a helpful and inclusive assistant.
Use ${languageNames[language] || languageNames.English}.
Use short sentences, plain language and clear headings when useful.
Be respectful, patient and practical. Explain technical words.
If you are unsure, say so. Never pretend to have checked live information.
Do not provide a medical diagnosis, legal determination or financial guarantee.
For urgent medical or safety situations, advise contacting qualified local help.
Keep answers concise unless the user asks for detail.`;

async function askOllama(messages) {
  let response;
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages
      }),
      signal: AbortSignal.timeout(120000)
    });
  } catch (error) {
    const unavailable = new Error(
      "I cannot reach Ollama. Start Ollama and download the model, then try again."
    );
    unavailable.status = 503;
    throw unavailable;
  }

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`The AI model returned an error (${response.status}). ${details.slice(0, 250)}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  return data.message?.content || "I could not generate an answer. Please try again.";
}

app.get("/api/health", async (req, res) => {
  let aiAvailable = false;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    aiAvailable = response.ok;
  } catch (_) {}
  res.json({
    ok: true,
    service: "AccessAI API",
    aiAvailable,
    model: OLLAMA_MODEL
  });
});

app.post("/api/chat", async (req, res, next) => {
  try {
    const { message, history = [], language = "English" } = req.body || {};
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a message." });
    }
    if (message.length > 12000) {
      return res.status(400).json({ error: "Your message is too long. Please keep it under 12,000 characters." });
    }

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).filter(item =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
        ).map(item => ({ role: item.role, content: item.content.slice(0, 4000) }))
      : [];

    const answer = await askOllama([
      { role: "system", content: systemPrompt(language) },
      ...safeHistory,
      { role: "user", content: message.trim() }
    ]);

    res.json({ answer, model: OLLAMA_MODEL });
  } catch (error) {
    next(error);
  }
});

app.post("/api/document", upload.single("document"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Choose a PDF or TXT file first." });

    let text;
    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    } else {
      text = req.file.buffer.toString("utf8");
    }

    text = text.replace(/\s+/g, " ").trim();
    if (!text) return res.status(400).json({ error: "No readable text was found in this document." });

    res.json({
      filename: req.file.originalname,
      text: text.slice(0, 18000),
      truncated: text.length > 18000
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error.message);
  const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
  res.status(status).json({
    error: error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
      ? "The file is too large. Maximum size is 5 MB."
      : error.message || "Something went wrong on the server."
  });
});

app.listen(PORT, () => {
  console.log(`AccessAI API running at http://localhost:${PORT}`);
  console.log(`AI model: ${OLLAMA_MODEL}`);
});
