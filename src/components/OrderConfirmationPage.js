import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="order-confirmation-page">
      <h2>{t('orderConfirmed')}</h2>
      <p>{t('thankYou')}</p>
      <button onClick={() => navigate('/menu')}>{t('backToMenu')}</button>
    </div>
  );
}

export default OrderConfirmationPage;
