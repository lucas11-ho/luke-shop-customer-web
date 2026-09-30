import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext.jsx';
import { StoreProvider } from './store/StoreContext.jsx';
import { ExperienceFoundation } from './store/ExperienceFoundation.jsx';
import { CartProvider } from './cart/CartContext.jsx';
import { App } from './app/App.jsx';
import { PwaProvider } from './pwa/PwaExperience.jsx';
import { LocalizationProvider } from './i18n/LocalizationContext.jsx';
import { writeStoredSession } from './api/client.js';
import { bootstrapBotPilotCustomerMiniApp } from './integrations/botPilotMiniApp.js';
import './styles.css';
import './experience-foundation.css';
import './theme-system-v1.css';
import './luke-commerce-ios-v1.css';
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
import './theme-controls-v1-a5.css';
import './theme-product-typography-a6.css';
import './theme-commerce-surfaces-a7.css';
import './category-icons-a9-1.css';
import './menu-shortcuts-a9-2.css';

function renderApp() {
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
}

function renderMiniAppError(error) {
  const root = document.getElementById('root');
  root.innerHTML = '';
  const card = document.createElement('main');
  card.style.cssText = 'max-width:520px;margin:64px auto;padding:24px;font:16px/1.5 system-ui,sans-serif;text-align:center';
  const title = document.createElement('h1');
  title.textContent = 'Shop';
  const message = document.createElement('p');
  message.textContent = error?.message || 'Unable to sign in to this Shop.';
  card.append(title, message);
  root.append(card);
}

bootstrapBotPilotCustomerMiniApp({ writeSession: writeStoredSession })
  .then(renderApp)
  .catch(renderMiniAppError);