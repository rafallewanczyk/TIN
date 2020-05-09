import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';

if (ReactDOM.createRoot) {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
} else {
  // @ts-ignore
  ReactDOM.unstable_createRoot(document.getElementById('root') as HTMLElement).render(<App />);
}
