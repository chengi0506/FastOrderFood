import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { navigateTo } from '../utils/navigation';
import '../styles/OrderConfirmationPage.css';

const OrderConfirmationPage = ({ storeInfo }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const confirmationRef = useRef(null);

  // 從 location.state 獲取訂單資訊，如果沒有則使用預設值
  const orderInfo = location.state || {
    orderTime: '-',
    pickupTime: t('notSelected'),
    orderNumber: '-'
  };

  const { orderTime, pickupTime, orderNumber } = orderInfo;

  const downloadScreenshot = () => {
    const element = confirmationRef.current;
    html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `order-confirmation-${orderNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleBackToMenu = () => {
    navigateTo.home(navigate);
  };

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-card" ref={confirmationRef}>
        <FaCheckCircle className="success-icon" />
        <h2>{t('orderConfirmationPage.title')}</h2>
        {storeInfo && (
          <div className="store-info">
            <h2>{storeInfo.storeName}</h2>
            <p>{t('phone')}: {storeInfo.storeContactTel}</p>
            <p>{t('address')}: {storeInfo.storeAddress}</p>
            <p>{t('businessHours')}: {storeInfo.storeBusinessHours}</p>
          </div>
        )}
        <p className="thank-you-message">{t('orderConfirmationPage.thankYou')}</p>
        <div className="order-details">
          <p><strong>{t('orderConfirmationPage.orderTime')}:</strong> <span className="highlight-text">{orderTime}</span></p>
          <p><strong>{t('confirmOrder.pickupTime')}:</strong> <span className="highlight-text">{pickupTime}</span></p>
          <p><strong>{t('orderConfirmationPage.orderNumber')}:</strong> <span className="highlight-text">{orderNumber}</span></p>
        </div>
        <p className="confirmation-message">
          {t('orderConfirmationPage.confirmationMessage')}
        </p>
        <div className="action-buttons">
          <button onClick={downloadScreenshot} className="button download-button">
            <FaDownload /> {t('orderConfirmationPage.downloadScreenshot')}
          </button>
          <button onClick={handleBackToMenu} className="button primary-button">
            {t('orderConfirmationPage.continueShopping')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
