# AccessAI — AI for Everyone

AccessAI is an open-source, voice-enabled AI assistant designed to make information easier to access. Users can ask questions, use browser voice input, listen to answers, adjust display accessibility settings, and upload PDF/TXT documents for plain-language explanations.

> **Hackathon project:** Best Open-Source AI Project  
> **License:** MIT  
> **Status:** MVP starter — test locally before presenting or deploying.

## Why AccessAI?

Many people face barriers when using digital tools: typing can be difficult, long documents can be hard to understand, interfaces may be too small, and internet access may be limited. AccessAI brings voice interaction, readable answers, document explanation and display controls into one lightweight web app.

## Features

- AI chat powered by an open-weight model through Ollama.
- Browser speech recognition for voice input (browser support varies).
- Browser text-to-speech to read assistant answers aloud.
- PDF and TXT upload with plain-language explanation.
- English, Nigerian Pidgin and Hausa response-style options (quality depends on the selected model).
- Adjustable text size, high contrast and dark/light themes.
- Mobile-responsive interface.
- Local browser chat history.
- No paid AI API key required for local development.

## Technology

- Frontend: React + Vite
- Backend: Node.js + Express
- AI runtime: Ollama
- Suggested open-weight model: `qwen2.5:3b`
- PDF extraction: `pdf-parse`
- Browser voice: Web Speech API

## Requirements

Install:
1. Node.js 20 or newer.
2. npm.
3. Ollama from https://ollama.com
4. A model supported by Ollama. The default is `qwen2.5:3b`.

The model download may require a one-time internet connection and several GB of disk space. Once downloaded, local inference can run without sending prompts to a hosted AI API. Hardware performance depends on your computer.

## Run on Windows

Open **Command Prompt** in the extracted `AccessAI` folder.

### 1. Download the AI model

Install and open Ollama, then run:

```cmd
ollama pull qwen2.5:3b
```

Keep Ollama running.

### 2. Install project dependencies

```cmd
npm install
npm run install:all
```

### 3. Configure the backend

```cmd
copy server\.env.example server\.env
```

The default configuration uses:
- API port: `5000`
- Ollama URL: `http://127.0.0.1:11434`
- Model: `qwen2.5:3b`

You can edit `server\.env` if you use another Ollama model.

### 4. Start AccessAI

```cmd
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The backend health endpoint is:

```text
http://localhost:5000/api/health
```

## Use the application

1. Wait for the connection indicator to show that the AI is ready.
2. Type a question or use the microphone button.
3. Use **Read aloud** under an answer to hear it.
4. Upload a PDF or TXT document to ask for a simple explanation.
5. Open accessibility settings to change text size, contrast or response language.

## API

### `GET /api/health`

Returns API status, model name and whether Ollama is reachable.

### `POST /api/chat`

Example body:

```json
{
  "message": "Explain photosynthesis in simple words",
  "history": [],
  "language": "English"
}
```

### `POST /api/document`

Multipart form upload:
- Field name: `document`
- Supported: PDF and TXT
- Maximum size: 5 MB

The API extracts up to 18,000 characters of text for the client to pass to the assistant.

## Project structure

```text
AccessAI/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── LICENSE
├── README.md
└── package.json
```

## Important limitations

- Browser speech recognition is not supported in every browser. Chrome generally offers the best support; browser language support varies.
- The language selector guides the model's response style. It does not guarantee fluent Hausa or Nigerian Pidgin.
- Browser speech synthesis uses voices installed or provided by the device. A Hausa voice may not be available.
- The current MVP does not provide true offline voice recognition or offline speech synthesis. Local AI inference is possible after Ollama and the model have been installed.
- Scanned PDFs need OCR; this MVP extracts embedded PDF text only.
- The app is not a medical, legal or financial professional.
- Chat history is stored in the browser's local storage. Do not use shared/public devices for sensitive conversations.
- The development server is not production deployment. Review security, privacy, logging, file handling, rate limits and hosting configuration before public launch.

## Privacy

When configured for local Ollama, chat prompts are sent to the Ollama service on the same computer/server rather than to a paid hosted AI API. Uploaded files are processed in the backend's memory and are not intentionally saved to disk by this app. Browser chat history remains in local storage until cleared. Review the behavior of your browser, operating system and Ollama installation before using sensitive information.

## Suggested next improvements

1. Add automated tests for API routes and core UI.
2. Add OCR for scanned documents.
3. Add proper Hausa speech recognition and text-to-speech using tested open-source models.
4. Add optional offline speech packages.
5. Add a progressive web app (PWA) install flow and carefully designed offline mode.
6. Add user accounts only if persistent cross-device history is needed.
7. Conduct accessibility testing with keyboard-only navigation and screen readers.
8. Add deployment configuration and production monitoring.

## Open-source contribution

See [CONTRIBUTING.md](CONTRIBUTING.md). Contributions, bug reports and accessibility feedback are welcome.

## Acknowledgements

AccessAI is built with open-source software. Model weights and third-party packages have their own licences and terms. Check each dependency and model licence before redistribution or commercial use.
