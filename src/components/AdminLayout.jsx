import React from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ title, children }) => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content">
        {title && (
          <div className="admin-page-header">
            <h1>{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
