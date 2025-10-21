import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Booking Slots
export const fetchBookingSlots = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking-slots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking slots:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        date: '2024-01-15',
        time: '10:00 AM',
        isAvailable: true,
        status: 'available',
        trialName: 'COVID-19 Vaccine Trial',
        contactInfo: 'contact@example.com',
        patientName: 'John Doe'
      },
      {
        id: '2',
        date: '2024-01-16',
        time: '2:00 PM',
        isAvailable: false,
        status: 'booked',
        trialName: 'Flu Vaccine Trial',
        contactInfo: 'contact@example.com',
        patientName: 'Jane Smith'
      }
    ];
  }
};

export const createBookingSlot = async (slotData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/booking-slots`, slotData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking slot:', error);
    throw error;
  }
};

export const updateBookingSlot = async (slotId, slotData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/booking-slots/${slotId}`, slotData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking slot:', error);
    throw error;
  }
};

// Vaccine Trials
export const fetchVaccineTrials = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/vaccine-trials`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccine trials:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'COVID-19 mRNA Vaccine Trial',
        phase: 'Phase 3',
        status: 'Active',
        description: 'Testing efficacy of new mRNA vaccine',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        participants: 1000,
        eligibilityCriteria: ['Age 18-65', 'No previous COVID infection']
      },
      {
        id: '2',
        name: 'Influenza Vaccine Study',
        phase: 'Phase 2',
        status: 'Recruiting',
        description: 'Annual flu vaccine effectiveness study',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        participants: 500,
        eligibilityCriteria: ['Age 21+', 'No flu vaccination in last 6 months']
      }
    ];
  }
};

export const updateVaccineTrial = async (trialId, trialData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/vaccine-trials/${trialId}`, trialData);
    return response.data;
  } catch (error) {
    console.error('Error updating vaccine trial:', error);
    throw error;
  }
};

// User Behavior
export const fetchUserBehavior = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user behavior:', error);
    // Return mock data for development
    return [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'participant',
        lastActive: '2024-01-15T10:30:00Z',
        trialsParticipated: 2
      },
      {
        id: '2',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'participant',
        lastActive: '2024-01-14T15:45:00Z',
        trialsParticipated: 1
      }
    ];
  }
};