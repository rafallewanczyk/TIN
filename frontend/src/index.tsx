import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
  // @ts-ignore
if (ReactDOM.createRoot) {
  // @ts-ignore
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
} else {
  // @ts-ignore
  ReactDOM.unstable_createRoot(document.getElementById('root') as HTMLElement).render(<App />);
}
