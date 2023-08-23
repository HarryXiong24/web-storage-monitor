import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Monitor from 'lib';

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

new Monitor({
  reportFormat: {
    consolePrint: {
      JSON: false,
      obj: true,
    },
  },
});
