import axios from 'axios';
import { VaccineTrial } from '../types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

// User Behavior API
export const fetchUserBehavior = async () => {
    const response = await axios.get(`${API_BASE_URL}/user-behavior`);
    return response.data;
};

// Booking Slots API
export const fetchBookingSlots = async () => {
    const response = await axios.get(`${API_BASE_URL}/booking-slots`);
    return response.data;
};

export const createBookingSlot = async (slotData: any) => {
    const response = await axios.post(`${API_BASE_URL}/booking-slots`, slotData);
    return response.data;
};

export const updateBookingSlot = async (slotId: string, slotData: any) => {
    const response = await axios.put(`${API_BASE_URL}/booking-slots/${slotId}`, slotData);
    return response.data;
};

// Vaccine Trials API
export const fetchVaccineTrials = async () => {
    const response = await axios.get(`${API_BASE_URL}/vaccine-trials`);
    return response.data;
};

export const updateVaccineTrial = async (trialId: string, trialData: Partial<VaccineTrial>) => {
    const response = await axios.put(`${API_BASE_URL}/vaccine-trials/${trialId}`, trialData);
    return response.data;
};