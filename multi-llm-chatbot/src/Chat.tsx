import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  debugInfo?: string; // optional extra info to show model parameters
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
  titleEdited?: boolean;
}

interface ChatProps {
  initialMessage?: string;
}

// Replace with your actual environment variables (or keys).
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MISTRAL_API_KEY = process.env.REACT_APP_MISTRAL_API_KEY; 
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Define our LLM options including ChatGPT (Paid) models.
const llmOptions = [
  { label: '--- Google ---', value: '', disabled: true },
  { label: 'PaLM 2 Chat (Legacy)', value: 'models/chat-bison-001' },
  { label: 'PaLM 2 (Legacy)', value: 'models/text-bison-001' },
  { label: 'Embedding Gecko', value: 'models/embedding-gecko-001' },
  { label: 'Gemini 1.5 Pro', value: 'models/gemini-1.5-pro-latest' },
  { label: 'Gemini 1.5 Flash', value: 'models/gemini-1.5-flash-001' },
  { label: 'Gemini 2.0 Flash', value: 'models/gemini-2.0-flash-001' },
  { label: '--- Mistral ---', value: '', disabled: true },
  { label: 'Mistral Small', value: 'mistral-small-latest' },
  { label: 'Pixtral', value: 'pixtral-large-latest' },
  { label: 'Mistral Nemo', value: 'open-mistral-nemo' },
  { label: 'Codestral Mamba', value: 'codestral-latest' },
  { label: 'Mistral Medium', value: 'mistral-medium' },
  { label: 'Mistral Large Latest', value: 'mistral-large-latest' },
  { label: '--- ChatGPT (Paid) ---', value: '', disabled: true },
  // "gpt-3.5-turbo" is the official name for ChatGPT 3.5
  { label: 'ChatGPT 3.5-turbo', value: 'gpt-3.5-turbo' },
  // GPT-4 requires GPT-4 access on your account
  { label: 'ChatGPT 4', value: 'gpt-4' },
];

// Example model capabilities for debug info
const modelCapabilities: Record<string, string> = {
  "models/chat-bison-001": "PaLM 2 Chat (Legacy): ...",
  "models/text-bison-001": "PaLM 2 (Legacy): ...",
  "models/embedding-gecko-001": "Embedding Gecko: ...",
  'models/gemini-1.5-pro-latest': 'Gemini 1.5 Pro: ...',
  'models/gemini-1.5-flash-001': 'Gemini 1.5 Flash: ...',
  'models/gemini-2.0-flash-001': 'Gemini 2.0 Flash: ...',
  'mistral-small-latest': 'Mistral Small: ...',
  'pixtral-large-latest': 'Pixtral: ...',
  'open-mistral-nemo': 'Mistral Nemo: ...',
  'codestral-latest': 'Codestral Mamba: ...',
  'mistral-medium': 'Mistral Medium: ...',
  'mistral-large-latest': 'Mistral Large: ...',
  "gpt-3.5-turbo": "ChatGPT 3.5-turbo (Paid).",
  "gpt-4": "ChatGPT 4 (Paid).",
};

// A naive summarizer for conversation titles
function autoSummarize(messages: Message[]): string {
  const userTexts = messages
    .filter((m) => m.sender === 'user')
    .map((m) => m.text)
    .join(' ');
  if (!userTexts) return '(No user messages yet)';
  const short = userTexts.substring(0, 60);
  return short + (userTexts.length > 60 ? '...' : '');
}

// Tuning parameters for ChatGPT only
interface ChatGPTTuning {
  temperature: number;  // range [0..2]
  topP: number;         // range [0..1]
}

const Chat: React.FC<ChatProps> = ({ initialMessage = '' }) => {
  const [selectedLLM, setSelectedLLM] = useState<string>('models/gemini-1.5-pro-latest');
  const [previousLLM, setPreviousLLM] = useState<string>('models/gemini-1.5-pro-latest');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: 'New Conversation', messages: [], titleEdited: false },
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState<number>(1);
  const [input, setInput] = useState<string>('');
  const [hasUsedInitialMessage, setHasUsedInitialMessage] = useState(false);

  // Tuning parameters for ChatGPT only
  const [chatgptTuning, setChatgptTuning] = useState<ChatGPTTuning>({
    temperature: 1.0,
    topP: 0.95,
  });

  // For conversation title editing
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Copy text to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Clipboard copy failed:', err);
    });
  };

  // Handle an initial message once
  useEffect(() => {
    if (initialMessage && !hasUsedInitialMessage) {
      setHasUsedInitialMessage(true);
      const userMsg: Message = { text: initialMessage, sender: 'user', timestamp: Date.now() };
      setBotTyping(true);
      handleSendMessage(userMsg.text, userMsg);
    }
  }, [initialMessage, hasUsedInitialMessage, selectedLLM]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages, botTyping]);

  // Create a new conversation if the LLM changes
  useEffect(() => {
    if (selectedLLM !== previousLLM) {
      const newId = conversations.length > 0 ? Math.max(...conversations.map((c) => c.id)) + 1 : 1;
      const label = llmOptions.find((l) => l.value === selectedLLM)?.label || 'Unknown LLM';
      const capabilities = modelCapabilities[selectedLLM] || '(No capabilities)';
      const newConv: Conversation = {
        id: newId,
        title: 'New Conversation',
        messages: [
          {
            text: `Switched to ${label}`,
            sender: 'bot',
            timestamp: Date.now(),
            debugInfo: capabilities,
          },
        ],
        titleEdited: false,
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversationId(newId);
      setPreviousLLM(selectedLLM);
    }
  }, [selectedLLM]);

  // Main send message logic
  const handleSendMessage = async (textOverride?: string, messageOverride?: Message) => {
    if (!selectedConversation || !selectedLLM) return;
    const userText = textOverride ?? input;
    if (!userText.trim()) return;

    const userMsg: Message = messageOverride ?? {
      text: userText,
      sender: 'user',
      timestamp: Date.now(),
    };

    if (!messageOverride) setInput('');
    setBotTyping(true);

    try {
      let botReply = '';

      // If model is Gemini
      if (selectedLLM.startsWith('models/gemini')) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${selectedLLM}:generateContent?key=${GEMINI_API_KEY}`;
        // We do NOT send tuning params for Gemini (it causes errors)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg.text }] }],
          }),
        });
        const data = await response.json();
        botReply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.content?.parts?.[0] ||
          JSON.stringify(data);
      }
      // If model is ChatGPT
      else if (selectedLLM === 'gpt-3.5-turbo' || selectedLLM === 'gpt-4') {
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: selectedLLM,
            messages: [{ role: 'user', content: userMsg.text }],
            // Only ChatGPT supports these params
            temperature: chatgptTuning.temperature,
            top_p: chatgptTuning.topP,
          }),
        });
        const data = await response.json();
        botReply = data?.choices?.[0]?.message?.content || JSON.stringify(data);
      }
      // If model is Mistral
      else {
        // Mistral doesn't accept tuning params => omit them
        const endpoint = 'https://api.mistral.ai/v1/chat/completions';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: selectedLLM,
            messages: [{ role: 'user', content: userMsg.text }],
          }),
        });
        const data = await response.json();
        botReply = data?.choices?.[0]?.message?.content || JSON.stringify(data);
      }

      const botMsg: Message = {
        text: botReply,
        sender: 'bot',
        timestamp: Date.now(),
        debugInfo: `Model: ${selectedLLM}\n${modelCapabilities[selectedLLM] || ''}`,
      };

      updateConversationMessages(userMsg, botMsg);
    } catch (error: any) {
      const errorMsg: Message = {
        text: `Error calling API: ${error.message || error.toString()}`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      updateConversationMessages(userMsg, errorMsg);
    } finally {
      setBotTyping(false);
    }
  };

  // Append new messages to the current conversation
  const updateConversationMessages = (...msgs: Message[]) => {
    if (!selectedConversation) return;
    const updatedMessages = [...selectedConversation.messages, ...msgs];
    let updatedTitle = selectedConversation.title;

    if (!selectedConversation.titleEdited) {
      updatedTitle = autoSummarize(updatedMessages);
    }

    const updatedConv: Conversation = {
      ...selectedConversation,
      messages: updatedMessages,
      title: updatedTitle,
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? updatedConv : c))
    );
  };

  // Start a brand new conversation
  const handleNewChat = () => {
    const newId =
      conversations.length > 0
        ? Math.max(...conversations.map((c) => c.id)) + 1
        : 1;
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      titleEdited: false,
    };
    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(newId);
    setEditingConversationId(null);
  };

  // Sidebar conversation selection
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
    setEditingConversationId(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleExport = () => {
    if (!selectedConversation) return;
    const textContent = selectedConversation.messages
      .map((m) => `${m.sender}: ${m.text}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversation.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // ===== Title Editing Logic =====
  const handleStartEditingTitle = (conv: Conversation) => {
    setEditingConversationId(conv.id);
    setTempTitle(conv.title);
  };

  const handleSaveTitle = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? { ...c, title: tempTitle || '(Untitled)', titleEdited: true }
          : c
      )
    );
    setEditingConversationId(null);
    setTempTitle('');
  };

  const handleCancelEditing = () => {
    setEditingConversationId(null);
    setTempTitle('');
  };

  // Handler for ChatGPT tuning slider changes
  const handleTuningChange = (field: keyof ChatGPTTuning, value: number) => {
    setChatgptTuning((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Decide if we should show tuning panel (only for ChatGPT)
  const isChatGPT = selectedLLM === 'gpt-3.5-turbo' || selectedLLM === 'gpt-4';

  return (
    <div className={`app-container ${theme}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          ✕
        </button>
        <ul className="conversation-list">
          {conversations.map((conv) => {
            const isActive = conv.id === selectedConversationId;
            const isEditing = editingConversationId === conv.id;

            return (
              <li
                key={conv.id}
                className={`conversation-item ${isActive ? 'active' : ''}`}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={() => handleSaveTitle(conv)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(conv);
                      if (e.key === 'Escape') handleCancelEditing();
                    }}
                    className="edit-title-input"
                  />
                ) : (
                  <span
                    className="conversation-title"
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    {conv.title}
                  </span>
                )}
                {!isEditing && (
                  <button
                    className="edit-title-btn"
                    onClick={() => handleStartEditingTitle(conv)}
                  >
                    Edit
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-main">
        <header className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          <select
            className="llm-select"
            value={selectedLLM}
            onChange={(e) => setSelectedLLM(e.target.value)}
          >
            <optgroup label="Google">
              <option value="models/chat-bison-001">PaLM 2 Chat (Legacy)</option>
              <option value="models/text-bison-001">PaLM 2 (Legacy)</option>
              <option value="models/embedding-gecko-001">Embedding Gecko</option>
              <option value="models/gemini-1.5-pro-latest">Gemini 1.5 Pro</option>
              <option value="models/gemini-1.5-flash-001">Gemini 1.5 Flash</option>
              <option value="models/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
            </optgroup>
            <optgroup label="Mistral">
              <option value="mistral-small-latest">Mistral Small</option>
              <option value="pixtral-large-latest">Pixtral</option>
              <option value="open-mistral-nemo">Mistral Nemo</option>
              <option value="codestral-latest">Codestral Mamba</option>
              <option value="mistral-medium">Mistral Medium</option>
              <option value="mistral-large-latest">Mistral Large Latest</option>
            </optgroup>
            <optgroup label="ChatGPT (Paid)">
              <option value="gpt-3.5-turbo">ChatGPT 3.5-turbo</option>
              <option value="gpt-4">ChatGPT 4</option>
            </optgroup>
          </select>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        {/* Only show tuning panel if ChatGPT is selected */}
        {isChatGPT && (
          <div className="tuning-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--chat-window-bg)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            margin: '0.5rem 2rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <label style={{ fontWeight: 'bold' }}>Temperature</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={chatgptTuning.temperature}
                onChange={(e) => handleTuningChange('temperature', parseFloat(e.target.value))}
                style={{ width: '150px', margin: '0.25rem 0' }}
              />
              <span>{chatgptTuning.temperature.toFixed(1)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <label style={{ fontWeight: 'bold' }}>Top P</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={chatgptTuning.topP}
                onChange={(e) => handleTuningChange('topP', parseFloat(e.target.value))}
                style={{ width: '150px', margin: '0.25rem 0' }}
              />
              <span>{chatgptTuning.topP.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Chat Window */}
        <div className="chat-window" ref={chatWindowRef}>
          {selectedConversation?.messages.map((msg, idx) => {
            const isLast = idx === selectedConversation.messages.length - 1;
            const isBot = msg.sender === 'bot';

            return (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                  {msg.debugInfo && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'italic', color: '#aaa' }}>
                      {msg.debugInfo}
                    </div>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                {isBot && isLast && (
                  <div className="export-under-bubble">
                    <button className="export-btn" onClick={handleExport}>Export</button>
                    <button className="copy-btn" onClick={() => handleCopy(msg.text)}>Copy</button>
                  </div>
                )}
              </div>
            );
          })}
          {botTyping && (
            <div className="typing-indicator">
              <div className="spinner">
                <div className="dot dot1"></div>
                <div className="dot dot2"></div>
                <div className="dot dot3"></div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          />
          <button onClick={() => handleSendMessage()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
