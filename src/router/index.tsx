import React from 'react';
import { RouteObject } from 'react-router';
import Home from '@/pages/Home/index';
import ApiMonitorTest from '@/pages/ApiMonitorTest';
import StorageMonitorTest from '@/pages/StorageMonitorTest';
import NoMatch from '@/pages/404/index';

const routes: RouteObject[] = [
  { path: '/', element: <Home />, index: true },
  { path: '/storage-monitor-test', element: <StorageMonitorTest /> },
  { path: '/api-monitor-test', element: <ApiMonitorTest /> },
  { path: '*', element: <NoMatch /> },
];

export default routes;
