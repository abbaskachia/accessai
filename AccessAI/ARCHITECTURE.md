# AccessAI Architecture

```text
User (phone / desktop browser)
          |
          v
React + Vite frontend
  |       |        |
  |       |        +--> Browser Speech Recognition
  |       +-----------> Browser Speech Synthesis
  |
  +--> Express API (/api/chat, /api/document, /api/health)
                  |
                  +--> PDF/TXT text extraction
                  |
                  +--> Ollama local API
                            |
                            +--> Open-weight model (qwen2.5:3b)
```

## Request flow

1. The browser sends the user's message and a short conversation history to Express.
2. Express adds an accessibility-oriented system prompt and selected response language.
3. Express sends the request to Ollama.
4. Ollama runs the configured model and returns a response.
5. The frontend displays the response and can read it aloud through the browser.

## Trust boundaries

- The browser is untrusted input.
- Express validates message length and uploaded file type/size.
- Ollama is expected to be reachable only on a trusted local interface.
- Do not expose Ollama's port publicly.
- Add authentication, stricter rate limiting, HTTPS, monitoring and deployment-specific origin settings before public hosting.
