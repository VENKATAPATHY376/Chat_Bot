import React, { useEffect, useState } from 'react';
import { fetchBookingSlots, createBookingSlot } from '../services/api';

const BookingsPage = () => {
    const [bookingSlots, setBookingSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBookingSlots = async () => {
            try {
                setLoading(true);
                const slots = await fetchBookingSlots();
                setBookingSlots(slots);
            } catch (err) {
                setError('Failed to load booking slots');
                console.error('Error loading booking slots:', err);
            } finally {
                setLoading(false);
            }
        };

        loadBookingSlots();
    }, []);

    const handleCreateSlot = async () => {
        try {
            const newSlot = {
                date: new Date().toISOString().split('T')[0],
                time: '10:00 AM',
                isAvailable: true,
                status: 'available',
                trialName: 'New Trial',
                contactInfo: 'contact@example.com',
                patientName: ''
            };
            
            const createdSlot = await createBookingSlot(newSlot);
            setBookingSlots([...bookingSlots, createdSlot]);
        } catch (err) {
            setError('Failed to create booking slot');
            console.error('Error creating booking slot:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Loading booking slots...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Booking Slots</h1>
                <button 
                    onClick={handleCreateSlot}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Create New Slot
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Available Slots</h2>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                    {bookingSlots.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>No booking slots available</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {bookingSlots.map(slot => (
                                <div key={slot.id} style={{
                                    padding: '1rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>Date:</strong> {slot.date}
                                    </div>
                                    <div>
                                        <strong>Time:</strong> {slot.time}
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            backgroundColor: slot.isAvailable ? '#dcfce7' : '#fee2e2',
                                            color: slot.isAvailable ? '#16a34a' : '#dc2626'
                                        }}>
                                            {slot.isAvailable ? 'Available' : 'Booked'}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Trial:</strong> {slot.trialName}
                                    </div>
                                    {slot.patientName && (
                                        <div>
                                            <strong>Patient:</strong> {slot.patientName}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;