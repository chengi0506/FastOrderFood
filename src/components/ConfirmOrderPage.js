import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';


const ConfirmOrderPage = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [carrier, setCarrier] = useState('');
  const [note, setNote] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault(); // 防止表單默認提交行為

    const order = {
      Amt: Math.round(total),
      Name: name,
      Mobile: mobile.replace(/\D/g, ''),
      Carrier: carrier.slice(0, 8),
      Note: note.slice(0, 100),
      State: "待處理",
      OrderDetail: cart.map(item => ({
        ProdId: item.id,
        ProdName: item.name,
        Quantity: item.quantity,
        Subtotal: item.price * item.quantity
      }))
    };
  
    try {
      const response = await fetch(API_ENDPOINTS.CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response:', errorData);
        throw new Error('訂單提交失敗');
      }
  
      const result = await response.json();

      // 顯示 SweetAlert2 toast 通知
      await Swal.fire({
        icon: 'success',
        title: '訂購成功',
        text: `訂單編號：${result.orderId}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      // 訂單時間、訂單編號
      const orderTime = new Date().toLocaleString();
      const orderNumber = result.orderId;

      // 清空購物車
      clearCart();

      // 跳轉到訂單確認頁面
      navigate('/order-confirmation', { state: { orderTime, orderNumber } });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: '訂單提交失敗',
        text: '請稍後再試。',
      });
    }
  };
  

  return (
    <div className="confirm-order-page">
      <h2 className="page-title">確認訂單</h2>
      <div className="order-summary">
        <h3>訂單摘要</h3>
        <div className="order-items">
          {cart.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">${item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <strong>總計：</strong> <span className="total-price">${total}</span>
        </div>
      </div>
      <form onSubmit={handleSubmitOrder} className="order-form">
        <div className="form-group">
          <label htmlFor="name">姓名：</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">手機：</label>
          <input
            type="tel"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="carrier">手機載具：</label>
          <input
            type="text"
            id="carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="note">備註：</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="confirm-order-button">確認提交訂單</button>
      </form>
    </div>
  );
};

export default ConfirmOrderPage;
