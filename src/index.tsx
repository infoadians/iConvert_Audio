
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Register Service Worker for PWA/Offline functionality
// Added origin check to prevent registration errors on restricted domains (like development proxies)
if ('serviceWorker' in navigator && window.location.origin.indexOf('localhost') !== -1 || window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    // We use a relative path to ensure the origin matches
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registered with scope: ', reg.scope))
      .catch((err) => {
        // Log locally but don't break the app
        console.warn('PWA ServiceWorker registration skipped or failed:', err.message);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
