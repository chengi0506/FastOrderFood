import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import noImage from '../assets/no-image.png';
import { API_ENDPOINTS } from '../api/endpoints';
import { Dialog, Box, Typography } from '@mui/material';

function MenuItem({ item, addToCart, isInCart, cartQuantity }) {
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(item.price);
  const [openPreview, setOpenPreview] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setSubtotal(item.price * quantity);
  }, [quantity, item.price]);

  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity > 1 ? prevQuantity - 1 : 1);
  };

  const handleAddToCart = () => {
    const currentQuantity = isInCart ? cartQuantity + quantity : quantity;
    addToCart({ ...item, quantity: currentQuantity });
    
    Swal.fire({
      icon: 'success',
      title: t('addedToCart'),
      text: `${item.name} x ${quantity}`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });

    setQuantity(1);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setOpenPreview(true);
  };

  return (
    <div className="menu-item">
      {isInCart && (
        <div className="cart-quantity-badge">
          {cartQuantity}
        </div>
      )}
      <div 
        className="menu-item-image"
        onClick={handleImageClick}
        style={{ cursor: 'pointer' }}
      >
        <img 
          src={item.prodImage ? 
            `${API_ENDPOINTS.GET_IMAGE}?fileName=${item.prodImage.replace('/uploads/', '')}` : 
            noImage
          } 
          alt={item.name}
          onError={(e) => {
            e.target.src = noImage;
          }}
        />
      </div>
      <h2>{item.name}</h2>
      <h3>${item.price} /{item.unit}</h3>
      <div className="quantity-control">
        <button onClick={decreaseQuantity}>-</button>
        <span>{quantity}</span>
        <button onClick={increaseQuantity}>+</button>
      </div>
      <button className="add-to-cart" onClick={handleAddToCart}>
        <span className="quantity-badge">{quantity}</span>
        {t('addToCart')}
        <span className="subtotal-badge">${subtotal}</span>
      </button>

      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'transparent',
            p: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setOpenPreview(false)}
        >
          <img
            src={item.prodImage ? 
              `${API_ENDPOINTS.GET_IMAGE}?fileName=${item.prodImage.replace('/uploads/', '')}&t=${new Date().getTime()}` : 
              noImage
            }
            alt={item.name}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <Typography
            sx={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            點擊任意處關閉
          </Typography>
        </Box>
      </Dialog>
    </div>
  );
}

export default MenuItem;
