import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const ConfirmOrderPage = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('09');
  const [carrier, setCarrier] = useState('/');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carrierError, setCarrierError] = useState('');

  const pickupTime = location.state?.pickupTime || '';

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length < 2) {
      value = '09';
    } else if (!value.startsWith('09')) {
      value = '09' + value.slice(2);
    }
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const handleCarrierChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (value.length === 0) {
      value = '/';
    } else if (value[0] !== '/') {
      value = '/' + value;
    }
    setCarrier(value);
    
    // 驗證載具格式
    const carrierRegex = /^\/[A-Z]{2}\d{14}$|^\/\d{8}$|^\/[A-Z0-9]{7}$/;
    if (value.length > 1 && !carrierRegex.test(value)) {
      setCarrierError(t('errors.invalidCarrier'));
    } else {
      setCarrierError('');
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // 檢查手機號碼格式
    if (mobile.length !== 10) {
      Swal.fire({
        icon: 'error',
        title: t('errors.invalidMobile'),
        text: t('errors.pleaseEnter10Digits'),
      });
      return;
    }

    if (carrierError) {
      Swal.fire({
        icon: 'error',
        title: t('errors.invalidCarrier'),
        text: t('errors.pleaseCheckCarrier'),
      });
      return;
    }

    const order = {
      Amt: Math.round(total),
      Name: name,
      Mobile: mobile,
      Carrier: carrier,
      Note: note.slice(0, 100),
      State: t('待處理'),
      PickupTime: pickupTime,
      OrderDetail: cart.map(item => ({
        ProdId: item.id,
        ProdName: item.name,
        Quantity: item.quantity,
        Subtotal: item.price * item.quantity
      }))
    };
  
    try {
      setIsSubmitting(true);
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

      const orderTime = new Date().toLocaleString();
      const orderNumber = result.orderId;

      clearCart();

      navigate('/FastOrderFood/order-confirmation', { 
        state: { 
          orderTime, 
          orderNumber,
          pickupTime  // 添加 pickupTime 到導航狀態
        } 
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: '訂單提交失敗',
        text: '請稍後再試。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="confirm-order-page">
      <button className="back-button" onClick={() => navigate('/FastOrderFood/cart')}>{t('back')}</button>
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
      <form onSubmit={handleSubmitOrder} className="order-form">
        <div className="form-group">
          <label htmlFor="name">{t('confirmOrder.name')}：</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={25}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">{t('confirmOrder.mobile')}：</label>
          <input
            type="tel"
            inputMode="numeric"
            id="mobile"
            value={mobile}
            onChange={handleMobileChange}
            required
            maxLength={10}
          />
        </div>
        <div className="form-group">
          <label htmlFor="carrier">{t('confirmOrder.carrier')}：</label>
          <input
            type="text"
            id="carrier"
            value={carrier}
            onChange={handleCarrierChange}
            maxLength={8}
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
            {isSubmitting ? t('confirmOrder.processing') : t('confirmOrder.submitOrder')}
        </button>
      </form>
    </div>
  );
};

export default ConfirmOrderPage;
