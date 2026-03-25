import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safety check to prevent "Cannot set property fetch of #<Window>" error
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    configurable: false,
    enumerable: true,
    get: () => originalFetch,
    set: () => {
      console.warn('Attempt to overwrite window.fetch blocked.');
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
