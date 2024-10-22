import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ConfirmOrderPage({ cart, clearCart }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleConfirmOrder = () => {
    // 這裡應該有處理訂單確認的邏輯
    clearCart();
    navigate('/order-confirmation');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="confirm-order-page">
      <h2>{t('confirmOrder')}</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} x {item.quantity} - ${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>{t('total')}: ${total}</p>
      <button onClick={handleConfirmOrder}>{t('placeOrder')}</button>
    </div>
  );
}

export default ConfirmOrderPage;
