import React from 'react';
import { AppLayout } from './AppLayout/AppLayout';
import { LocationProvider } from '@reach/router';

function App() {
  return (
    <div className="App">
      <LocationProvider>
        <AppLayout />
      </LocationProvider>
    </div>
  );
}

export default App;
