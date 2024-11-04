import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import '../styles/WelcomePage.css';
import { navigateTo } from '../utils/navigation';
import { API_ENDPOINTS } from '../api/endpoints';


function WelcomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [backgroundStyle, setBackgroundStyle] = useState({});
  
    useEffect(() => {
    fetchStoreInfo();
  }, []);
  
  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_STORE_INFO);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();	

      // 如果有背景圖片，設置背景樣式
      if (data[0]?.backgroundImage) {
        const imageUrl = `${API_ENDPOINTS.GET_IMAGE}?fileName=${data[0].backgroundImage.replace('/uploads/', '')}`;
        setBackgroundStyle({
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        });
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

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
	  style={backgroundStyle}
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
