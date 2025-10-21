import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const stats = [
    { title: 'Active Trials', value: '12', change: '+2 this month' },
    { title: 'Total Participants', value: '1,248', change: '+156 this month' },
    { title: 'Booking Slots', value: '89', change: '23 available' },
    { title: 'Completed Trials', value: '7', change: '2 this quarter' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Clinical Research Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '1.125rem' }}>
          Manage trials, participants, and research data
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem', fontWeight: '500' }}>
              {stat.title}
            </h3>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {stat.value}
            </p>
            <p style={{ margin: '0', color: '#059669', fontSize: '0.875rem' }}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <Link to="/trials" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid transparent',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              Manage Vaccine Trials
            </h2>
            <p style={{ color: '#666', margin: '0' }}>
              View and manage ongoing clinical trials, update trial status, and monitor progress.
            </p>
          </div>
        </Link>

        <Link to="/bookings" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid transparent',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              Booking Management
            </h2>
            <p style={{ color: '#666', margin: '0' }}>
              Manage appointment slots, view bookings, and coordinate participant schedules.
            </p>
          </div>
        </Link>

        <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '2px solid transparent',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '600' }}>
              User Analytics
            </h2>
            <p style={{ color: '#666', margin: '0' }}>
              Analyze user behavior, track engagement, and monitor participant activity.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;