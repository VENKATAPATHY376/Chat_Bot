import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

// Dashboard Component with real data
const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        totalUsers: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [slotsRes, usersRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/booking-slots`),
                    fetch(`${API_BASE_URL}/users`)
                ]);
                
                const slots = await slotsRes.json();
                const users = await usersRes.json();
                
                setStats({
                    totalSlots: slots.length,
                    availableSlots: slots.filter(slot => slot.isAvailable).length,
                    bookedSlots: slots.filter(slot => !slot.isAvailable).length,
                    totalUsers: users.length
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Clinical Research Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live Updates</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Total Slots</h2>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalSlots}</p>
                    <p className="text-gray-600 mt-2">All booking slots</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Available Slots</h2>
                    <p className="text-3xl font-bold text-green-600">{stats.availableSlots}</p>
                    <p className="text-gray-600 mt-2">Ready for booking</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Booked Trials</h2>
                    <p className="text-3xl font-bold text-purple-600">{stats.bookedSlots}</p>
                    <p className="text-gray-600 mt-2">Confirmed appointments</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">Total Users</h2>
                    <p className="text-3xl font-bold text-orange-600">{stats.totalUsers}</p>
                    <p className="text-gray-600 mt-2">Registered participants</p>
                </div>
            </div>
        </div>
    );
};

// Separated Trial List Component
const TrialsList = () => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/available-slots`);
            if (!response.ok) {
                throw new Error('Failed to fetch available slots');
            }
            const slots = await response.json();
            setAvailableSlots(slots);
            setError(null);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            setError('Failed to load available trials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableSlots();
        const interval = setInterval(fetchAvailableSlots, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading available trials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Available Trials</h1>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live Updates</span>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-green-50">
                    <h2 className="text-xl font-semibold text-green-800">Available Trial Slots</h2>
                    <p className="text-green-600">Open for new participant bookings</p>
                </div>
                
                <div className="p-6">
                    {availableSlots.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a4 4 0 118 0v4m-4 6l-2 4h4l-2-4z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No available trial slots</p>
                            <p className="text-gray-400">All slots are currently booked</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {availableSlots.map(slot => (
                                <div key={slot.id} className="border border-green-200 rounded-lg p-4 hover:bg-green-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                            Available
                                        </span>
                                        <span className="text-gray-500 text-sm">
                                            ID: {slot.id}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-700">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6l-2 4h4l-2-4z" />
                                            </svg>
                                            <span className="font-medium">{slot.date}</span>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-700">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">{slot.time}</span>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <h3 className="font-semibold text-gray-800 mb-1">{slot.trialName}</h3>
                                            <p className="text-gray-600 text-sm">Contact: {slot.contactInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Booked Trials Component
const BookedTrials = () => {
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookedSlots = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/booking-slots`);
            if (!response.ok) {
                throw new Error('Failed to fetch booked slots');
            }
            const allSlots = await response.json();
            const booked = allSlots.filter(slot => !slot.isAvailable);
            setBookedSlots(booked);
            setError(null);
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            setError('Failed to load booked trials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookedSlots();
        const interval = setInterval(fetchBookedSlots, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading booked trials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Booked Trials</h1>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live Updates</span>
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-purple-50">
                    <h2 className="text-xl font-semibold text-purple-800">Confirmed Appointments</h2>
                    <p className="text-purple-600">Participants with scheduled trial appointments</p>
                </div>
                
                <div className="p-6">
                    {bookedSlots.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No booked appointments</p>
                            <p className="text-gray-400">All trials are still available for booking</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookedSlots.map(slot => (
                                <div key={slot.id} className="border border-purple-200 rounded-lg p-6 hover:bg-purple-50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                                Booked
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                Slot ID: {slot.id}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                Booked: {new Date().toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Trial Information */}
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-gray-800 text-lg border-b border-gray-200 pb-2">
                                                Trial Information
                                            </h3>
                                            
                                            <div className="flex items-center text-gray-700">
                                                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6l-2 4h4l-2-4z" />
                                                </svg>
                                                <span className="font-medium">{slot.date}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-700">
                                                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">{slot.time}</span>
                                            </div>
                                            
                                            <div className="mt-2">
                                                <p className="font-semibold text-purple-800">{slot.trialName}</p>
                                                <p className="text-gray-600 text-sm mt-1">Contact: {slot.contactInfo}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Patient Information */}
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-gray-800 text-lg border-b border-gray-200 pb-2">
                                                Patient Information
                                            </h3>
                                            
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="space-y-2">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="font-semibold text-gray-700">{slot.patientName}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-gray-600">{slot.patientEmail}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        <span className="text-gray-600">{slot.patientPhone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Users Component (unchanged)
const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const usersData = await response.json();
            setUsers(usersData);
            setError(null);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">User Analytics</h1>
            
            {users.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{user.name}</h3>
                                    <p className="text-gray-600">{user.email}</p>
                                    <p className="text-gray-500 text-sm">
                                        Last active: {new Date(user.lastActive).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {user.bookings?.length || 0} bookings
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {user.trialsParticipated} trials participated
                                    </p>
                                </div>
                            </div>
                            
                            {user.chatHistory && user.chatHistory.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Recent Chat History:</h4>
                                    <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                                        {user.chatHistory.slice(-3).map(chat => (
                                            <div key={chat.id} className="mb-3 last:mb-0">
                                                <p className="font-medium text-sm text-blue-800">Q: {chat.question}</p>
                                                <p className="text-gray-600 text-sm">A: {chat.answer}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(chat.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// FAQ Analytics Component (unchanged)
const FAQAnalytics = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/frequent-questions`);
                if (!response.ok) {
                    throw new Error('Failed to fetch FAQ data');
                }
                const questionsData = await response.json();
                setQuestions(questionsData);
                setError(null);
            } catch (error) {
                console.error('Error fetching FAQ data:', error);
                setError('Failed to load FAQ data');
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
        const interval = setInterval(fetchQuestions, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading FAQ analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h1>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Most Asked Questions</h2>
                    <p className="text-gray-600">Sorted by frequency</p>
                </div>
                
                <div className="p-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No FAQ data available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((faq, index) => (
                                <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                            #{index + 1}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-blue-600">{faq.frequency}</span>
                                            <span className="text-sm text-gray-600 ml-1">times asked</span>
                                            <div>
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                    {faq.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main App Component with updated navigation
function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Clinical Research Admin
                                </h1>
                            </div>
                            <div className="flex space-x-4">
                                <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded">
                                    Dashboard
                                </a>
                                <a href="/trials" className="text-gray-700 hover:text-green-600 font-medium transition-colors px-3 py-2 rounded">
                                    Available Trials
                                </a>
                                <a href="/booked" className="text-gray-700 hover:text-purple-600 font-medium transition-colors px-3 py-2 rounded">
                                    Booked Trials
                                </a>
                                <a href="/users" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded">
                                    Users
                                </a>
                                <a href="/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded">
                                    FAQ Analytics
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <main>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/trials" element={<TrialsList />} />
                        <Route path="/booked" element={<BookedTrials />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/faq" element={<FAQAnalytics />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;