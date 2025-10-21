import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            Clinical Research Admin Dashboard
          </h1>
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;