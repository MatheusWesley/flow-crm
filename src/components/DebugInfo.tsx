import React from 'react';
import { config } from '../config/environment';

export const DebugInfo: React.FC = () => {
    const testConnection = async () => {
        console.log('Testing connection...');
        console.log('Full URL:', `${config.apiBaseUrl}/auth/login`);
        console.log('Current origin:', window.location.origin);

        try {
            const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@flowcrm.com',
                    password: 'admin123'
                }),
                mode: 'cors',
                credentials: 'omit'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                alert(`Connection successful! User: ${data.data?.user?.email}`);
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert(`Error: ${response.status} ${response.statusText}\n${errorText}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            console.error('Error details:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const testHealthCheck = async () => {
        console.log('Testing health check...');

        try {
            const response = await fetch('https://flow-crm-backend-58ub.onrender.com/health', {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            });

            console.log('Health check status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Health check success:', data);
                alert(`Health check successful! Status: ${data.status}`);
            } else {
                alert(`Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Health check error:', error);
            alert(`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: 9999,
            fontSize: '12px',
            maxWidth: '300px'
        }}>
            <h4>Debug Info</h4>
            <p><strong>API Base URL:</strong> {config.apiBaseUrl}</p>
            <p><strong>Environment:</strong> {config.appEnvironment}</p>
            <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
            <p><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</p>
            <p><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'undefined'}</p>
            <div style={{ marginTop: '10px' }}>
                <button onClick={testHealthCheck} style={{ marginRight: '5px', marginBottom: '5px' }}>
                    Test Health
                </button>
                <button onClick={testConnection} style={{ marginRight: '5px', marginBottom: '5px' }}>
                    Test Login
                </button>
                <button onClick={async () => {
                    try {
                        const axios = (await import('axios')).default;
                        const response = await axios.post(`${config.apiBaseUrl}/auth/login`, {
                            email: 'admin@flowcrm.com',
                            password: 'admin123'
                        }, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 15000,
                            withCredentials: false
                        });
                        alert(`Axios success! User: ${response.data.data?.user?.email}`);
                    } catch (error) {
                        alert(`Axios error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }} style={{ marginBottom: '5px' }}>
                    Test Axios
                </button>
            </div>
        </div>
    );
};