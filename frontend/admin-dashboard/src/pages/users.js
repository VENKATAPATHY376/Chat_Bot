import React, { useEffect, useState } from 'react';
import { fetchUserBehavior } from '../services/api';
import UserBehavior from '../components/UserBehavior';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const userData = await fetchUserBehavior();
                setUsers(userData);
            } catch (err) {
                setError('Failed to load user data');
                console.error('Failed to load users:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadUsers();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Loading user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    User Behavior Analytics
                </h1>
                <p style={{ color: '#666' }}>
                    Monitor participant engagement and activity patterns
                </p>
            </div>

            {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#666' }}>No user data available</p>
                </div>
            ) : (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: '#666' }}>
                            Showing {users.length} participants
                        </p>
                    </div>
                    {users.map((user) => (
                        <UserBehavior key={user.id} user={user} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersPage;