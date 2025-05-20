import React, { useEffect, useState } from 'react';
import { checkStorageMethod } from '../services/api';

/**
 * Component to display the current storage method (database or localStorage)
 */
const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<{ usingDatabase: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkStorageMethod();
        setStatus(result);
      } catch (error) {
        console.error('Error checking storage method:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return <div className="database-status">Checking storage method...</div>;
  }

  return (
    <div className="database-status" style={{ 
      padding: '10px', 
      margin: '10px 0', 
      borderRadius: '4px',
      backgroundColor: status?.usingDatabase ? '#e6f7e6' : '#f7e6e6',
      color: status?.usingDatabase ? '#2e7d32' : '#c62828',
      border: `1px solid ${status?.usingDatabase ? '#a5d6a7' : '#ef9a9a'}`
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>
        Storage Status: {status?.usingDatabase ? 'Database' : 'LocalStorage'}
      </h4>
      <p style={{ margin: 0, fontSize: '0.9em' }}>{status?.message}</p>
    </div>
  );
};

export default DatabaseStatus;