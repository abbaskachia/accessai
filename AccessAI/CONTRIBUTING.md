# Contributing to AccessAI

Thank you for helping make AccessAI more inclusive.

## Before contributing

- Search existing issues before opening a duplicate.
- Describe the accessibility barrier or user problem your change addresses.
- Keep changes small and explain how to test them.
- Do not commit secrets, API keys, private documents or personal data.

## Development

```cmd
npm install
npm run install:all
ollama pull qwen2.5:3b
npm run dev
```

## Pull request checklist

- [ ] The change solves a clearly described problem.
- [ ] The interface remains usable on a phone.
- [ ] Keyboard navigation is preserved.
- [ ] Text has sufficient contrast and readable sizing.
- [ ] Errors are explained in plain language.
- [ ] README documentation is updated where necessary.

## Code style

Use clear names and simple components. Prefer semantic HTML, visible focus states and accessible labels. Avoid relying on colour alone to communicate status.
