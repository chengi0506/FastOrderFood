import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function MenuItem({ item, addToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(item.price);

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
      title: '已加入購物車',
      text: `${item.name} x ${quantity}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  return (
    <div className="menu-item">
      <h3>{item.name}</h3>
      <p>單價: ${item.price}</p>
      <p>小計: ${subtotal}</p>
      <div className="quantity-control">
        <button onClick={decreaseQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={increaseQuantity}>+</button>
      </div>
      <button className="add-to-cart" onClick={handleAddToCart}>加入購物車</button>
    </div>
  );
}

export default MenuItem;
