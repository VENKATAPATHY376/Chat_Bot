import React, { useEffect, useRef } from "react";

function ChatBox({ messages, isTyping }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div ref={ref} className="h-full overflow-y-auto p-6 space-y-6">
      
      {/* Welcome Message */}
      {messages.length === 1 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Clinical Research Assistant</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            I'm here to help you understand clinical trials and research participation. 
            Ask me anything or choose from the quick questions on the right.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
          
          {/* Bot Message */}
          {msg.sender !== "user" && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100 p-4">
                <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                {msg.time && (
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User Message */}
          {msg.sender === "user" && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl rounded-tr-md shadow-sm p-4">
                <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                {msg.time && (
                  <div className="text-xs text-blue-100 mt-2">
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default ChatBox;
