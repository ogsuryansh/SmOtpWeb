import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const DashboardLayout = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Header />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
