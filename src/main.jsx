// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { ServiceProvider } from './context/ServiceContext'
import { PermissionsProvider } from './context/PermissionsContext'
import App from './App'
import './index.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* ✅ Router واحد فقط */}
      <ThemeProvider>
        <ServiceProvider>
          <PermissionsProvider>
            <App />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '12px',
                },
              }}
            />
          </PermissionsProvider>
        </ServiceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)