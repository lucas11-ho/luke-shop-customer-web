import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext.jsx';
import { StoreProvider } from './store/StoreContext.jsx';
import { ExperienceFoundation } from './store/ExperienceFoundation.jsx';
import { CartProvider } from './cart/CartContext.jsx';
import { App } from './app/App.jsx';
import { PwaProvider } from './pwa/PwaExperience.jsx';
import { LocalizationProvider } from './i18n/LocalizationContext.jsx';
import './styles.css';
import './experience-foundation.css';
import './home-v4.css';
import './commerce-v4.css';
import './cart-checkout-v4.css';
import './footer-v4.css';
import './explore-a3.css';
import './cart-checkout-a4.css';
import './payment-gateway-v1.css';
import './digital-library.css';
import './checkout-ux-pro.css';
import './zone-delivery-quote.css';
import './vip-center.css';
import './delivery-experience-v1.css';
import './mobile-scroll-safety.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <ExperienceFoundation />
        <LocalizationProvider>
          <PwaProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </PwaProvider>
        </LocalizationProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>,
);
