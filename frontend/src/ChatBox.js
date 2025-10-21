import React, { useState, useEffect, useRef } from "react";

// RASA API configuration
const RASA_API_URL = 'http://localhost:5005/webhooks/rest/webhook';
const ADMIN_API_URL = 'http://localhost:3001/api';

// Booking Integration Class (keeping the same - no changes needed)
class BookingIntegration {
    constructor() {
        this.bookingState = {
            isActive: false,
            step: null,
            selectedSlot: null,
            userInfo: {},
            availableSlots: []
        };
        this.bookingKeywords = [
            'book', 'appointment', 'schedule', 'reserve', 'slot',
            'sign up', 'register', 'enroll', 'join trial', 'participate',
            'booking', 'appointment booking', 'schedule appointment'
        ];
    }

    // Check if message is booking-related
    isBookingMessage(message) {
        const lowerMessage = message.toLowerCase();
        return this.bookingKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    // Start booking process
    async startBooking() {
        try {
            const response = await fetch(`${ADMIN_API_URL}/available-slots`);
            if (!response.ok) {
                throw new Error('Failed to fetch available slots');
            }
            
            const slots = await response.json();

            if (!slots || slots.length === 0) {
                return {
                    text: "I'm sorry, there are no available appointment slots at the moment. Please contact our research team directly.",
                    source: 'booking'
                };
            }

            this.bookingState = {
                isActive: true,
                step: 'SELECT_SLOT',
                availableSlots: slots,
                selectedSlot: null,
                userInfo: {}
            };

            let message = "Great! I can help you book an appointment for our clinical trial. 📅\n\n";
            message += "Here are the available time slots:\n\n";
            
            slots.forEach((slot, index) => {
                const date = new Date(slot.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                });
                message += `${index + 1}. ${date} at ${slot.time}\n`;
                message += `   Trial: ${slot.trialName}\n\n`;
            });
            
            message += `Please reply with the number of your preferred slot (1-${slots.length}):`;
            
            return {
                text: message,
                source: 'booking'
            };

        } catch (error) {
            console.error('Error fetching slots:', error);
            return {
                text: "I'm having trouble accessing our booking system. Please try again later.",
                source: 'booking'
            };
        }
    }

    // Handle booking flow steps
    async handleBookingFlow(userMessage) {
        switch (this.bookingState.step) {
            case 'SELECT_SLOT':
                return this.selectSlot(userMessage);
            case 'GET_NAME':
                return this.getName(userMessage);
            case 'GET_EMAIL':
                return this.getEmail(userMessage);
            case 'GET_PHONE':
                return this.getPhone(userMessage);
            case 'CONFIRM':
                return await this.confirmBooking(userMessage);
            default:
                this.resetBooking();
                return {
                    text: "Something went wrong with the booking. How else can I help you?",
                    source: 'booking'
                };
        }
    }

    // Select slot
    selectSlot(userMessage) {
        const slotIndex = parseInt(userMessage.trim()) - 1;
        const slots = this.bookingState.availableSlots;

        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= slots.length) {
            return {
                text: `Please enter a number between 1 and ${slots.length} to select your time slot.`,
                source: 'booking'
            };
        }

        this.bookingState.selectedSlot = slots[slotIndex];
        this.bookingState.step = 'GET_NAME';

        const slot = slots[slotIndex];
        const date = new Date(slot.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        return {
            text: `Perfect! You selected:\n📅 ${date} at ${slot.time}\n🔬 ${slot.trialName}\n\nTo complete your booking, please provide your full name:`,
            source: 'booking'
        };
    }

    // Get name
    getName(userMessage) {
        const name = userMessage.trim();
        
        if (name.length < 2) {
            return {
                text: "Please provide your full name.",
                source: 'booking'
            };
        }

        this.bookingState.userInfo.name = name;
        this.bookingState.step = 'GET_EMAIL';

        return {
            text: `Thank you, ${name}! 👋\n\nPlease provide your email address:`,
            source: 'booking'
        };
    }

    // Get email
    getEmail(userMessage) {
        const email = userMessage.trim().toLowerCase();
        
        if (!this.isValidEmail(email)) {
            return {
                text: "Please provide a valid email address (e.g., john@example.com).",
                source: 'booking'
            };
        }

        this.bookingState.userInfo.email = email;
        this.bookingState.step = 'GET_PHONE';

        return {
            text: `Great! 📧\n\nLastly, please provide your phone number:`,
            source: 'booking'
        };
    }

    // Get phone
    getPhone(userMessage) {
        const phone = userMessage.trim();
        
        if (!this.isValidPhone(phone)) {
            return {
                text: "Please provide a valid phone number.",
                source: 'booking'
            };
        }

        this.bookingState.userInfo.phone = phone;
        this.bookingState.step = 'CONFIRM';

        const slot = this.bookingState.selectedSlot;
        const info = this.bookingState.userInfo;
        const date = new Date(slot.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });

        return {
            text: `Perfect! Please confirm your booking:\n\n` +
                  `👤 Name: ${info.name}\n` +
                  `📧 Email: ${info.email}\n` +
                  `📱 Phone: ${phone}\n\n` +
                  `📅 Date: ${date}\n` +
                  `🕐 Time: ${slot.time}\n` +
                  `🔬 Trial: ${slot.trialName}\n\n` +
                  `Type "YES" to confirm or "NO" to cancel.`,
            source: 'booking'
        };
    }

    // Confirm booking
    async confirmBooking(userMessage) {
        const response = userMessage.toLowerCase().trim();
        
        if (response === 'no' || response === 'cancel') {
            this.resetBooking();
            return {
                text: "Booking cancelled. Feel free to ask me anything else!",
                source: 'booking'
            };
        }
        
        if (response !== 'yes' && response !== 'confirm') {
            return {
                text: 'Please type "YES" to confirm your booking or "NO" to cancel.',
                source: 'booking'
            };
        }

        try {
            const bookingResponse = await fetch(`${ADMIN_API_URL}/book-slot/${this.bookingState.selectedSlot.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName: this.bookingState.userInfo.name,
                    patientEmail: this.bookingState.userInfo.email,
                    patientPhone: this.bookingState.userInfo.phone
                })
            });

            if (!bookingResponse.ok) {
                const error = await bookingResponse.json();
                throw new Error(error.error || 'Booking failed');
            }

            const result = await bookingResponse.json();
            this.resetBooking();
            
            const date = new Date(result.slot.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            return {
                text: `🎉 Booking Confirmed! 🎉\n\n` +
                      `Your appointment is scheduled:\n` +
                      `📅 ${date} at ${result.slot.time}\n` +
                      `🔬 ${result.slot.trialName}\n\n` +
                      `✅ Confirmation email will be sent shortly\n` +
                      `⏰ Please arrive 15 minutes early\n\n` +
                      `Is there anything else I can help you with?`,
                source: 'booking'
            };

        } catch (error) {
            this.resetBooking();
            return {
                text: `Sorry, booking failed: ${error.message}\nPlease try again or contact our team directly.`,
                source: 'booking'
            };
        }
    }

    // Reset booking state
    resetBooking() {
        this.bookingState = {
            isActive: false,
            step: null,
            selectedSlot: null,
            userInfo: {},
            availableSlots: []
        };
    }

    // Utility functions
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone);
    }

    // Public methods
    isInBookingFlow() {
        return this.bookingState.isActive;
    }

    getCurrentStep() {
        return this.bookingState.step;
    }

    cancelBooking() {
        this.resetBooking();
        return {
            text: "Booking cancelled. What else can I help you with?",
            source: 'booking'
        };
    }

    // Main processing method
    async processMessage(userMessage) {
        // If in booking flow, handle booking
        if (this.bookingState.isActive) {
            return await this.handleBookingFlow(userMessage);
        }

        // If new booking request, start booking
        if (this.isBookingMessage(userMessage)) {
            return await this.startBooking();
        }

        // Not a booking message, return null to let RASA handle
        return null;
    }
}

// Create booking integration instance
const bookingIntegration = new BookingIntegration();

// RASA API call function
const callRasaAPI = async (message, sender = 'user') => {
    try {
        const response = await fetch(RASA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sender: sender,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error('RASA server error');
        }

        const rasaResponses = await response.json();
        
        if (rasaResponses && rasaResponses.length > 0) {
            // Combine multiple RASA responses
            const combinedText = rasaResponses
                .map(resp => resp.text || resp.message || '')
                .filter(text => text.length > 0)
                .join('\n\n');

            return {
                text: combinedText || "I'm not sure how to help with that. Could you try rephrasing?",
                source: 'rasa'
            };
        } else {
            return {
                text: "I'm not sure how to help with that. Could you try asking in a different way?",
                source: 'rasa'
            };
        }

    } catch (error) {
        console.error('RASA API error:', error);
        return {
            text: "I'm having trouble understanding that right now. Could you try asking something else?",
            source: 'fallback'
        };
    }
};

// Main message processing function
const processMessage = async (userMessage) => {
    // First, try booking integration
    const bookingResponse = await bookingIntegration.processMessage(userMessage);
    
    if (bookingResponse) {
        return bookingResponse;
    }
    
    // If not booking, use RASA
    return await callRasaAPI(userMessage);
};

// FIXED ChatBox Component - Completely Static Message Area
function ChatBox({ messages, isTyping }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="h-full flex flex-col">
      {/* FIXED Messages Container - Static, no movement */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 space-y-6 min-h-full">
          
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
                Ask me anything or say "book appointment" to schedule a trial visit.
              </p>
            </div>
          )}

          {/* Messages - Static positioning */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              
              {/* Bot Message */}
              {msg.sender !== "user" && (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.source === 'admin_dashboard' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                        : msg.source === 'rasa'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700'
                    }`}>
                      {msg.source === 'admin_dashboard' ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8H5m0 8h2m6-10V7a2 2 0 00-2-2H9a2 2 0 00-2 2v0m6 0a2 2 0 00-2-2H9a2 2 0 00-2 2v0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0V7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-100 p-4">
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>
                    {msg.source && (
                      <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                        msg.source === 'admin_dashboard' 
                          ? 'bg-green-100 text-green-700'
                          : msg.source === 'rasa'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {msg.source === 'admin_dashboard' ? '🏥 Admin Dashboard' : 
                         msg.source === 'rasa' ? '🤖 RASA Assistant' : '💬 System'}
                      </div>
                    )}
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
                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>
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

          {/* Typing Indicator - Fixed position */}
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
          
          {/* Invisible div for auto-scroll - stays at bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatBox;

// Export the booking integration and utility functions for use in other components
export { 
    bookingIntegration, 
    processMessage, 
    callRasaAPI,
    ADMIN_API_URL,
    RASA_API_URL
};
