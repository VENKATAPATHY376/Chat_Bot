import React, { useState, useRef, useEffect } from "react";
import ChatBox from "./ChatBox";
import FAQButtons from "./FAQButtons";
import rasaBookingMiddleware from "./services/rasaBookingMiddleware";

function App() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome! I can explain about Clinical Research. Type your questions below or click any question from the sidebar.",
      time: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `user_${Date.now()}`);
  const chatEndRef = useRef(null);
  const [showFAQ, setShowFAQ] = useState(true);
  const [inputValue, setInputValue] = useState('');

  // Auto scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Use middleware
  const processMessage = async (userMessage) =>
    await rasaBookingMiddleware.processMessage(userMessage, sessionId);

  const sendMessage = async (input) => {
    if (!input || !input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage, time: Date.now() }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await processMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse.text, time: Date.now(), source: botResponse.source }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: 'Sorry, I encountered an error. Please try again.',
        time: Date.now(),
        source: 'error'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const cancelBooking = () => {
    rasaBookingMiddleware.resetBooking();
    setMessages(prev => [...prev, {
      sender: "bot",
      text: "Booking cancelled. How else can I help you?",
      time: Date.now(),
      source: 'booking'
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="h-screen max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Clinical Research Assistant</h1>
                <p className="text-sm text-gray-600">Guide to clinical trials & participation</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="font-medium">Help Desk</div>
              <div>24/7 Available</div>
              {rasaBookingMiddleware.isInBookingFlow() && (
                <div className="mt-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  📅 Booking: {rasaBookingMiddleware.getCurrentStep()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 bg-white flex overflow-hidden">
          {/* Chat Column */}
          <div className="flex-1 flex flex-col">
            {/* Messages: add pb so input doesn't overlap */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
              <ChatBox messages={messages} isTyping={isTyping} />
              <div ref={chatEndRef} />
            </div>

            {/* Sticky input area (compact, professional) */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <input
                  type="text"
                  placeholder={
                    rasaBookingMiddleware.isInBookingFlow()
                      ? `Booking step: ${rasaBookingMiddleware.getCurrentStep()}...`
                      : "Type a message or use the sidebar questions..."
                  }
                  className="flex-1 h-10 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isTyping ? '...' : 'Send'}
                </button>

                {rasaBookingMiddleware.isInBookingFlow() && (
                  <button
                    onClick={cancelBooking}
                    className="h-10 px-3 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Compact quick chips */}
              {!rasaBookingMiddleware.isInBookingFlow() && (
                <div className="max-w-4xl mx-auto mt-3 flex gap-2 flex-wrap">
                  <button onClick={() => sendMessage('book appointment')} className="text-xs px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 hover:bg-green-100">Book appointment</button>
                  <button onClick={() => sendMessage('what is clinical trial')} className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 hover:bg-blue-100">What is clinical trial</button>
                  <button onClick={() => sendMessage('available slots')} className="text-xs px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 hover:bg-purple-100">Available slots</button>
                </div>
              )}
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div className={`${showFAQ ? 'w-80' : 'w-12'} transition-all duration-300 border-l border-gray-200 bg-gray-50 flex-shrink-0`}>
            <div className="p-3 border-b">
              <button onClick={() => setShowFAQ(!showFAQ)} className="w-full text-sm text-gray-700 py-2">
                {showFAQ ? 'Quick Questions' : 'Q'}
              </button>
            </div>

            {showFAQ && (
              <div className="h-full overflow-y-auto p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Frequently Asked</h3>
                  <p className="text-xs text-gray-500">Click a question to send it to chat</p>
                </div>
                <FAQButtons sendMessage={sendMessage} />

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase">Booking & Trials</h4>
                  <div className="space-y-2">
                    <button onClick={() => sendMessage('What is clinical trial?')} className="w-full text-left p-2 bg-blue-50 rounded-md text-sm">What is Clinical Trial</button>
                    <button onClick={() => sendMessage('Show me available appointment slots')} className="w-full text-left p-2 bg-green-50 rounded-md text-sm">Available Slots</button>
                    <button onClick={() => sendMessage('I want to book an appointment')} className="w-full text-left p-2 bg-purple-50 rounded-md text-sm">Book Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t px-6 py-3">
          <div className="max-w-7xl mx-auto text-sm text-gray-500 flex items-center justify-between">
            <div>© 2025 Clinical Research Center</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs"><div className="w-2 h-2 bg-green-500 rounded-full"/> Online</span>
              <span className="text-xs">Session ID: {sessionId.slice(-8)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
