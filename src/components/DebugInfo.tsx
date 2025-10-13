import React from 'react';
import { config } from '../config/environment';

export const DebugInfo: React.FC = () => {
    const testConnection = async () => {
        console.log('Testing connection...');

        try {
            const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'admin@flowcrm.com',
                    password: 'admin123'
                })
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                alert('Connection successful!');
            } else {
                console.error('Error:', response.statusText);
                alert(`Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <button onClick={testConnection} style={{ marginTop: '10px' }}>
                Test Connection
            </button>
        </div>
    );
};