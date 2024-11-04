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
  CircularProgress,
  Dialog,
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

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
      setIsLoading(true);
      let backgroundImage = storeInfo.backgroundImage;

      if (selectedFile) {
        const fileName = await uploadImage();
        if (fileName) {
          backgroundImage = `/uploads/${fileName}`;
        }
      }

      const updatedStoreInfo = {
        ...storeInfo,
        backgroundImage
      };

      const response = await fetch(API_ENDPOINTS.UPDATE_STORE_INFO, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStoreInfo)
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      await Swal.fire({
        title: '更新成功！',
        text: '商店資訊已成功更新',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchStoreInfo();

    } catch (error) {
      console.error('Error updating store info:', error);
      await Swal.fire({
        title: '更新失敗',
        text: `錯誤：${error.message}`,
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        title: '錯誤',
        text: '請選擇圖片文件！',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        title: '錯誤',
        text: '圖片大小不能超過 5MB！',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(previewUrl);
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.UPLOAD_BACKGROUND}?storeId=${storeInfo.storeId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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
        // 调用删除背景图片的 API
        const deleteResponse = await fetch(
          `${API_ENDPOINTS.DELETE_BACKGROUND}?storeId=${storeInfo.storeId}`,
          {
            method: 'DELETE',
          }
        );
  
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.text();
          console.error('Delete error details:', errorData);
          throw new Error(errorData || 'Delete failed');
        }
  
        // 删除成功后再更新状态
        setStoreInfo((prevInfo) => ({
          ...prevInfo,
          backgroundImage: '',
        }));
  
        await Swal.fire({
          title: '刪除成功！',
          text: '背景圖片已成功刪除',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
  
        // 更新商店信息
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

  const handleClearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleImageClick = (e) => {
    if (!e.target.closest('.MuiIconButton-root') && !isLoading) {
      e.stopPropagation();
      setOpenPreview(true);
    }
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

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
            {(previewUrl || storeInfo?.backgroundImage) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {previewUrl ? '預覽圖片：' : '當前背景圖片：'}
                </Typography>
                <Box 
                  onClick={handleImageClick}
                  sx={{ 
                    position: 'relative', 
                    display: 'inline-block',
                    '&:hover .image-overlay': {
                      opacity: 1
                    },
                    cursor: 'pointer'
                  }}
                >
                  {isLoading ? (
                    <Box sx={{
                      width: '200px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px'
                    }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <img
                        src={previewUrl || `${API_ENDPOINTS.GET_IMAGE}?fileName=${storeInfo.backgroundImage.replace('/uploads/', '')}&t=${new Date().getTime()}`}
                        alt={previewUrl ? "預覽圖片" : "背景圖片"}
                        style={{ 
                          maxWidth: '200px', 
                          height: 'auto',
                          display: 'block',
                          borderRadius: '4px'
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
                          onClick={(e) => {
                            e.stopPropagation();
                            previewUrl ? handleClearPreview() : handleDeleteBackground();
                          }}
                          title={previewUrl ? "清除預覽圖片" : "刪除背景圖片"}
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
                    </>
                  )}
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadIcon />}
              >
                選擇背景圖片
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Box>
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

      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
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
          onClick={handleClosePreview}
        >
          <img
            src={previewUrl || `${API_ENDPOINTS.GET_IMAGE}?fileName=${storeInfo?.backgroundImage?.replace('/uploads/', '')}&t=${new Date().getTime()}`}
            alt="放大圖片"
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