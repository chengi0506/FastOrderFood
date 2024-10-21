import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import '../styles/OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { orderTime, orderNumber } = location.state || {};

  return (
    <div className="order-confirmation-container">
      <div className="order-confirmation-card">
        <FaCheckCircle className="success-icon" />
        <h2>訂單成立</h2>
        <p className="thank-you-message">感謝您的訂購!</p>
        <div className="order-details">
          <p><strong>訂單時間:</strong> {orderTime}</p>
          <p><strong>訂單編號:</strong> {orderNumber}</p>
        </div>
        <p className="confirmation-message">
          我們已收到您的訂單,並將盡快處理。您可以使用訂單編號查詢訂單狀態。
        </p>
        <div className="action-buttons">
          <Link to="/menu" className="button primary-button">
            繼續購物
          </Link>
          <Link to="/" className="button secondary-button">
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
