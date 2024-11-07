import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  Typography,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../../api/endpoints';
import { API_KEY } from '../../config/config';
import Swal from 'sweetalert2';

const StoreManagement = () => {
  const navigate = useNavigate();
  const [storeInfo, setStoreInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/FastOrderFood/Admin/');
      return;
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

  const handleClosePreview = () => {
    setOpenPreview(false);
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

    const maxSize = 5 * 1024 * 1024;
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

  const handleImageClick = (e) => {
    if (!e.target.closest('.MuiIconButton-root')) {
      e.stopPropagation();
      setOpenPreview(true);
    }
  };

  const handleClearPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
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
        const response = await fetch(
          `${API_ENDPOINTS.DELETE_BACKGROUND}?storeId=${storeInfo.storeId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Delete failed');
        }

        await Swal.fire({
          title: '成功',
          text: '背景圖片已刪除',
          icon: 'success',
          position: 'top',
        });

        fetchStoreInfo();
      } catch (error) {
        console.error('Error deleting background:', error);
        await Swal.fire({
          title: '錯誤',
          text: '刪除背景圖片失敗',
          icon: 'error',
          position: 'top',
        });
      }
    }
  };

  const handleStoreInfoUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let backgroundImage = storeInfo.backgroundImage;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('storeId', storeInfo.storeId);

        const uploadResponse = await fetch(
          `${API_ENDPOINTS.UPLOAD_BACKGROUND}?storeId=${storeInfo.storeId}`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const uploadData = await uploadResponse.json();
        backgroundImage = `/uploads/${uploadData.fileName}`;
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

  return (
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
            variant="contained"
            color="error"
            sx={{ 
              mt: 2,
              width: 'auto',
              px: 4,
              py: 1,
              float: 'right'
            }}
          >
            儲存
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
        container={() => document.getElementById('dialog-root')}
        disablePortal={false}
        disableEnforceFocus
        disableAutoFocus
        keepMounted
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
};

export default StoreManagement;