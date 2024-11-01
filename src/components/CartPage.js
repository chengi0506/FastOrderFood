import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigateTo } from '../utils/navigation';

function CartPage({ items, removeFromCart, updateCartItemQuantity, clearCart, pickupTime }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItemQuantity(index, newQuantity);
    } else {
      removeFromCart(index);
    }
  };

  const handleBackToMenu = () => {
    navigateTo.menu(navigate);
  };

  const handleCheckout = () => {
    navigateTo.confirmOrder(navigate);
  };

  return (
    <div className="cart-page">
      <button className="back-button" onClick={handleBackToMenu}>{t('back')}</button>
      <h2 className="page-title">{t('cart')}</h2>
      {items.length === 0 ? (
        <p className="empty-cart">{t('emptyCart')}</p>
      ) : (
        <>
          <div className="cart-items">
            <div className="cart-item cart-header">
              <span>{t('productName')}</span>
              <span>{t('unitPrice')}</span>
              <span>{t('quantity')}</span>
              <span>{t('subtotal')}</span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="cart-item">
                <span>{item.name}</span>
                <span>${item.price}</span>
                <span className="quantity-control">
                  <button onClick={() => handleQuantityChange(index, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</button>
                </span>
                <span>${item.price * item.quantity}</span>
              </div>
            ))}          
            <div className="order-total-and-pickup">
              <div className="pickup-time">
                <strong>{t('confirmOrder.pickupTime')}：</strong>
                <span className="total-price">{pickupTime || t('notSelected')}</span>
              </div>
              <div className="order-total">
                <strong>{t('confirmOrder.total')}：</strong>
                <span className="total-price">${total}</span>
              </div>
            </div>
          </div>
          <div>
            <button className="confirm-order-button" onClick={handleCheckout}>
              {t('confirmOrder.confirmOrder')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
