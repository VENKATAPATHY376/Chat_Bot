const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage (replace with database in production)
let bookingSlots = [
    {
        id: '1',
        date: '2024-01-25',
        time: '10:00 AM',
        isAvailable: true,
        status: 'available',
        trialName: 'COVID-19 Vaccine Trial',
        contactInfo: 'contact@research.com',
        patientName: '',
        patientEmail: '',
        patientPhone: ''
    },
    {
        id: '2',
        date: '2024-01-25',
        time: '2:00 PM',
        isAvailable: true,
        status: 'available',
        trialName: 'Flu Vaccine Study',
        contactInfo: 'contact@research.com',
        patientName: '',
        patientEmail: '',
        patientPhone: ''
    },
    {
        id: '3',
        date: '2024-01-26',
        time: '9:00 AM',
        isAvailable: false,
        status: 'booked',
        trialName: 'COVID-19 Vaccine Trial',
        contactInfo: 'contact@research.com',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        patientPhone: '+1234567890'
    },
    {
        id: '4',
        date: '2024-01-26',
        time: '11:00 AM',
        isAvailable: true,
        status: 'available',
        trialName: 'Flu Vaccine Study',
        contactInfo: 'contact@research.com',
        patientName: '',
        patientEmail: '',
        patientPhone: ''
    }
];

let users = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'participant',
        lastActive: new Date().toISOString(),
        trialsParticipated: 1,
        bookings: ['3'],
        chatHistory: [
            {
                id: 'chat1',
                question: 'What are the side effects?',
                answer: 'Common side effects include mild pain at injection site and low-grade fever.',
                timestamp: new Date().toISOString()
            }
        ]
    },
    {
        id: '2',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1234567891',
        role: 'participant',
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        trialsParticipated: 2,
        bookings: [],
        chatHistory: []
    }
];

let frequentQuestions = [
    {
        id: '1',
        question: 'What are the side effects of the vaccine?',
        answer: 'Common side effects include mild pain at injection site, fatigue, and low-grade fever. These typically resolve within 24-48 hours.',
        category: 'Safety',
        frequency: 45
    },
    {
        id: '2',
        question: 'How long does the trial last?',
        answer: 'Most vaccine trials last 6-12 months, with follow-up visits scheduled at regular intervals.',
        category: 'Duration',
        frequency: 38
    },
    {
        id: '3',
        question: 'Am I eligible for the trial?',
        answer: 'Eligibility depends on age, health status, and previous vaccinations. Please check with our team for specific criteria.',
        category: 'Eligibility',
        frequency: 52
    },
    {
        id: '4',
        question: 'Can I cancel my appointment?',
        answer: 'Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time.',
        category: 'Booking',
        frequency: 29
    },
    {
        id: '5',
        question: 'Is the trial free?',
        answer: 'Yes, participation in clinical trials is free. You may also receive compensation for your time and travel.',
        category: 'Cost',
        frequency: 33
    }
];

// Helper function to find user by email
const findUserByEmail = (email) => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Booking Slots
app.get('/api/booking-slots', (req, res) => {
    try {
        res.json(bookingSlots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking slots' });
    }
});

app.get('/api/available-slots', (req, res) => {
    try {
        const availableSlots = bookingSlots.filter(slot => slot.isAvailable);
        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch available slots' });
    }
});

app.post('/api/booking-slots', (req, res) => {
    try {
        const newSlot = {
            id: uuidv4(),
            ...req.body,
            isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
            status: req.body.status || 'available'
        };
        bookingSlots.push(newSlot);
        res.status(201).json(newSlot);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking slot' });
    }
});

// Book a slot
app.post('/api/book-slot/:slotId', (req, res) => {
    try {
        const { slotId } = req.params;
        const { patientName, patientEmail, patientPhone } = req.body;

        if (!patientName || !patientEmail || !patientPhone) {
            return res.status(400).json({ 
                error: 'Patient name, email, and phone are required' 
            });
        }

        const slotIndex = bookingSlots.findIndex(slot => slot.id === slotId);
        
        if (slotIndex === -1) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        if (!bookingSlots[slotIndex].isAvailable) {
            return res.status(400).json({ error: 'Slot is not available' });
        }

        // Update the slot
        bookingSlots[slotIndex] = {
            ...bookingSlots[slotIndex],
            isAvailable: false,
            status: 'booked',
            patientName,
            patientEmail,
            patientPhone
        };

        // Update or create user
        let user = findUserByEmail(patientEmail);
        if (!user) {
            user = {
                id: uuidv4(),
                name: patientName,
                email: patientEmail,
                phone: patientPhone,
                role: 'participant',
                lastActive: new Date().toISOString(),
                trialsParticipated: 0,
                bookings: [slotId],
                chatHistory: []
            };
            users.push(user);
        } else {
            user.bookings.push(slotId);
            user.lastActive = new Date().toISOString();
        }

        res.json({
            message: 'Slot booked successfully',
            slot: bookingSlots[slotIndex],
            user: user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to book slot' });
    }
});

// Users
app.get('/api/users', (req, res) => {
    try {
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/user-by-email/:email', (req, res) => {
    try {
        const { email } = req.params;
        const user = findUserByEmail(email);
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users/:userId/chat', (req, res) => {
    try {
        const { userId } = req.params;
        const { question, answer, timestamp } = req.body;

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chatEntry = {
            id: uuidv4(),
            question: question || '',
            answer: answer || '',
            timestamp: timestamp || new Date().toISOString()
        };

        user.chatHistory.push(chatEntry);
        user.lastActive = new Date().toISOString();

        res.json({ message: 'Chat history updated', user, chatEntry });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update chat history' });
    }
});

// Frequent Questions
app.get('/api/frequent-questions', (req, res) => {
    try {
        const sortedQuestions = [...frequentQuestions].sort((a, b) => b.frequency - a.frequency);
        res.json(sortedQuestions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch frequent questions' });
    }
});

app.post('/api/frequent-questions/:questionId/increment', (req, res) => {
    try {
        const { questionId } = req.params;
        const question = frequentQuestions.find(q => q.id === questionId);
        
        if (question) {
            question.frequency += 1;
            res.json({ message: 'Question frequency updated', question });
        } else {
            res.status(404).json({ error: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update question frequency' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:3000`);
});

module.exports = app;