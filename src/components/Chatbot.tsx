import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today? Here are some things I can help with:", sender: 'bot' },
    { type: 'faq_suggestions', suggestions: [
      "What services do you offer?",
      "What are your business hours?",
      "How do I contact support?",
      "How can I book a meeting?"
    ]}
  ]);
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    const messageToSend = text.trim();
    if (messageToSend) {
      const userMessage = { text: messageToSend, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      setStatus('submitting');

      try {
        const currentDateTime = new Date(); // Local system date/time

        // Instant local handling for time/date questions
        if (/^(what('| i)s)?\s*(the\s*)?(time|date)/i.test(messageToSend)) {
          const formattedTime = currentDateTime.toLocaleTimeString();
          const formattedDate = currentDateTime.toLocaleDateString();
          const reply = `It's ${formattedTime} on ${formattedDate}.`;
          setMessages(prevMessages => [...prevMessages, { text: reply, sender: 'bot' }]);
          setStatus('idle');
          return;
        }

        // Otherwise, send to backend
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageToSend,
            datetime: currentDateTime.toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch response from backend.');
        }

        const data = await response.json();
        const botResponse = { text: data.reply, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setStatus('idle');
      } catch (error) {
        console.error("Chatbot API error:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' }
        ]);
        setStatus('idle');
      }
    }
  }, []);

  const ChatbotButton = () => (
    <button 
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open chatbot"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );

  const ChatWindow = () => (
    <div className="fixed bottom-6 right-6 w-max sm:w-96 max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in-up">
      <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold text-lg">AI Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-blue-700 transition-colors" aria-label="Close chat">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          msg.type === 'faq_suggestions' ? (
            <div key={index} className="flex justify-center text-center">
              <div className="max-w-[80%] p-3 rounded-xl shadow-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none">
                {msg.suggestions.map((suggestion, suggestionIndex) => (
                  <button
                    key={suggestionIndex}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSendMessage(suggestion);
                    }}
                    className="block w-full text-left my-1 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          )
        ))}
        {status === 'submitting' && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (inputRef.current) {
          handleSendMessage(inputRef.current.value);
        }
      }} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
            placeholder="Type your message..."
            disabled={status === 'submitting'}
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={status === 'submitting'}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {isOpen ? <ChatWindow /> : <ChatbotButton />}
    </>
  );
};

export default Chatbot;
