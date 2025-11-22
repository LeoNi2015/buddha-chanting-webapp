import React from 'react';
import '../index.css';

const Counter = ({ count }) => {
    return (
        <div className="counter-container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
                fontSize: '1.5rem',
                color: 'var(--text-color)',
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '2px'
            }}>
                Amitabha Recitations
            </h2>
            <div style={{
                fontSize: '6rem',
                fontWeight: 'bold',
                color: 'var(--accent-color)',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
            }}>
                {count.toLocaleString()}
            </div>
        </div>
    );
};

export default Counter;
