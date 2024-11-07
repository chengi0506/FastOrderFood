import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Switch,
  IconButton,
  InputAdornment,
  Dialog,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../../api/endpoints';
import { API_KEY } from '../../config/config';
import Swal from 'sweetalert2';
import noImage from '../../assets/no-image.png';
import { ROUTES } from '../../constants/routes';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate(ROUTES.ADMIN_LOGIN);
    }
    fetchCategories();
    fetchProducts();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_PROD_CLASS);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: API_KEY
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      await Swal.fire({
        title: '錯誤',
        text: '獲取商品資料失敗',
        icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (prodId, currentStatus) => {
    try {
      const url = `${API_ENDPOINTS.UPDATE_PRODUCT_STATUS}?prodId=${prodId}&isEnabled=${!currentStatus}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update status');
      }

      // 取得商品名稱
      const product = products.find(p => p.prodId === prodId);

      // 直接更新本地狀態，而不是重新獲取
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.prodId === prodId 
            ? { ...p, isEnlable: !currentStatus }
            : p
        )
      );

      await Swal.fire({
        title: '成功',
        text: `「${product.prodName}」已${!currentStatus ? '上架' : '下架'}`,
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      await Swal.fire({
        title: '錯誤',
        text: `更新商品狀態失敗：${error.message}`,
        icon: 'error',
      });
    }
  };

  const handleProductImageUpload = async (prodId, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await Swal.fire({
        title: '錯誤',
        text: '請選擇圖片文件',
        icon: 'error',
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      await Swal.fire({
        title: '錯誤',
        text: '圖片大小不能超過 5MB',
        icon: 'error',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${API_ENDPOINTS.UPLOAD_PRODUCT_IMAGE}?prodId=${prodId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();

      // 直接更新本地狀態，而不是重新獲取
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.prodId === prodId 
            ? { ...p, prodImage: `${data.fileName}` }
            : p
        )
      );

      // 取得商品名稱
      const product = products.find(p => p.prodId === prodId);

      await Swal.fire({
        title: '成功',
        text: `「${product.prodName}」圖片上傳成功`,
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error uploading product image:', error);
      await Swal.fire({
        title: '錯誤',
        text: '上傳商品圖片失敗',
        icon: 'error',
      });
    }
  };

  const handleDeleteProductImage = async (prodId) => {
    const result = await Swal.fire({
      title: '確認刪除',
      text: '確定要刪除此商品圖片嗎？',
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
          `${API_ENDPOINTS.DELETE_PRODUCT_IMAGE}?prodId=${prodId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Failed to delete image');

        // 直接更新本地狀態，而不是重新獲取
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.prodId === prodId 
              ? { ...p, prodImage: null }
              : p
          )
        );

        // 取得商品名稱
        const product = products.find(p => p.prodId === prodId);

        await Swal.fire({
          title: '成功',
          text: `「${product.prodName}」圖片已刪除`,
          icon: 'success',
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error('Error deleting product image:', error);
        await Swal.fire({
          title: '錯誤',
          text: '刪除商品圖片失敗',
          icon: 'error',
        });
      }
    }
  };

  const handleImageClick = (e, imageUrl) => {
    if (!e.target.closest('.MuiIconButton-root')) {
      e.stopPropagation();
      setPreviewImage(imageUrl);
      setOpenPreview(true);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.prodId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedClass === '' || product.prodClass3Id === selectedClass;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center'
      }}>
        <TextField
          placeholder="搜尋商品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>商品類別</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            label="商品類別"
          >
            <MenuItem value="">
              <em>全部類別</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.prodClass3Id} value={category.prodClass3Id}>
                {category.prodClass3Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>商品代號</TableCell>
                <TableCell>商品名稱</TableCell>
                <TableCell>售價</TableCell>
                <TableCell>庫存</TableCell>
                <TableCell>單位</TableCell>
                <TableCell>商品圖片</TableCell>
                <TableCell>上架</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.prodId}>
                    <TableCell>{product.prodId}</TableCell>
                    <TableCell>{product.prodName}</TableCell>
                    <TableCell>{product.priceStd}</TableCell>
                    <TableCell>{product.qtyNow}</TableCell>
                    <TableCell>{product.stdUnit}</TableCell>
                    <TableCell>
                      {product.prodImage ? (
                        <Box sx={{ 
                          position: 'relative', 
                          display: 'inline-block',
                          cursor: 'pointer',
                          '&:hover': {
                            '&::after': {
                              content: '"點擊放大"',
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              right: '0',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              fontSize: '12px',
                              padding: '2px',
                              textAlign: 'center',
                            }
                          }
                        }}>
                          <img
                            src={`${API_ENDPOINTS.GET_IMAGE}?fileName=${product.prodImage.replace('/uploads/', '')}`}

                            alt={product.prodName}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            onClick={(e) => handleImageClick(e, product.prodImage)}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProductImage(product.prodId)}
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)'
                              }
                            }}
                          >
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                        >
                          上傳圖片
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(product.prodId, e.target.files[0])}
                          />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isEnlable}
                        onChange={() => handleToggleStatus(product.prodId, product.isEnlable)}
                      />
                    </TableCell>
                    <TableCell>
                      {product.prodImage && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProductImage(product.prodId)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="每頁顯示筆數"
        labelDisplayedRows={({ from, to, count }) => 
          `第 ${from}-${to} 筆，共 ${count} 筆`
        }
      />

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
          onClick={() => setOpenPreview(false)}
        >
          <img
            src={previewImage ? `${API_ENDPOINTS.GET_IMAGE}?fileName=${previewImage.replace('/uploads/', '')}&t=${new Date().getTime()}` : ''}
            alt="商品圖片預覽"
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

export default ProductManagement;