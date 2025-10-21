class RasaBookingMiddleware {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.rasaUrl = 'http://localhost:5005'; // Your RASA server URL
        this.bookingState = {
            isActive: false,
            step: null,
            selectedSlot: null,
            userInfo: {},
            availableSlots: []
        };
        this.bookingKeywords = [
            'book', 'appointment', 'schedule', 'reserve', 'slot',
            'sign up', 'register', 'enroll', 'join trial', 'participate'
        ];
        this.init();
    }

    async init() {
        try {
            // Test admin dashboard connection
            await fetch(`${this.apiUrl}/health`);
            console.log('✅ Admin dashboard connected');
        } catch (error) {
            console.log('⚠️ Admin dashboard not available');
        }
    }

    // Main middleware function - routes to RASA or booking system
    async processMessage(userMessage, sender = 'user') {
        const message = userMessage.toLowerCase().trim();

        // If we're in an active booking flow, handle booking
        if (this.bookingState.isActive) {
            return await this.handleBookingFlow(userMessage);
        }

        // Check if this is a booking-related message
        if (this.isBookingMessage(message)) {
            return await this.handleBookingMessage(userMessage);
        }

        // For all other messages, use RASA
        return await this.callRasa(userMessage, sender);
    }

    // Check if message is booking-related
    isBookingMessage(message) {
        return this.bookingKeywords.some(keyword => message.includes(keyword));
    }

    // Handle booking-specific messages
    async handleBookingMessage(userMessage) {
        const message = userMessage.toLowerCase().trim();

        // Start booking process
        if (this.bookingKeywords.some(keyword => message.includes(keyword))) {
            return await this.startBooking();
        }

        // If not a clear booking intent, let RASA handle it
        return await this.callRasa(userMessage);
    }

    // Start booking process
    async startBooking() {
        try {
            const response = await fetch(`${this.apiUrl}/available-slots`);
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
            return {
                text: "I'm having trouble accessing our booking system. Let me help you with other questions instead.",
                source: 'booking'
            };
        }
    }

    // Handle booking flow steps
    async handleBookingFlow(userMessage) {
        switch (this.bookingState.step) {
            case 'SELECT_SLOT':
                return await this.selectSlot(userMessage);
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
                    text: "Something went wrong with the booking. Let me help you with other questions.",
                    source: 'booking'
                };
        }
    }

    // Select slot
    async selectSlot(userMessage) {
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
            const bookingResponse = await fetch(`${this.apiUrl}/book-slot/${this.bookingState.selectedSlot.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientName: this.bookingState.userInfo.name,
                    patientEmail: this.bookingState.userInfo.email,
                    patientPhone: this.bookingState.userInfo.phone
                })
            });

            const result = await bookingResponse.json();
            
            if (!bookingResponse.ok) {
                throw new Error(result.error || 'Booking failed');
            }

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
                text: `Sorry, booking failed: ${error.message}\nIs there anything else I can help you with?`,
                source: 'booking'
            };
        }
    }

    // Call RASA for non-booking messages
    async callRasa(userMessage, sender = 'user') {
        try {
            const response = await fetch(`${this.rasaUrl}/webhooks/rest/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: sender,
                    message: userMessage
                })
            });

            if (!response.ok) {
                throw new Error('RASA server error');
            }

            const rasaResponses = await response.json();
            
            // Handle RASA response format
            if (rasaResponses && rasaResponses.length > 0) {
                // Combine multiple RASA responses if any
                const combinedText = rasaResponses
                    .map(resp => resp.text || resp.message || '')
                    .filter(text => text.length > 0)
                    .join('\n\n');

                return {
                    text: combinedText || "I understand you're asking something, but I'm not sure how to help with that. Could you try rephrasing?",
                    source: 'rasa',
                    rasaData: rasaResponses
                };
            } else {
                return {
                    text: "I'm not sure how to help with that. Could you try asking in a different way?",
                    source: 'rasa'
                };
            }

        } catch (error) {
            console.error('RASA error:', error);
            // Fallback response when RASA is unavailable
            return {
                text: "I'm having trouble understanding that right now. Could you try asking something else?",
                source: 'fallback'
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

    // Cancel booking and return to RASA
    cancelBooking() {
        this.resetBooking();
        return {
            text: "Booking cancelled. What else can I help you with?",
            source: 'booking'
        };
    }
}

export default new RasaBookingMiddleware();