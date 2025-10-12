import React, { useState, useRef, useEffect } from "react";
import ChatBox from "./ChatBox";
import FAQButtons from "./FAQButtons";

function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome! I can explain about Clinical Research. Tap a question to begin.",
      time: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `user_${Date.now()}`);
  const chatEndRef = useRef(null);
  const [showFAQ, setShowFAQ] = useState(true);
  // Auto scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (input) => {
    if (!input || !input.trim()) return;

    const userMsg = { sender: "user", text: input, time: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const payload = { sender: sessionId, message: input };

      const response = await fetch(
        "http://localhost:5005/webhooks/rest/webhook",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const botMessages = data
          .filter((m) => m && (m.text || m.image))
          .map((m) => ({
            sender: "bot",
            text: m.text || (m.image ? "[image]" : ""),
            time: Date.now(),
          }));

        if (botMessages.length > 0) {
          setMessages((prev) => [...prev, ...botMessages]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "(no text reply from Rasa) — see console for raw response",
              time: Date.now(),
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Sorry, I didn't get a reply.", time: Date.now() },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Unable to reach the server.", time: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Kiosk Container */}
      <div className="h-screen max-w-7xl mx-auto flex flex-col p-4">
        
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b border-gray-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Clinical Research Assistant</h1>
                <p className="text-gray-600 text-sm">Your guide to understanding clinical trials and research participation</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="font-medium">Help Desk</div>
              <div>24/7 Available</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white flex overflow-hidden">
          
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatBox messages={messages} isTyping={isTyping} />
              <div ref={chatEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex gap-3 max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Ask me anything about clinical trials..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendMessage(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.parentElement.querySelector('input');
                    if (input.value.trim()) {
                      sendMessage(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div className={`${showFAQ ? 'w-96' : 'w-12'} transition-all duration-300 border-l border-gray-200 bg-gray-50`}>
            
            {/* Toggle Button */}
            <div className="p-3 border-b border-gray-200">
              <button
                onClick={() => setShowFAQ(!showFAQ)}
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={showFAQ ? "Hide Quick Questions" : "Show Quick Questions"}
              >
                {showFAQ ? (
                  <>
                    <span className="text-sm font-medium text-gray-700 mr-2">Quick Questions</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
              </button>
            </div>

            {/* FAQ Content */}
            {showFAQ && (
              <div className="h-full overflow-y-auto p-4">
                <FAQButtons sendMessage={sendMessage} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-b-2xl border-t border-gray-100 px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>© 2025 Clinical Research Center</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </span>
              <span>Need help? Contact support</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
