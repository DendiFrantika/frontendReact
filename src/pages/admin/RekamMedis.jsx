import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function RekamMedis(){
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <h1>Rekam Medis</h1>
        {/* TODO: implement medical record management */}
      </div>
    </div>
  );
}
