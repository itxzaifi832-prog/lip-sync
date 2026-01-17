import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
            <p className="loading-text">Processing... This may take a while.</p>
        </div>
    );
};

export default LoadingSpinner;
