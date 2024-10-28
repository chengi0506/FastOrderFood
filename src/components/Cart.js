import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Cart({ items }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-container" onClick={() => navigate('/FastOrderFood/cart')}>
      <div className="cart">
        <div className="cart-icon">
          <i className="bi bi-cart3"></i>
          <span className="item-count">{totalQuantity}</span>
        </div>
        <div className="cart-summary">
          <p>{t('quantity')}: {totalQuantity}</p>
          <p>{t('total')}: ${total}</p>
          <button>{t('cart')}</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
