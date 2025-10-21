import { useState, useCallback } from 'react';
import bookingIntegration from '../services/bookingIntegration.js';

export const useBookingIntegration = () => {
    const [isInBookingFlow, setIsInBookingFlow] = useState(false);

    const processMessage = useCallback(async (userMessage) => {
        const response = await bookingIntegration.processMessage(userMessage);
        setIsInBookingFlow(bookingIntegration.isInBookingFlow());
        return response;
    }, []);

    const resetBooking = useCallback(() => {
        bookingIntegration.resetBooking();
        setIsInBookingFlow(false);
    }, []);

    return {
        processMessage,
        resetBooking,
        isInBookingFlow,
        getCurrentStep: () => bookingIntegration.getCurrentStep()
    };
};