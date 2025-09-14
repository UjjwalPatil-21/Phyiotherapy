import React, { useState, useEffect } from 'react';
import faqData from '../../faq.json'; // Import the offline FAQ data

// A simple offline search logic
const getOfflineResponse = (message) => {
  const msg = message.toLowerCase();
  // A more sophisticated search could be implemented, e.g., using keyword matching, fuzzy search, etc.
  for (const key in faqData) {
    if (msg.includes(key.replace('_', ' '))) {
      return faqData[key].answer;
    }
    if (msg.includes(faqData[key].question.toLowerCase().substring(0, 10))) {
        return faqData[key].answer;
    }
  }
  return "I'm not sure how to answer that offline. Please check your internet connection for more advanced questions.";
};


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your friendly physio-assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    if (isOnline) {
      // --- Online Mode ---
      try {
        const response = await fetch('http://127.0.0.1:5000/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        });
        const data = await response.json();
        const botMessage = { text: data.reply, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Could not connect to the chatbot API.", error);
        const botMessage = { text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.", sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
    } else {
      // --- Offline Mode ---
      const offlineResponse = getOfflineResponse(inputValue);
      const botMessage = { text: offlineResponse, sender: 'bot' };
      setTimeout(() => { // Simulate bot thinking time
          setMessages(prevMessages => [...prevMessages, botMessage]);
      }, 500);
    }
  };

  return (
    <div style={styles.container}>
      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <h2>Physio Assistant</h2>
            <span style={isOnline ? styles.onlineIndicator : styles.offlineIndicator}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button onClick={toggleChat} style={styles.closeButton}>X</button>
          </div>
          {/* Messages */}
          <div style={styles.messageArea}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.sender === 'bot' ? styles.botMessage : styles.userMessage}>
                {msg.text}
              </div>
            ))}
          </div>
          {/* Input */}
          <form onSubmit={handleSendMessage} style={styles.inputForm}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={styles.input}
              placeholder="Ask me a question..."
            />
            <button type="submit" style={styles.sendButton}>Send</button>
          </form>
        </div>
      )}
      {/* Floating Avatar Button */}
      <button onClick={toggleChat} style={styles.avatarButton}>
        {/* Placeholder for the cartoon girl avatar */}
        <img src="https://i.imgur.com/8b2zPJ8.png" alt="Chatbot Avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}}/>
      </button>
    </div>
  );
};

// --- Styles ---
// Using inline styles for simplicity as I can't easily set up CSS modules.
const styles = {
    container: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
    },
    avatarButton: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        border: '3px solid white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '24px',
    },
    chatWindow: {
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'absolute',
        bottom: '100px',
        right: '0px',
    },
    header: {
        padding: '15px',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
    },
    onlineIndicator: {
        fontSize: '12px',
        backgroundColor: '#28a745',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    offlineIndicator: {
        fontSize: '12px',
        backgroundColor: '#6c757d',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    messageArea: {
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f0f0',
        borderRadius: '10px',
        padding: '10px 15px',
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '10px',
        padding: '10px 15px',
        maxWidth: '80%',
    },
    inputForm: {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ddd',
    },
    input: {
        flex: 1,
        border: 'none',
        padding: '10px',
        borderRadius: '20px',
        backgroundColor: '#f1f0f0',
    },
    sendButton: {
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '20px',
        marginLeft: '10px',
        cursor: 'pointer',
    }
};

export default Chatbot;
