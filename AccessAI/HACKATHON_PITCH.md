# AccessAI — Hackathon Pitch

## One-line pitch

AccessAI makes AI easier to use for everyone through voice interaction, plain-language document explanations and adaptable accessibility controls.

## The problem

Digital services often assume users can comfortably type, read dense text, navigate small controls and maintain a reliable internet connection. These assumptions exclude people with visual, motor, literacy and connectivity barriers.

## Our solution

AccessAI is a lightweight web assistant with:
- Text and voice-based questions.
- Read-aloud responses.
- PDF and text document explanations.
- Adjustable text size and high-contrast display.
- Local AI inference using an open-weight model through Ollama.

## Why open source matters

Open-weight models and open-source tooling let developers inspect, run and adapt the system without depending on a single paid AI API. Local inference can also reduce the need to send user prompts to an external model provider. The project can be forked and improved for local languages and accessibility needs.

## Demo script (3 minutes)

1. Open AccessAI on a phone-sized browser window.
2. Ask: "Explain how solar panels work in simple words."
3. Use Read aloud to hear the answer.
4. Increase the text size and enable high contrast.
5. Upload a short PDF or TXT file and request a simple summary.
6. Explain that the model runs locally through Ollama.

## What is implemented in this MVP

React web app, Express API, Ollama chat integration, PDF/TXT text extraction, browser speech input/output, adjustable text size, contrast toggle, theme toggle and local browser chat history.

## What is not yet complete

True offline speech recognition, guaranteed Hausa speech support, OCR for scanned PDFs, formal accessibility certification, production hosting and independent security review. Be transparent about these limitations during judging.

## Suggested judging metrics

- Task completion rate for voice and text interactions.
- Time needed to understand a sample document.
- Keyboard-only navigation success.
- Screen-reader usability feedback.
- Model response quality in English, Pidgin and Hausa.
- Data usage and response latency on low-bandwidth connections.
