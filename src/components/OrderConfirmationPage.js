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

  const orderInfo = location.state || {
    orderTime: '-',
    pickupTime: t('notSelected'),
    orderNumber: '-'
  };

  const { orderTime, pickupTime, orderNumber } = orderInfo;

  const downloadScreenshot = async () => {
    try {
      const element = confirmationRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
      });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        canvas.toBlob(async (blob) => {
          try {
            if (navigator.share) {
              const file = new File([blob], `order-${orderNumber}.png`, { type: 'image/png' });
              await navigator.share({
                files: [file],
                title: t('orderConfirmationPage.orderScreenshot'),
                text: t('orderConfirmationPage.shareText')
              });
            } else {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `order-${orderNumber}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          } catch (error) {
            console.error('Error sharing:', error);
            window.open(canvas.toDataURL());
          }
        }, 'image/png');
      } else {
        const link = document.createElement('a');
        link.download = `order-${orderNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      alert(t('orderConfirmationPage.screenshotError'));
    }
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
          <div>
            <h4>{storeInfo.storeName}</h4>
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
