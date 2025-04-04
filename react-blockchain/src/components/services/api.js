import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Fetch the welcome message from the root endpoint
export const fetchWelcomeMessage = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Upload a certificate
export const uploadCertificate = async (certId, name, course) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, {
            cert_id: certId,
            name: name,
            course: course,
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Verify a certificate
export const verifyCertificate = async (certId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/verify/${certId}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

//chat_model

// services/api.js

export const chatWithLLM = async ({ message }) => {
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  };
  
