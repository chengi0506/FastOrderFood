import React, { useState, useEffect,  } from 'react';
import { useNavigate } from 'react-router-dom';
import fastIcon from '../../assets/logo.png';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { ROUTES } from '../../constants/routes';


const AdminLogin = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === '123' && password === '123') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else {
      Swal.fire({
        title: '錯誤',
        text: `用戶名或密碼錯誤！`,
        icon: 'error',
      });
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_STORE_INFO);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStoreInfo(data[0]);
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            <div className="logo-and-store-info">
              <img src={fastIcon} alt={t('fastFoodIcon')} className="header-icon" />
              {storeInfo && (
                <div className="store-info">
                  <h2>{storeInfo.storeName}-後台管理系統</h2>
                  <div className="store-details">
                    <p>{t('address')}: {storeInfo.storeAddress}</p>
                    <p>{t('phone')}: {storeInfo.storeContactTel}</p>
                    <p>{t('businessHours')}: {storeInfo.storeBusinessHours}</p>
                  </div>
                </div>
              )}
            </div>
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="請輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              inputProps={{
                'aria-label': '帳號',
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="請輸入密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              inputProps={{
                'aria-label': '密碼',
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              登入
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin; 