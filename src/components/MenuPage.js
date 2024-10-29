import React, { useState, useEffect, useRef } from 'react';
import MenuItem from './MenuItem';
import Cart from './Cart';
import LanguageSelector from './LanguageSelector';
import fastIcon from '../assets/logo.png';
import { API_ENDPOINTS } from '../api/endpoints';
import { useTranslation } from 'react-i18next';

function MenuPage({ cart, addToCart, onError, updatePickupTime }) {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const headerRef = useRef(null);
  const [pickupTimes, setPickupTimes] = useState([]);
  const [pickupTime, setPickupTime] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [detailsHeight, setDetailsHeight] = useState('100px');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    generatePickupTimes();
    fetchStoreInfo();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchAllProducts();
    }
  }, [categories]);

  useEffect(() => {
    filterItems();
  }, [searchTerm, activeCategory, allMenuItems]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        setDetailsHeight('0');
      } else {
        setDetailsHeight('100px');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const generatePickupTimes = () => {
    const now = new Date();
    const times = [];
    for (let i = 0; i < 12; i++) {
      const time = new Date(now.getTime() + (i + 1) * 10 * 60000);
      const formattedTime = time.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      times.push(formattedTime);
    }
    setPickupTimes(times);
    setPickupTime(times[0]); // 設置默認選中時間為第一個選項
    updatePickupTime(times[0]); // 更新 App 組件中的取餐時間
  };

  const handlePickupTimeChange = (event) => {
    const selectedTime = event.target.value;
    setPickupTime(selectedTime);
    updatePickupTime(selectedTime);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_PROD_CLASS);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCategories(data);
      if (data.length > 0) {
        setActiveCategory(data[0].prodClass3Id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const allProducts = await Promise.all(
        categories.map(category =>
          fetch(API_ENDPOINTS.GET_PRODUCTS_BY_CLASS(category.prodClass3Id))
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
        )
      );
      const formattedData = allProducts.flat().map(item => ({
        id: item.prodId,
        name: item.prodName,
        price: item.priceStd,
        category: item.prodClass3Id,
        unit: item.stdUnit
      }));
      setAllMenuItems(formattedData);
    } catch (error) {
      console.error('Error fetching all products:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filteredItems = allMenuItems;

    if (searchTerm) {
      filteredItems = allMenuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (activeCategory) {
      filteredItems = allMenuItems.filter(item => item.category === activeCategory);
    }

    setDisplayedItems(filteredItems);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setSearchTerm('');
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setActiveCategory('');
  };

  const fetchStoreInfo = async () => {
    try {
      //console.log(API_ENDPOINTS.GET_STORE_INFO);
      const response = await fetch(API_ENDPOINTS.GET_STORE_INFO);
      //console.log('Response:', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      //console.log('Fetched store info:', data); // 添加這行來記錄獲取的商店信息
      setStoreInfo(data[0]);
    } catch (error) {
      console.error('Error fetching store info:', error);
      onError(error);
    }
  };

  // 新增一個函數來檢查商品是否在購物車中
  const isItemInCart = (itemId) => {
    return cart.some(cartItem => cartItem.id === itemId);
  };

  // 修改這個函數來返回購物車中該商品的數量
  const getCartItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="menu-page">
      <header ref={headerRef} className="top-nav sticky-header">
        <div className="header-content">
          <div className="logo-and-store-info">
            <img src={fastIcon} alt={t('fastFoodIcon')} className="header-icon" />
            {storeInfo && (
              <div className="store-info">
                <h2>{storeInfo.storeName}</h2>
                <div 
                  className="store-details" 
                  style={{
                    maxHeight: detailsHeight,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-out'
                  }}
                >
                  <p>{t('address')}: {storeInfo.storeAddress}</p>
                  <p>{t('phone')}: {storeInfo.storeContactTel}</p>
                  <p>{t('businessHours')}: {storeInfo.storeBusinessHours}</p>
                </div>
              </div>
            )}
          </div>
          <div className="language-selector-container">
            <LanguageSelector />
          </div>
        </div>
        <div className="categories-container">
          <nav className="categories-nav">
            <ul>
              {categories.map(category => (
                <li 
                  key={category.prodClass3Id}
                  className={activeCategory === category.prodClass3Id ? 'active' : ''}
                  onClick={() => handleCategoryClick(category.prodClass3Id)}
                >
                  {category.prodClass3Name}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="search-and-pickup-container">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder={t('searchAllProducts')} 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="pickup-time-selector">
            <select id="pickup-time" value={pickupTime} onChange={handlePickupTimeChange}>
              {pickupTimes.map((time, index) => (
                <option key={index} value={time}>
                  {t('pickupTime')} | {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div className="menu-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">{t('loadingProducts')}</div>
          </div>
        ) : (
          <>
            <h2 className="category-title">
              {searchTerm ? t('searchResults', { searchTerm }) : categories.find(c => c.prodClass3Id === activeCategory)?.prodClass3Name}
            </h2>
            <div className="menu-items">
              {displayedItems.map(item => (
                <MenuItem 
                  key={item.id} 
                  item={item} 
                  addToCart={addToCart} 
                  isInCart={isItemInCart(item.id)}
                  cartQuantity={getCartItemQuantity(item.id)}
                />
              ))}
            </div>
            {displayedItems.length === 0 && <p className="no-results">{t('noProductsFound')}</p>}
          </>
        )}
      </div>
      <Cart items={cart} />
    </div>
  );
}

export default MenuPage;
