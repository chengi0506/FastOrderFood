import React, { useState, useEffect, useRef } from 'react';
import MenuItem from './MenuItem';
import Cart from './Cart';
import LanguageSelector from './LanguageSelector';
import fastIcon from '../assets/logo.png';
import { API_ENDPOINTS } from '../api/endpoints';
import { useTranslation } from 'react-i18next';

function MenuPage({ cart, addToCart, onError }) {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const headerRef = useRef(null);

  useEffect(() => {
    fetchCategories();
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
      if (headerRef.current) {
        if (window.scrollY > 0) {
          headerRef.current.classList.add('scrolled');
        } else {
          headerRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchCategories = async () => {
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

  return (
    <div className="menu-page">
      <header ref={headerRef} className="top-nav sticky-header">
        <div className="header-content">
          <div className="placeholder"></div>
          <div className="logo-container">
            <img src={fastIcon} alt={t('fastFoodIcon')} className="header-icon" />
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
        <div className="search-bar">
          <input 
            type="text" 
            placeholder={t('searchAllProducts')} 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </header>
      <div className="menu-content">
        <h2 className="category-title">
          {searchTerm ? t('searchResults', { searchTerm }) : categories.find(c => c.prodClass3Id === activeCategory)?.prodClass3Name}
        </h2>
        <div className="menu-items">
          {displayedItems.map(item => (
            <MenuItem key={item.id} item={item} addToCart={addToCart} />
          ))}
        </div>
        {displayedItems.length === 0 && <p className="no-results">{t('noProductsFound')}</p>}
      </div>
      <Cart items={cart} />
    </div>
  );
}

export default MenuPage;
