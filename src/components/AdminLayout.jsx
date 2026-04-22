import React from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ title, children }) => {
  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main style={styles.content}>

        {title && (
          <div style={styles.header}>
            <h1 style={styles.title}>{title}</h1>
          </div>
        )}

        <div style={styles.body}>
          {children}
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;

/* ===========================
   STYLES (INLINE)
   =========================== */
const styles = {
  layout: {
    display: 'flex',
    height: '100vh', // 🔥 kunci biar tidak memanjang
    background: '#f8fafc'
  },

  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#ffffff'
  },

  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 600,
    color: '#1e293b'
  },

  body: {
    flex: 1,
    overflowY: 'auto', // 🔥 ini yang bikin scroll internal
    padding: '24px'
  }
};