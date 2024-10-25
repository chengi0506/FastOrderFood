import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import '../styles/OrderConfirmationPage.css';

const OrderConfirmationPage = ({ storeInfo }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { orderTime, orderNumber, pickupTime } = location.state || {};
  const confirmationRef = useRef(null);

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
          <p><strong>{t('confirmOrder.pickupTime')}:</strong> <span className="highlight-text">{pickupTime || t('notSelected')}</span></p>
          <p><strong>{t('orderConfirmationPage.orderNumber')}:</strong> <span className="highlight-text">{orderNumber}</span></p>
        </div>
        <p className="confirmation-message">
          {t('orderConfirmationPage.confirmationMessage')}
        </p>
        <div className="action-buttons">
          <button onClick={downloadScreenshot} className="button download-button">
            <FaDownload /> {t('orderConfirmationPage.downloadScreenshot')}
          </button>
          <Link to="/menu" className="button primary-button">
            {t('orderConfirmationPage.continueShopping')}
          </Link>
          <Link to="/" className="button secondary-button">
            {t('orderConfirmationPage.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
