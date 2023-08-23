import React from 'react';
import routers from '@/router/index';
import { Link, useRoutes } from 'react-router-dom';
import './App.scss';

const App = () => {
  const Element = () => useRoutes(routers);
  return (
    <div className="App">
      <p>
        <Link to="/" className="App-link">
          home
        </Link>
        {' | '}
        <Link to="/storage-monitor-test" className="App-link">
          storage-monitor-test
        </Link>
        {' | '}
        <Link to="/api-monitor-test" className="App-link">
          api-monitor-test
        </Link>
      </p>
      <Element />
    </div>
  );
};

export default App;
