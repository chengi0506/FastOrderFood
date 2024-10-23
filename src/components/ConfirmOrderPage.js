import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const ConfirmOrderPage = ({ cart, clearCart, pickupTime }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [carrier, setCarrier] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); //提交狀態

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const order = {
      Amt: Math.round(total),
      Name: name,
      Mobile: mobile.replace(/\D/g, ''), // 保持為字符串，只移除非數字字符
      Carrier: carrier.slice(0, 8),
      Note: note.slice(0, 100),
      State: t('orderStatus.pending'),
      PickupTime: pickupTime,
      OrderDetail: cart.map(item => ({
        ProdId: item.id,
        ProdName: item.name,
        Quantity: item.quantity,
        Subtotal: item.price * item.quantity
      }))
    };
  
    try {
  // 鎖定按鈕，防止重複提交
  setIsSubmitting(true);

      const response = await fetch(API_ENDPOINTS.CHECKOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error Response:', errorData);
        throw new Error(t('errors.orderSubmissionFailed'));
      }
  
      const result = await response.json();

      await Swal.fire({
        icon: 'success',
        title: t('success.orderPlaced'),
        text: t('success.orderNumber', { orderId: result.orderId }),
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      const orderTime = new Date().toLocaleString();
      const orderNumber = result.orderId;

      clearCart();

      navigate('/order-confirmation', { state: { orderTime, orderNumber } });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: t('errors.orderSubmissionFailed'),
        text: t('errors.tryAgainLater'),
      });
    }finally {
      // 解除鎖定
      setIsSubmitting(false);
    }
  };

  return (
    <div className="confirm-order-page">
      <button className="back-button" onClick={() => navigate('/cart')}>{t('back')}</button>
      <h2 className="page-title">{t('confirmOrder.title')}</h2>
    
      <div className="order-summary">
        <h3>{t('confirmOrder.orderSummary')}</h3>
        <div className="order-items">
          {cart.map((item, index) => (
            <div key={index} className="order-item">
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
              <span className="item-price">${item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="order-total-and-pickup">
          <span className="pickup-time">
            <strong>{t('pickupTime')}：</strong>
            <span className="total-price">{pickupTime || t('notSelected')}</span>
          </span>
          <span className="order-total">
            <strong>{t('confirmOrder.total')}：</strong>
            <span className="total-price">${total}</span>
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmitOrder} className="order-form">
        <div className="form-group">
          <label htmlFor="name">{t('confirmOrder.name')}：</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">{t('confirmOrder.mobile')}：</label>
          <input
            type="tel"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="carrier">{t('confirmOrder.carrier')}：</label>
          <input
            type="text"
            id="carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="note">{t('confirmOrder.note')}：</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="confirm-order-button" disabled={isSubmitting}>
          <i className="fas fa-pencil-alt mr-1"></i>
            {isSubmitting ? "訂單處理中..." : t('confirmOrder.submitOrder')}
        </button>
      </form>
    </div>
  );
};

export default ConfirmOrderPage;
