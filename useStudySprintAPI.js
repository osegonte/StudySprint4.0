// StudySprint 4.0 - React API Hook Example
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useStudySprintAPI = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        checkConnection();
    }, []);
    
    const checkConnection = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            setIsConnected(data.status === 'healthy');
        } catch (error) {
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };
    
    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        
        return response.json();
    };
    
    return {
        isConnected,
        loading,
        apiCall,
        checkConnection,
        baseURL: API_BASE_URL
    };
};

// Example usage:
// const { isConnected, apiCall } = useStudySprintAPI();
// const topics = await apiCall('/topics/');
