import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Container, 
  Typography, 
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { 
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ROUTES } from '../../constants/routes';
import { API_ENDPOINTS } from '../../api/endpoints';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('storeInfo');
  const [storeInfo, setStoreInfo] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
    fetchStoreInfo();
  }, [navigate]);

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_STORE_INFO);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setStoreInfo(data[0]);
    } catch (error) {
      console.error('Error fetching store info:', error);
    }
  };

  const handleStoreInfoUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_STORE_INFO, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeInfo),
      });
      if (!response.ok) throw new Error('Update failed');
      alert('商店資訊更新成功！');
    } catch (error) {
      console.error('Error updating store info:', error);
      alert('更新失敗，請稍後再試。');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await Swal.fire({
        title: '錯誤',
        text: '請選擇圖片文件！',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await Swal.fire({
        title: '錯誤',
        text: '圖片大小不能超過 5MB！',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const loadingSwal = Swal.fire({
      title: '上傳中...',
      text: '請稍候',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', storeInfo.storeId);

    try {
      const response = await fetch(`${API_ENDPOINTS.UPLOAD_BACKGROUND}?storeId=${storeInfo.storeId}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Upload error details:', errorData);
        throw new Error(errorData || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.fileName) {
        const updatedStoreInfo = {
          ...storeInfo,
          backgroundImage: `/uploads/${data.fileName}`
        };
        setStoreInfo(updatedStoreInfo);
        setBackgroundImage(data.fileName);

        await loadingSwal.close();

        await Swal.fire({
          title: '上傳成功！',
          html: `
            <div style="margin-top: 20px;">
              <img 
                src="${API_ENDPOINTS.GET_IMAGE}?fileName=${data.fileName}" 
                alt="新上傳的背景圖片"
                style="max-width: 100%; max-height: 300px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
              />
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });

        await fetchStoreInfo();
      } else {
        throw new Error('未收到檔案名稱');
      }
    } catch (error) {
      await loadingSwal.close();

      console.error('Error uploading image:', error);
      await Swal.fire({
        title: '上傳失敗',
        text: `錯誤：${error.message}`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    }
  };

  const handleDeleteBackground = async () => {
    if (!storeInfo?.backgroundImage) {
      await Swal.fire({
        title: '錯誤',
        text: '沒有背景圖片可以刪除',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const result = await Swal.fire({
      title: '確認刪除',
      text: '您確定要刪除背景圖片嗎？',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '刪除',
      cancelButtonText: '取消'
    });

    if (result.isConfirmed) {
      try {
        const updatedStoreInfo = {
          ...storeInfo,
          backgroundImage: ''
        };

        const updateResponse = await fetch(API_ENDPOINTS.UPDATE_STORE_INFO, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedStoreInfo)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.text();
          console.error('Update error details:', errorData);
          throw new Error(errorData || 'Update failed');
        }

        const deleteResponse = await fetch(
          `${API_ENDPOINTS.DELETE_BACKGROUND}?storeId=${storeInfo.storeId}`, 
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.text();
          console.error('Delete error details:', errorData);
          throw new Error(errorData || 'Delete failed');
        }

        setStoreInfo(updatedStoreInfo);
        setBackgroundImage('');

        await Swal.fire({
          title: '刪除成功！',
          text: '背景圖片已成功刪除',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });

        await fetchStoreInfo();
      } catch (error) {
        console.error('Error deleting background:', error);
        await Swal.fire({
          title: '刪除失敗',
          text: `錯誤：${error.message}`,
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };

  const menuItems = [
    { text: '管理商店資訊', icon: <StoreIcon />, value: 'storeInfo' },
    { text: '管理商品', icon: <InventoryIcon />, value: 'products' },
    { text: '管理訂單', icon: <OrderIcon />, value: 'orders' },
  ];

  const renderStoreInfoForm = () => (
    <Box component="form" onSubmit={handleStoreInfoUpdate} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="商店名稱"
            value={storeInfo?.storeName || ''}
            onChange={(e) => setStoreInfo({...storeInfo, storeName: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="商店地址"
            value={storeInfo?.storeAddress || ''}
            onChange={(e) => setStoreInfo({...storeInfo, storeAddress: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="商店電話"
            value={storeInfo?.storeContactTel || ''}
            onChange={(e) => setStoreInfo({...storeInfo, storeContactTel: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="營業時間"
            value={storeInfo?.storeBusinessHours || ''}
            onChange={(e) => setStoreInfo({...storeInfo, storeBusinessHours: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {storeInfo?.backgroundImage && (
              <Box sx={{ 
                mb: 2,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5'
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  當前背景圖片：
                </Typography>
                <Box sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto',
                  '&:hover .image-overlay': {
                    opacity: 1
                  }
                }}>
                  <img
                    src={`${API_ENDPOINTS.GET_IMAGE}?fileName=${storeInfo.backgroundImage.replace('/uploads/', '')}`}
                    alt="背景圖片"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                  <Box className="image-overlay" sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    borderRadius: '4px'
                  }}>
                    <IconButton 
                      color="error" 
                      onClick={handleDeleteBackground}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              justifyContent: 'center',
              mt: 2 
            }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                上傳背景圖片
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
            <Typography variant="caption" align="center" color="textSecondary" sx={{ mt: 1 }}>
              建議圖片尺寸: 1920x1080 像素，檔案大小不超過 5MB
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            更新商店資訊
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'storeInfo':
        return renderStoreInfoForm();
      case 'products':
        return <Typography>商品管理功能開發中...</Typography>;
      case 'orders':
        return <Typography>訂單管理功能開發中...</Typography>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ mt: 4 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  key={item.value}
                  selected={selectedMenu === item.value}
                  onClick={() => setSelectedMenu(item.value)}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {menuItems.find(item => item.value === selectedMenu)?.text}
            </Typography>
            {renderContent()}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 