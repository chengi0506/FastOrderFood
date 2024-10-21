import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import ErrorPage from './components/ErrorPage';
import WelcomePage from './components/WelcomePage';
import ConfirmOrderPage from './components/ConfirmOrderPage';
import Footer from './components/Footer';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import './styles/MenuPage.css';

function App() {
  const [cart, setCart] = useState(() => {
    // 從 localStorage 中讀取購物車內容
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [error, setError] = useState(null);

  // 當購物車內容變化時，將其保存到 localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      if (existingItemIndex !== -1) {
        // 如果商品已經在購物車中，更新數量
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // 如果是新商品，直接添加到購物車
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
  };

  const handleError = (error) => {
    setError(error);
  };

  return (
    <div className="App">
      <div className="content">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/menu" element={
            <MenuPage 
              cart={cart} 
              addToCart={addToCart} 
              onError={handleError}
            />
          } />
          <Route path="/cart" element={
            <CartPage 
              items={cart} 
              removeFromCart={removeFromCart} 
              updateCartItemQuantity={updateCartItemQuantity}
            />
          } />
          <Route path="/confirm-order" element={
            <ConfirmOrderPage 
              cart={cart}
              clearCart={clearCart}
            />
          } />
          <Route path="/error" element={<ErrorPage error={error} />} />
          <Route 
            path="/order-confirmation" 
            element={<OrderConfirmationPage />} 
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
