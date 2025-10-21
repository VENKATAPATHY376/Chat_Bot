import React from 'react';

const UserBehavior = ({ user }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
            {user.name}
          </h3>
          <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
            Email: {user.email}
          </p>
          <p style={{ margin: '0 0 0.25rem 0', color: '#666' }}>
            Role: {user.role}
          </p>
          {user.lastActive && (
            <p style={{ margin: '0', color: '#666', fontSize: '0.875rem' }}>
              Last Active: {new Date(user.lastActive).toLocaleDateString()}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            backgroundColor: '#f0f9ff',
            color: '#0369a1',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {user.trialsParticipated || 0} trials
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserBehavior;