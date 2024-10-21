import React from 'react';
import { Link } from 'react-router-dom';

function ErrorPage() {
  return (
    <div className="error-page">
      <h1>連線異常</h1>
      <p>很抱歉，目前系統無法使用請稍後再試。</p>
      <Link to="/" className="checkout-button">返回首頁</Link>
    </div>
  );
}

export default ErrorPage;
