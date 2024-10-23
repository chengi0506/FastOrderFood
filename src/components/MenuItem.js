import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

function MenuItem({ item, addToCart, isInCart, cartQuantity }) {
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(item.price);
  const { t } = useTranslation();

  useEffect(() => {
    setSubtotal(item.price * quantity);
  }, [quantity, item.price]);

  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  const handleAddToCart = () => {
    addToCart({ ...item, quantity });
    setQuantity(1); // 重置數量為1
    
    // 顯示 SweetAlert2 toast 通知
    Swal.fire({
      icon: 'success',
      title: t('addedToCart'),
      text: `${item.name} x ${quantity}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
  };

  return (
    <div className="menu-item">
      {isInCart && (
        <div className="cart-quantity-badge">
          {cartQuantity}
        </div>
      )}
      <h2>{item.name}</h2>
      <h3>${item.price}</h3>
      <div className="quantity-control">
        <button onClick={decreaseQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={increaseQuantity}>+</button>
      </div>
      <button className="add-to-cart" onClick={handleAddToCart}>
        <span className="quantity-badge">{quantity}</span>
        {t('addToCart')}
        <span className="subtotal-badge">${subtotal}</span>
      </button>
    </div>
  );
}

export default MenuItem;
