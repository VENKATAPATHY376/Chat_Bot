class BookingIntegration {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.bookingState = {
            isActive: false,
            step: null,
            selectedSlot: null,
            userInfo: {},
            availableSlots: []
        };
        this.faqs = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Test connection to admin dashboard
            const healthResponse = await fetch(`${this.apiUrl}/health`);
            if (healthResponse.ok) {
                console.log('✅ Connected to admin dashboard');
                // Load initial data
                await this.loadFAQs();
                await this.loadAvailableSlots();
            }
        } catch (error) {
            console.log('⚠️ Admin dashboard not available, booking disabled');
        }
    }

    async loadFAQs() {
        try {
            const response = await fetch(`${this.apiUrl}/frequent-questions`);
            if (response.ok) {
                this.faqs = await response.json();
                console.log('✅ FAQs loaded:', this.faqs.length);
            }
        } catch (error) {
            console.error('Could not load FAQs:', error);
        }
    }

    async loadAvailableSlots() {
        try {
            const response = await fetch(`${this.apiUrl}/available-slots`);
            if (response.ok) {
                const slots = await response.json();
                console.log('✅ Available slots loaded:', slots.length);
                return slots;
            }
        } catch (error) {
            console.error('Could not load available slots:', error);
            return [];
        }
    }

    // Main function to process messages
    async processMessage(userMessage) {
        const message = userMessage.toLowerCase().trim();

        // Handle active booking flow
        if (this.bookingState.isActive) {
            return await this.handleBookingFlow(userMessage);
        }

        // Check for booking intent
        if (this.isBookingRequest(message)) {
            return await this.startBooking();
        }

        // Check for trial information requests
        if (this.isTrialInfoRequest(message)) {
            return await this.showTrialInformation();
        }

        // Handle FAQ matching and tracking
        const faqResponse = await this.handleFAQ(userMessage);
        if (faqResponse) {
            return faqResponse;
        }

        // Check for availability inquiry
        if (this.isAvailabilityInquiry(message)) {
            return await this.showAvailability();
        }

        // Return null if no booking/FAQ match - let existing chatbot handle it
        return null;
    }

    // Check if user wants to book
    isBookingRequest(message) {
        const bookingKeywords = [
            'book', 'appointment', 'schedule', 'reserve', 'slot',
            'sign up', 'register', 'enroll', 'join trial', 'participate',
            'book appointment', 'schedule appointment', 'make appointment'
        ];
        return bookingKeywords.some(keyword => message.includes(keyword));
    }

    // Check if user wants trial information
    isTrialInfoRequest(message) {
        const infoKeywords = [
            'trial', 'study', 'research', 'available trials', 'what trials',
            'trial information', 'study information', 'research studies'
        ];
        return infoKeywords.some(keyword => message.includes(keyword));
    }

    // Check if user wants to see availability
    isAvailabilityInquiry(message) {
        const availabilityKeywords = [
            'available', 'when', 'time', 'date', 'slot', 'availability',
            'available times', 'available dates', 'open slots'
        ];
        return availabilityKeywords.some(keyword => message.includes(keyword));
    }

    // Show available trials information
    async showTrialInformation() {
        try {
            const slots = await this.loadAvailableSlots();
            
            if (!slots || slots.length === 0) {
                return "Currently, there are no clinical trials available for new participants. Please contact our research team for more information or check back later.";
            }

            // Group trials by name to avoid duplicates
            const uniqueTrials = {};
            slots.forEach(slot => {
                if (!uniqueTrials[slot.trialName]) {
                    uniqueTrials[slot.trialName] = {
                        name: slot.trialName,
                        contact: slot.contactInfo,
                        availableSlots: []
                    };
                }
                uniqueTrials[slot.trialName].availableSlots.push({
                    date: slot.date,
                    time: slot.time,
                    id: slot.id
                });
            });

            let response = "Here are our current clinical trials with available appointments:\n\n";
            
            Object.values(uniqueTrials).forEach((trial, index) => {
                response += `${index + 1}. **${trial.name}**\n`;
                response += `   Available slots: ${trial.availableSlots.length}\n`;
                response += `   Contact: ${trial.contact}\n\n`;
            });

            response += "Would you like to book an appointment for any of these trials? Just say 'book appointment' and I'll help you schedule!";
            
            return response;

        } catch (error) {
            return "I'm having trouble accessing trial information right now. Please try again later or contact our research team directly.";
        }
    }

    // Show availability without booking
    async showAvailability() {
        try {
            const slots = await this.loadAvailableSlots();
            
            if (!slots || slots.length === 0) {
                return "There are currently no available appointment slots. Please contact our research team or check back later.";
            }

            let response = `We have ${slots.length} available appointment slot${slots.length > 1 ? 's' : ''} for clinical trials:\n\n`;
            
            // Show next 5 available slots
            const slotsToShow = slots.slice(0, 5);
            slotsToShow.forEach((slot, index) => {
                const date = this.formatDate(slot.date);
                response += `${index + 1}. ${date} at ${slot.time}\n`;
                response += `   Trial: ${slot.trialName}\n\n`;
            });

            if (slots.length > 5) {
                response += `... and ${slots.length - 5} more slots available.\n\n`;
            }

            response += "To book any of these appointments, just say 'book appointment' and I'll guide you through the process!";
            
            return response;

        } catch (error) {
            return "I'm having trouble checking availability right now. Please try again later.";
        }
    }

    // Start booking process with real-time data
    async startBooking() {
        try {
            // Get fresh available slots from admin dashboard
            const slots = await this.loadAvailableSlots();

            if (!slots || slots.length === 0) {
                return "I'm sorry, there are no available appointment slots at the moment. Our research team will add new slots soon. Please check back later or contact us directly.";
            }

            this.bookingState = {
                isActive: true,
                step: 'SELECT_SLOT',
                availableSlots: slots,
                selectedSlot: null,
                userInfo: {}
            };

            let message = "Great! I can help you book an appointment for our clinical trial. 📅\n\n";
            message += "Here are the currently available time slots:\n\n";
            
            slots.forEach((slot, index) => {
                const date = this.formatDate(slot.date);
                message += `${index + 1}. **${date} at ${slot.time}**\n`;
                message += `   🔬 ${slot.trialName}\n`;
                message += `   📞 Contact: ${slot.contactInfo}\n\n`;
            });
            
            message += `Please reply with the number of your preferred slot (1-${slots.length}):`;
            return message;

        } catch (error) {
            return "I'm having trouble accessing our booking system right now. Please try again later or contact our research team directly.";
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
                return "Something went wrong with the booking process. Let's start over. Would you like to book an appointment?";
        }
    }

    // Select time slot with validation
    async selectSlot(userMessage) {
        const slotIndex = parseInt(userMessage.trim()) - 1;
        
        // Re-fetch available slots to ensure they're still available
        const currentSlots = await this.loadAvailableSlots();
        
        if (!currentSlots || currentSlots.length === 0) {
            this.resetBooking();
            return "Sorry, all slots have been booked while we were talking. Please start a new booking to see current availability.";
        }

        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= currentSlots.length) {
            return `Please enter a valid number between 1 and ${currentSlots.length} to select your time slot.`;
        }

        // Check if the selected slot is still available
        const originalSlot = this.bookingState.availableSlots[slotIndex];
        const stillAvailable = currentSlots.find(slot => slot.id === originalSlot.id);
        
        if (!stillAvailable) {
            this.bookingState.availableSlots = currentSlots;
            return "Sorry, that slot was just booked by someone else. Here are the currently available slots:\n\n" + 
                   this.formatAvailableSlots(currentSlots) + 
                   `\nPlease select a new slot (1-${currentSlots.length}):`;
        }

        this.bookingState.selectedSlot = stillAvailable;
        this.bookingState.step = 'GET_NAME';

        const date = this.formatDate(stillAvailable.date);
        return `Perfect! You selected:\n📅 **${date} at ${stillAvailable.time}**\n🔬 ${stillAvailable.trialName}\n\nTo complete your booking, please provide your full name:`;
    }

    // Format available slots for display
    formatAvailableSlots(slots) {
        return slots.map((slot, index) => {
            const date = this.formatDate(slot.date);
            return `${index + 1}. ${date} at ${slot.time} - ${slot.trialName}`;
        }).join('\n');
    }

    // Get user name
    getName(userMessage) {
        const name = userMessage.trim();
        
        if (name.length < 2 || !/^[a-zA-Z\s]+$/.test(name)) {
            return "Please provide a valid full name (letters and spaces only).";
        }

        this.bookingState.userInfo.name = name;
        this.bookingState.step = 'GET_EMAIL';

        return `Thank you, ${name}! 👋\n\nPlease provide your email address:`;
    }

    // Get user email
    getEmail(userMessage) {
        const email = userMessage.trim().toLowerCase();
        
        if (!this.isValidEmail(email)) {
            return "Please provide a valid email address (e.g., john@example.com).";
        }

        this.bookingState.userInfo.email = email;
        this.bookingState.step = 'GET_PHONE';

        return `Great! 📧\n\nLastly, please provide your phone number:`;
    }

    // Get user phone
    getPhone(userMessage) {
        const phone = userMessage.trim();
        
        if (!this.isValidPhone(phone)) {
            return "Please provide a valid phone number (e.g., +1234567890 or (123) 456-7890).";
        }

        this.bookingState.userInfo.phone = phone;
        this.bookingState.step = 'CONFIRM';

        const slot = this.bookingState.selectedSlot;
        const info = this.bookingState.userInfo;
        const date = this.formatDate(slot.date);

        return `Perfect! Please confirm your booking details:\n\n` +
               `👤 **Name:** ${info.name}\n` +
               `📧 **Email:** ${info.email}\n` +
               `📱 **Phone:** ${phone}\n\n` +
               `📅 **Date:** ${date}\n` +
               `🕐 **Time:** ${slot.time}\n` +
               `🔬 **Trial:** ${slot.trialName}\n` +
               `📞 **Contact:** ${slot.contactInfo}\n\n` +
               `Type **"CONFIRM"** to book this appointment or **"CANCEL"** to start over.`;
    }

    // Confirm booking with admin dashboard
    async confirmBooking(userMessage) {
        const response = userMessage.toLowerCase().trim();
        
        if (response === 'cancel' || response === 'no') {
            this.resetBooking();
            return "Booking cancelled. Feel free to book again anytime by saying 'book appointment'!";
        }
        
        if (response !== 'confirm' && response !== 'yes') {
            return 'Please type **"CONFIRM"** to complete your booking or **"CANCEL"** to start over.';
        }

        try {
            // Double-check slot is still available
            const currentSlots = await this.loadAvailableSlots();
            const slotStillAvailable = currentSlots.find(slot => slot.id === this.bookingState.selectedSlot.id);
            
            if (!slotStillAvailable) {
                this.resetBooking();
                return "Sorry, this slot was just booked by someone else. Please start a new booking to see current availability.";
            }

            // Book the slot through admin dashboard API
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

            // Store user context for future interactions
            this.currentUser = result.user;

            // Log successful booking interaction
            if (this.currentUser) {
                await this.logChatInteraction(
                    'Appointment booking completed',
                    `Booked ${result.slot.date} at ${result.slot.time} for ${result.slot.trialName}`
                );
            }

            this.resetBooking();
            
            const date = this.formatDate(result.slot.date);

            return `🎉 **Booking Confirmed!** 🎉\n\n` +
                   `Your appointment has been successfully scheduled:\n\n` +
                   `📅 **Date:** ${date}\n` +
                   `🕐 **Time:** ${result.slot.time}\n` +
                   `🔬 **Trial:** ${result.slot.trialName}\n` +
                   `📞 **Contact:** ${result.slot.contactInfo}\n\n` +
                   `✅ **Confirmation email will be sent to ${result.user.email}**\n` +
                   `⏰ **Please arrive 15 minutes early**\n` +
                   `📋 **Bring a valid ID and any required documents**\n\n` +
                   `Your booking ID is: **${result.slot.id}**\n\n` +
                   `If you need to cancel or reschedule, please contact us at least 24 hours in advance.\n\n` +
                   `Is there anything else I can help you with?`;

        } catch (error) {
            this.resetBooking();
            return `Sorry, there was an error completing your booking: ${error.message}\n\nPlease try again or contact our research team directly.`;
        }
    }

    // Handle FAQ questions with tracking
    async handleFAQ(userMessage) {
        const matchedFAQ = this.findMatchingFAQ(userMessage);
        
        if (matchedFAQ) {
            // Track FAQ usage in admin dashboard
            try {
                await fetch(`${this.apiUrl}/frequent-questions/${matchedFAQ.id}/increment`, {
                    method: 'POST'
                });
            } catch (error) {
                // Silent fail - FAQ tracking is not critical
            }

            // Log interaction if user is identified
            if (this.currentUser) {
                await this.logChatInteraction(userMessage, matchedFAQ.answer);
            }
            
            return matchedFAQ.answer + "\n\nWould you like to book an appointment for our clinical trial?";
        }
        
        return null;
    }

    // Log chat interaction with admin dashboard
    async logChatInteraction(question, answer) {
        if (!this.currentUser) return;
        
        try {
            await fetch(`${this.apiUrl}/users/${this.currentUser.id}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    answer,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Error logging chat interaction:', error);
        }
    }

    // Find matching FAQ
    findMatchingFAQ(message) {
        const normalizedMessage = message.toLowerCase();
        
        return this.faqs.find(faq => {
            const question = faq.question.toLowerCase();
            const keywords = question.split(' ').filter(word => word.length > 3);
            return keywords.some(keyword => normalizedMessage.includes(keyword));
        });
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
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone);
    }

    // Public methods for integration
    isInBookingFlow() {
        return this.bookingState.isActive;
    }

    getCurrentStep() {
        return this.bookingState.step;
    }

    // Get user context
    getCurrentUser() {
        return this.currentUser;
    }

    // Set user context (if user provides email)
    async setUserContext(email) {
        try {
            const response = await fetch(`${this.apiUrl}/user-by-email/${encodeURIComponent(email)}`);
            if (response.ok) {
                this.currentUser = await response.json();
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error setting user context:', error);
        }
        return null;
    }
}

// Export singleton instance
const bookingIntegration = new BookingIntegration();
export default bookingIntegration;