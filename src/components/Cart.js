import React from 'react';
import { useNavigate } from 'react-router-dom';

function Cart({ items }) {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-container" onClick={() => navigate('/cart')}>
      <div className="cart">
        <div className="cart-icon">
          <i className="bi bi-cart3"></i>
          <span className="item-count">{totalQuantity}</span>
        </div>
        <div className="cart-summary">
          <p>數量: {totalQuantity}</p>
          <p>合計: ${total}</p>
          <button>確認訂單</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
