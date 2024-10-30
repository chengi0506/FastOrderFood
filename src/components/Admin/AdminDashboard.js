import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { ROUTES } from '../../constants/routes';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 檢查是否已登入
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
  }, [navigate]);

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          管理者儀表板
        </Typography>
        {/* 這裡可以添加管理功能 */}
      </Box>
    </Container>
  );
};

export default AdminDashboard; 