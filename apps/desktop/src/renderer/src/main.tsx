import React from 'react';
import ReactDOM from 'react-dom/client';

function App(): React.JSX.Element {
  return (
    <main>
      <h1>My Desktop App</h1>
      <p>Desktop application scaffold is ready for product requirements.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
