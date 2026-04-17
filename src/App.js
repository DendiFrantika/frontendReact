import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import testAPI from './test-api';
import './App.css';

function App() {
  const [apiTestResult, setApiTestResult] = useState(null);

  useEffect(() => {
    // Run API tests in development mode only
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Mode Development - Menjalankan test API...');
      testAPI().then(result => {
        setApiTestResult(result);
        if (!result.success) {
          console.warn('⚠️ API test gagal - pastikan backend berjalan di:', process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api');
        }
      });
    }
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        {process.env.NODE_ENV === 'development' && apiTestResult && (
          <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            padding: '10px 15px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            backgroundColor: apiTestResult.success ? '#d4edda' : '#f8d7da',
            color: apiTestResult.success ? '#155724' : '#721c24',
            border: `1px solid ${apiTestResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          }}>
            {apiTestResult.success ? '✅ API Connected' : '❌ API Error'}
          </div>
        )}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
