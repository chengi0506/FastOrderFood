import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import ErrorPage from './components/ErrorPage';
import WelcomePage from './components/WelcomePage';
import ConfirmOrderPage from './components/ConfirmOrderPage';
import Footer from './components/Footer';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import LanguageSelector from './components/LanguageSelector';
import './styles/MenuPage.css';
import './styles/App.css';
import { useTranslation } from 'react-i18next';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();
  const [cart, setCart] = useState(() => {
    // 從 localStorage 中讀取購物車內容
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [error, setError] = useState(null);
  const [pickupTime, setPickupTime] = useState(() => {
    // 從 localStorage 中讀取取餐時間
    return localStorage.getItem('pickupTime') || '';
  });

  // 當購物車內容變化時，將其保存到 localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // 當取餐時間變化時，將其保存到 localStorage
  useEffect(() => {
    localStorage.setItem('pickupTime', pickupTime);
  }, [pickupTime]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      if (existingItemIndex !== -1) {
        // 如果商品已經在購物車中，替換數量而不是增加
        const updatedCart = [...prevCart];
        //console.log('現有數量:', updatedCart[existingItemIndex].quantity);
        //console.log('新增數量:', item.quantity);
        updatedCart[existingItemIndex].quantity = item.quantity;
        //console.log('更新後數量:', updatedCart[existingItemIndex].quantity);
        return updatedCart;
      } else {
        // 如果是新商品，直接添加到購物車
        //console.log('新增商品數量:', item.quantity);
        return [...prevCart, item];
      }
    });
  };
  

  const removeFromCart = (index) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  const updateCartItemQuantity = (index, newQuantity) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      newCart[index].quantity = newQuantity;
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    // 清空購物車時也清除取餐時間
    setPickupTime('');
    localStorage.removeItem('pickupTime');
  };

  const handleError = (error) => {
    setError(error);
  };

  const updatePickupTime = (time) => {
    setPickupTime(time);
  };

  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/menu" element={
            <MenuPage 
              cart={cart} 
              addToCart={addToCart} 
              onError={handleError}
              updatePickupTime={updatePickupTime}
              pickupTime={pickupTime}
            />
          } />
          <Route path="/cart" element={
            <CartPage 
              items={cart} 
              removeFromCart={removeFromCart} 
              updateCartItemQuantity={updateCartItemQuantity}
              clearCart={clearCart}
            />
          } />
          <Route path="/confirm-order" element={
            <ConfirmOrderPage 
              cart={cart}
              clearCart={clearCart}
              pickupTime={pickupTime}
              updatePickupTime={updatePickupTime}
            />
          } />
          <Route path="/error" element={<ErrorPage error={error} />} />
          <Route 
            path="/order-confirmation" 
            element={<OrderConfirmationPage />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
