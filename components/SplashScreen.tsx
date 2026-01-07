
import React from 'react';

export const SplashScreen: React.FC = () => {
    return (
        <div className="splash-screen">
            <div className="splash-content">
                <div className="splash-logo-container">
                    <img src="/bella-logo.png" alt="Bella Labs Logo" className="splash-logo" />
                    <div className="splash-glow"></div>
                </div>
                <div className="splash-text">
                    <span className="splash-letter">B</span>
                    <span className="splash-letter">E</span>
                    <span className="splash-letter">L</span>
                    <span className="splash-letter">L</span>
                    <span className="splash-letter">A</span>
                    <span className="splash-space"></span>
                    <span className="splash-letter">L</span>
                    <span className="splash-letter">A</span>
                    <span className="splash-letter">B</span>
                    <span className="splash-letter">S</span>
                </div>
                <div className="splash-loader">
                    <div className="splash-loader-bar"></div>
                </div>
            </div>
        </div>
    );
};
