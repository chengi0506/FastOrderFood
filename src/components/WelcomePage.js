import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import '../styles/WelcomePage.css';
import { navigateTo } from '../utils/navigation';

function WelcomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    if (startY - currentY > 100) {
      navigateToMenu();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };


  const navigateToMenu = () => {
    navigateTo.menu(navigate);
  };

  return (
    <div 
      className="welcome-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="welcome-content">
        <h1>{t('welcomeTitle')}</h1>
        <LanguageSelector />
        <p>{t('swipeUpToOrder')}</p>
        <div className="arrow-up" onClick={navigateToMenu}></div>
      </div>
    </div>
  );
}

export default WelcomePage;
