import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../api/endpoints';
import Swal from 'sweetalert2';

const ConfirmOrderPage = ({ cart, clearCart }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [carrier, setCarrier] = useState('');
  const [note, setNote] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const order = {
      Amt: Math.round(total),
      Name: name,
      Mobile: mobile.replace(/\D/g, ''),
      Carrier: carrier.slice(0, 8),
      Note: note.slice(0, 100),
      State: t('orderStatus.pending'),
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
        <div className="order-total">
          <strong>{t('confirmOrder.total')}：</strong> <span className="total-price">${total}</span>
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
        <button type="submit" className="confirm-order-button">{t('confirmOrder.submitOrder')}</button>
      </form>
    </div>
  );
};

export default ConfirmOrderPage;
