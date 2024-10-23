import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../styles/OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { orderTime, orderNumber } = location.state || {};

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-card">
        <FaCheckCircle className="success-icon" />
        <h2>{t('orderConfirmationPage.title')}</h2>
        <p className="thank-you-message">{t('orderConfirmationPage.thankYou')}</p>
        <div className="order-details">
          <p><strong>{t('orderConfirmationPage.orderTime')}:</strong> {orderTime}</p>
          <p><strong>{t('orderConfirmationPage.orderNumber')}:</strong> {orderNumber}</p>
        </div>
        <p className="confirmation-message">
          {t('orderConfirmationPage.confirmationMessage')}
        </p>
        <div className="action-buttons">
          <Link to="/menu" className="confirm-order-button">
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
