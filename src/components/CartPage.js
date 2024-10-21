import React from 'react';
import { useNavigate } from 'react-router-dom';

function CartPage({ items, removeFromCart, updateCartItemQuantity }) {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItemQuantity(index, newQuantity);
    } else {
      removeFromCart(index);
    }
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h2>購物車</h2>
        <button className="back-button" onClick={() => navigate('/menu')}>返回</button>
      </header>
      {items.length === 0 ? (
        <p className="empty-cart">購物車是空的</p>
      ) : (
        <>
          <div className="cart-items">
            <div className="cart-item cart-header">
              <span>商品名稱</span>
              <span>單價</span>
              <span>數量</span>
              <span>小計</span>
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
          </div>
          <div className="cart-total">
            <p>總計: <span className="total-price">${total}</span></p>
            <button className="checkout-button" onClick={() => navigate('/confirm-order')}>提交訂單</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
