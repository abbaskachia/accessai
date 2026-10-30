import { useEffect, useRef, useState } from "react";
import {
  Accessibility, AudioLines, Bot, Check, ChevronDown, FileText,
  Globe2, Menu, Mic, Moon, Send, Settings2, Sparkles, Sun,
  Volume2, VolumeX, Waves, X
} from "lucide-react";

const starterQuestions = [
  "Explain a difficult topic in simple words",
  "Help me understand a document",
  "Give me a study plan for this week"
];

function App() {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("accessai-chat")) || []; }
    catch { return []; }
  });
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [fontScale, setFontScale] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Checking AI connection...");
  const [documentName, setDocumentName] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("accessai-chat", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setStatus(data.aiAvailable ? `AI ready · ${data.model}` : "AI offline · Start Ollama");
    } catch {
      setStatus("Server offline · Start the backend");
    }
  }

  async function sendMessage(value = input) {
    const text = value.trim();
    if (!text || loading) return;

    const updated = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8),
          language
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The request failed.");
      setMessages([...updated, { role: "assistant", content: data.answer }]);
    } catch (error) {
      setMessages([...updated, {
        role: "assistant",
        content: `I couldn't connect to the AI right now. ${error.message} Check that the backend and Ollama are running, then try again.`
      }]);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice typing is not supported in this browser. Try Chrome on Android or desktop.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "Hausa" ? "ha-NG" : language === "Pidgin" ? "en-NG" : "en-NG";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((current) => current ? `${current} ${transcript}` : transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function readAloud(text) {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "Hausa" ? "ha-NG" : "en-NG";
    utterance.rate = 0.92;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function uploadDocument(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentName(file.name);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("document", file);
      const response = await fetch("/api/document", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not read document.");
      const prompt = `Please explain this document in simple language. Give me its main points and explain difficult words. ${data.truncated ? "The document text was shortened because it was very long." : ""}\n\nDocument: ${data.filename}\n\n${data.text}`;
      setLoading(false);
      await sendMessage(prompt);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error.message }]);
      setLoading(false);
    }
    event.target.value = "";
  }

  function clearChat() {
    if (window.confirm("Clear this conversation from this browser?")) {
      setMessages([]);
      localStorage.removeItem("accessai-chat");
      window.speechSynthesis?.cancel();
    }
  }

  return (
    <div className={`app ${darkMode ? "dark" : "light"} ${highContrast ? "contrast" : ""}`} data-font={fontScale}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="AccessAI home">
          <span className="brand-mark"><Accessibility size={23} /></span>
          <span>Access<span>AI</span><small>AI for everyone</small></span>
        </a>
        <div className="top-actions">
          <span className={`connection ${status.includes("ready") ? "online" : ""}`}><span className="dot" />{status}</span>
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle colour theme">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(!showSettings)} aria-label="Accessibility settings">
            <Settings2 size={18} />
          </button>
          <button className="icon-btn mobile-only" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">
            <Menu size={19} />
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className={`sidebar ${mobileMenu ? "show" : ""}`}>
          <button className="new-chat" onClick={clearChat}><Sparkles size={17} /> New conversation</button>
          <div className="side-label">YOUR ASSISTANT</div>
          <div className="side-feature active"><Bot size={18} /> AI Chat <span className="active-dot" /></div>
          <button className="side-feature" onClick={() => fileRef.current?.click()}><FileText size={18} /> Explain a document</button>
          <div className="side-label second">ACCESSIBILITY</div>
          <button className="side-feature" onClick={() => setShowSettings(!showSettings)}><Accessibility size={18} /> Display settings</button>
          <div className="sidebar-note">
            <Waves size={18} />
            <strong>Designed for everyone</strong>
            <p>Use your voice, adjust the text size and choose a comfortable display.</p>
          </div>
          <div className="side-footer">Open-source project · MIT License</div>
        </aside>

        <main className="main">
          {showSettings && (
            <section className="settings-panel" aria-label="Accessibility settings">
              <div className="settings-heading"><strong>Accessibility settings</strong><button className="icon-btn" onClick={() => setShowSettings(false)} aria-label="Close settings"><X size={17} /></button></div>
              <label>Text size
                <select value={fontScale} onChange={(e) => setFontScale(e.target.value)}>
                  <option value="normal">Normal</option><option value="large">Large</option><option value="xlarge">Extra large</option>
                </select>
              </label>
              <label className="switch-label">High contrast <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} /></label>
              <label>Response language
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option><option>Pidgin</option><option>Hausa</option>
                </select>
              </label>
            </section>
          )}

          <div className="content">
            {messages.length === 0 ? (
              <section className="welcome">
                <div className="welcome-icon"><AudioLines size={29} /></div>
                <div className="eyebrow">YOUR PERSONAL AI ASSISTANT</div>
                <h1>Technology should be<br /><span>accessible to everyone.</span></h1>
                <p className="welcome-copy">Ask questions, speak naturally or upload a document. I'll explain things clearly and help you take the next step.</p>
                <div className="quick-grid">
                  {starterQuestions.map((question) => (
                    <button key={question} className="quick-card" onClick={() => sendMessage(question)}>
                      <span>{question}</span><span className="quick-arrow">↗</span>
                    </button>
                  ))}
                </div>
                <div className="welcome-tip"><Volume2 size={17} /> You can listen to answers, change text size and use voice input.</div>
              </section>
            ) : (
              <section className="conversation" aria-live="polite" aria-label="Conversation">
                <div className="conversation-title"><span className="assistant-avatar"><Bot size={18} /></span><div><strong>AccessAI</strong><small>Here to help</small></div></div>
                {messages.map((message, index) => (
                  <div className={`message-row ${message.role}`} key={index}>
                    {message.role === "assistant" && <span className="message-avatar"><Bot size={17} /></span>}
                    <div className="message-bubble">
                      <div className="message-text">{message.content}</div>
                      {message.role === "assistant" && <button className="read-button" onClick={() => readAloud(message.content)}><Volume2 size={15} /> Read aloud</button>}
                    </div>
                  </div>
                ))}
                {loading && <div className="message-row assistant"><span className="message-avatar"><Bot size={17} /></span><div className="message-bubble typing"><span /><span /><span /></div></div>}
                <div ref={bottomRef} />
              </section>
            )}
          </div>

          <div className="composer-wrap">
            {documentName && <div className="file-chip"><FileText size={14} /> {documentName} <button onClick={() => setDocumentName("")} aria-label="Remove document name"><X size={14} /></button></div>}
            <div className="composer">
              <button className={`composer-icon ${listening ? "recording" : ""}`} onClick={startVoiceInput} aria-label={listening ? "Stop voice input" : "Start voice input"} title="Speak your message">
                <Mic size={19} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={listening ? "Listening… speak now" : "Type a message or use your voice…"}
                aria-label="Message to AccessAI"
                rows="1"
              />
              <button className="composer-icon attach" onClick={() => fileRef.current?.click()} aria-label="Upload a PDF or text document" title="Upload document"><FileText size={19} /></button>
              <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading} aria-label="Send message"><Send size={18} /></button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" hidden onChange={uploadDocument} />
            <div className="composer-foot"><span><Globe2 size={13} /> {language} · Voice input available in supported browsers</span><span>AI can make mistakes. Check important information.</span></div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
