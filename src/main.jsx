import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext.jsx';
import { StoreProvider } from './store/StoreContext.jsx';
import { CartProvider } from './cart/CartContext.jsx';
import { App } from './app/App.jsx';
import { PwaProvider } from './pwa/PwaExperience.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <PwaProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PwaProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>,
);
