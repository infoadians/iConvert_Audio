
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';


console.log('App Bootstrapping...');

// Global Error Handler
window.onerror = (msg, url, line, col, error) => {
  console.error('GLOBAL ERROR:', msg, 'at', url, ':', line, ':', col, error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Bootstrap Error</h2>
      <p>${msg}</p>
      <pre style="font-size: 12px; background: #eee; padding: 10px;">${error?.stack || ''}</pre>
    </div>`;
  }
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
          <h2>Application Error</h2>
          <p>{this.state.error?.message || 'Something went wrong'}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px' }}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register Service Worker for PWA/Offline functionality.
// Do NOT auto-reload on update or controllerchange: on iPad PWA, iOS unloads
// the app aggressively and re-launching often triggers a SW activation, which
// would force an extra reload every time the user comes back from another app.
// New SW versions take effect on the next manual refresh / cold start.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('ServiceWorker registered:', reg.scope);
      })
      .catch((err) => console.warn('PWA registration skipped:', err.message));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("FATAL: Root element not found");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log('React Render Initiated');
  } catch (err) {
    console.error('Render Initialization Error:', err);
  }
}

