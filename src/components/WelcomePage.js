import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const navigate = useNavigate();

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
    navigate('/menu');
  };

  return (
    <div 
      className="welcome-page"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="welcome-content">
        <h1>歡迎使用點餐系統</h1>
        <p>向上滑動開始點餐</p>
        <div className="arrow-up" onClick={navigateToMenu}></div>
      </div>
    </div>
  );
}

export default WelcomePage;
