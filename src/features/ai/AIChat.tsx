import { useEffect, useRef, useState } from "react";
import { X, Send, Trash2, Bot, User, Sparkles, RefreshCw, Copy, CheckCheck, Zap } from "lucide-react";
import { useAIStore, type ChatMessage } from "@/stores/aiStore";
import { aiApiService } from "@/services/api";

function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

const QUICK_PROMPTS = [
  "What are my most urgent tasks?",
  "Plan my day",
  "What goals need attention?",
  "Give me productivity tips",
  "Summarize my week",
];

export function AIChat() {
  const { messages, isStreaming, chatOpen, addMessage, updateLastAssistantMessage, setStreaming, clearChat, setChatOpen } =
    useAIStore();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [chatOpen]);

  async function sendMessage(text: string) {
    const userMsg: ChatMessage = {
      id: shortId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");

    const assistantId = shortId();
    const placeholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    addMessage(placeholder);
    setStreaming(true);

    abortRef.current = aiApiService.streamChat(
      text,
      (chunk) => updateLastAssistantMessage(
        (useAIStore.getState().messages.find(m => m.id === assistantId)?.content ?? "") + chunk,
        true,
      ),
      () => {
        updateLastAssistantMessage(
          useAIStore.getState().messages.find(m => m.id === assistantId)?.content ?? "",
          false,
        );
        setStreaming(false);
      },
      (err) => {
        updateLastAssistantMessage(`⚠️ ${err}`, false);
        setStreaming(false);
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function copyMessage(id: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setStreaming(false);
    const assistantMsg = [...useAIStore.getState().messages].reverse().find(m => m.role === "assistant");
    const assistantContent = assistantMsg ? assistantMsg.content : "";
    updateLastAssistantMessage(
      assistantContent + "\n\n*[Generation stopped]*",
      false,
    );
  }

  if (!chatOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={() => setChatOpen(false)}
      />

      {/* Panel */}
      <div className="relative pointer-events-auto w-full max-w-lg h-[80vh] max-h-[700px] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-transparent to-transparent shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-text-strong text-sm">SimplLife AI</div>
            <div className="text-[10px] text-text-muted">Your productivity partner</div>
          </div>
          <button onClick={clearChat} className="p-1.5 hover:bg-surface-alt rounded-lg transition-colors text-text-muted hover:text-danger" title="Clear chat">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setChatOpen(false)} className="p-1.5 hover:bg-surface-alt rounded-lg transition-colors text-text-muted" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-strong text-lg">How can I help?</h3>
                <p className="text-text-muted text-sm mt-1">Ask me anything about your tasks, goals, habits, or productivity.</p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left px-3 py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-sm text-text-muted hover:text-text transition-all duration-200"
                  >
                    <Zap size={12} className="inline mr-2 text-primary" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onCopy={copyMessage} copiedId={copiedId} />
            ))
          )}
          {isStreaming && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <RefreshCw size={12} className="animate-spin text-primary" />
              <span>Thinking…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              className="flex-1 min-h-[44px] max-h-[120px] px-3 py-2.5 rounded-xl border border-border bg-surface-alt text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none transition-all duration-200"
              placeholder="Ask me anything… (Enter to send)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              rows={1}
            />
            {isStreaming ? (
              <button type="button" onClick={stopStreaming} className="h-11 w-11 rounded-xl bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors shrink-0">
                <X size={18} />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0">
                <Send size={16} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onCopy, copiedId }: {
  msg: ChatMessage;
  onCopy: (id: string, content: string) => void;
  copiedId: string | null;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs ${isUser ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[80%] group relative ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-surface-alt border border-border rounded-tl-sm text-text"
        }`}>
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
          )}
        </div>
        {!isUser && msg.content && !msg.streaming && (
          <button
            onClick={() => onCopy(msg.id, msg.content)}
            className="opacity-0 group-hover:opacity-100 mt-1 p-1 rounded text-text-muted hover:text-text transition-all duration-200"
            title="Copy"
          >
            {copiedId === msg.id ? <CheckCheck size={12} className="text-success" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AIChatButton() {
  const { chatOpen, setChatOpen } = useAIStore();
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    aiApiService.checkStatus()
      .then(res => setConfigured(res.configured))
      .catch(() => setConfigured(false));
  }, []);

  if (configured === false) return null;

  return (
    <button
      onClick={() => setChatOpen(!chatOpen)}
      className="fixed bottom-6 right-6 z-[150] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      title="Open AI Assistant"
    >
      <Sparkles size={22} />
    </button>
  );
}
