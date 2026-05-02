import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Trash2, ChevronDown } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(
    JSON.parse(localStorage.getItem('chatHistory') || '[]')
  );
  const [currentChatId, setCurrentChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Salvar histórico no localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // WEBHOOK PARA MAKE.COM
      const response = await fetch('SEU_WEBHOOK_URL_AQUI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId: currentChatId || Date.now(),
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      const aiMessage = {
        role: 'assistant',
        content: data.response || 'Desculpa, não consegui processar sua mensagem.',
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Salvar no histórico
      if (!currentChatId) {
        const chatId = Date.now();
        setCurrentChatId(chatId);
        setChatHistory([
          ...chatHistory,
          {
            id: chatId,
            title: input.substring(0, 30) + (input.length > 30 ? '...' : ''),
            messages: updatedMessages,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setChatHistory(
          chatHistory.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: updatedMessages }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Erro na conexão. Verifique sua configuração do webhook.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput('');
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
  };

  const deleteChat = (chatId) => {
    setChatHistory(chatHistory.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar com histórico */}
      <div style={{ ...styles.sidebar, display: showSidebar ? 'flex' : 'none' }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Histórico</h2>
          <button
            onClick={() => setShowSidebar(false)}
            style={styles.closeSidebarBtn}
          >
            ✕
          </button>
        </div>

        <button onClick={startNewChat} style={styles.newChatBtn}>
          + Novo Chat
        </button>

        <div style={styles.chatList}>
          {chatHistory.map((chat) => (
            <div key={chat.id} style={styles.chatItem}>
              <button
                onClick={() => loadChat(chat)}
                style={{
                  ...styles.chatItemBtn,
                  backgroundColor:
                    currentChatId === chat.id
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'transparent',
                }}
              >
                <MessageCircle size={16} style={styles.chatIcon} />
                <span style={styles.chatTitle}>{chat.title}</span>
              </button>
              <button
                onClick={() => deleteChat(chat.id)}
                style={styles.deleteBtn}
                title="Deletar chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={styles.menuBtn}
          >
            ☰
          </button>
          <h1 style={styles.headerTitle}>✨ AI Assistant</h1>
          <div style={styles.headerSpacer} />
        </div>

        {/* Messages Container */}
        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤖</div>
              <h2 style={styles.emptyTitle}>Bem-vindo ao AI Assistant</h2>
              <p style={styles.emptyText}>
                Comece uma conversa e veja a magia acontecer
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.messageWrapper,
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor:
                      msg.role === 'user'
                        ? 'rgba(99, 102, 241, 0.8)'
                        : 'rgba(255, 255, 255, 0.1)',
                    borderColor:
                      msg.role === 'user'
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'rgba(255, 255, 255, 0.2)',
                    color: msg.role === 'user' ? '#fff' : '#e0e0e0',
                  }}
                >
                  <p style={styles.messageText}>{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}>
              <div
                style={{
                  ...styles.messageBubble,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <div style={styles.typingIndicator}>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                  <span style={styles.dot}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} style={styles.inputArea}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escreva sua mensagem..."
              disabled={loading}
              style={styles.input}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                ...styles.sendBtn,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap');

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        * {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: '"Inter", sans-serif',
    color: '#e0e0e0',
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    gap: '16px',
    overflowY: 'auto',
    '@media (max-width: 768px)': {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      zIndex: 1000,
    },
  },

  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },

  sidebarTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },

  closeSidebarBtn: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '20px',
    padding: 0,
  },

  newChatBtn: {
    padding: '10px 16px',
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  chatList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  chatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    animation: 'slideInUp 0.3s ease-out',
  },

  chatItemBtn: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#999',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    fontSize: '13px',
    textAlign: 'left',
  },

  chatIcon: {
    minWidth: '16px',
  },

  chatTitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '4px',
    transition: 'all 0.3s ease',
  },

  // Main Content
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },

  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '20px',
    padding: 0,
    display: 'none',
  },

  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },

  headerSpacer: {
    flex: 1,
  },

  // Messages
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '12px',
    color: '#666',
  },

  emptyIcon: {
    fontSize: '48px',
    animation: 'pulse 2s ease-in-out infinite',
  },

  emptyTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#ccc',
  },

  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },

  messageWrapper: {
    display: 'flex',
    animation: 'slideInUp 0.4s ease-out',
  },

  messageBubble: {
    maxWidth: '60%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    wordWrap: 'break-word',
  },

  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  },

  typingIndicator: {
    display: 'flex',
    gap: '4px',
    height: '8px',
  },

  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#666',
    animation: 'typing 1.4s infinite',
  },

  // Input
  inputArea: {
    padding: '20px 24px',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },

  inputWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },

  sendBtn: {
    padding: '10px 14px',
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
};

export default AIChat;
