import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
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
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Collapse,
} from '@mui/material';
import { 
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import InProgressIcon from '@mui/icons-material/Autorenew';
import DoneIcon from '@mui/icons-material/CheckCircle';
import CanceledIcon from '@mui/icons-material/Cancel';
import { ROUTES } from '../../constants/routes';
import { API_ENDPOINTS } from '../../api/endpoints';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { API_KEY } from '../../config/config';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: '#ffffff',
    color: '#000000',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const OrderRow = ({ order, onStateChange }) => {
  const [open, setOpen] = useState(true);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_ORDER_DETAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id: order.id,
          apiKey: API_KEY
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Swal.fire({
        title: '錯誤',
        text: '獲取訂單明失敗',
        icon: 'error',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } ,backgroundColor: 'rgba(0, 0, 0, 0.1)'}} >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{order.orderID}</TableCell>
        <TableCell>{dayjs(order.dateTime).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
        <TableCell>{order.name}</TableCell>
        <TableCell>{order.mobile}</TableCell>
        <TableCell>{order.pickupTime}</TableCell>
        <TableCell>{order.amt}</TableCell>
        <TableCell>
        <Select
          value={order.state}
          onChange={(e) => onStateChange(order.id, e.target.value)}
          size="small"
        >
          <MenuItem value="待處理">
            <ListItemIcon>
              <PendingIcon fontSize="small" sx={{ color: '#1976d2' }} /> {/* 藍色 */}
            </ListItemIcon>
            待處理
          </MenuItem>
          <MenuItem value="處理中">
            <ListItemIcon>
              <InProgressIcon fontSize="small" sx={{ color: '#00796b' }} /> {/* 深綠色 */}
            </ListItemIcon>
            處理中
          </MenuItem>
          <MenuItem value="已完成">
            <ListItemIcon>
              <DoneIcon fontSize="small" sx={{ color: '#388e3c' }} /> {/* 深綠色 */}
            </ListItemIcon>
            已完成
          </MenuItem>
          <MenuItem value="已取消">
            <ListItemIcon>
              <CanceledIcon fontSize="small" sx={{ color: '#d32f2f' }} /> {/* 深紅色 */}
            </ListItemIcon>
            已取消
          </MenuItem>
        </Select>
      </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto">
            <Box sx={{ margin: 1 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>商品編號</TableCell>
                      <TableCell>商品名稱</TableCell>
                      <TableCell>數量</TableCell>
                      <TableCell>小計</TableCell>
                      <TableCell>備註</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell align="left">{detail.prodId}</TableCell>
                        <TableCell align="left">{detail.prodName}</TableCell>
                        <TableCell align="left">{detail.quantity}</TableCell>
                        <TableCell align="left">{detail.subtotal}</TableCell>
                        <TableCell align="left">{detail.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('storeInfo');
  const [storeInfo, setStoreInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [openProductImagePreview, setOpenProductImagePreview] = useState(false);
  const [previewProductImage, setPreviewProductImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth >= 600);
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [orderState, setOrderState] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [orderPage, setOrderPage] = useState(0);
  const [orderRowsPerPage, setOrderRowsPerPage] = useState(10);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [orderIdQuery, setOrderIdQuery] = useState('');

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
        title: '儲存成功！',
        text: '商店資訊儲存成功',
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
        title: '儲存失敗',
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
        // 调用删除背景片的 API
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
  
        // 删除成后再更新状态
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
          title: '刪除異常',
          text: `錯誤：${error.message}`,
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
      }
    }
  };
  

  const menuItems = [
    { text: '管理商店', icon: <StoreIcon />, value: 'storeInfo' },
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_ALL_PRODUCTS, {
        method: 'POST',
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

      await Swal.fire({
        title: '成功',
        text: `「${product.prodName}」已${!currentStatus ? '上架' : '下架'}`,
        icon: 'success',
      });

      fetchProducts(); // 重新獲取商品列表
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
    if (!file) {
      await Swal.fire({
        title: '錯誤',
        text: '請選擇圖片檔案',
        icon: 'error',
      });
      return;
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      await Swal.fire({
        title: '錯誤',
        text: '請選擇圖片檔案',
        icon: 'error',
      });
      return;
    }

    // 檢查檔案大小（例如限制為 5MB）
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
      // 使用查詢參數傳遞 prodId
      const response = await fetch(
        `${API_ENDPOINTS.UPLOAD_PRODUCT_IMAGE}?prodId=${prodId}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to upload image');
      }

      // 取得商品名稱
    const product = products.find(p => p.prodId === prodId);
      const data = await response.json();

      await Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success', 
        title: `「${product.prodName}」片上傳成功`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        backdrop: false,
        customClass: {
          container: 'swal2-toast-container'
        }
      });

      fetchProducts(); // 重新獲取商品列表
    } catch (error) {
      console.error('Error uploading product image:', error);
      await Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: `上傳商品圖片失敗：${error.message}`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        backdrop: false,
        customClass: {
          container: 'swal2-toast-container'
        }
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
      cancelButtonText: '取消',
      customClass: {
        container: 'swal2-container'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_ENDPOINTS.DELETE_PRODUCT_IMAGE}?prodId=${prodId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete image');

        await Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'success', 
          title: '商品圖片已刪除',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          backdrop: false,
          customClass: {
            container: 'swal2-toast-container'
          }
        });

        fetchProducts(); // 重新獲取商品列表
      } catch (error) {
        console.error('Error deleting product image:', error);
        await Swal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'error',
          title: '刪除商品圖片失敗',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          backdrop: false,
          customClass: {
            container: 'swal2-toast-container'
          }
        });
      }
    }
  };

  const handleProductImageClick = (e, imageUrl) => {
    if (!e.target.closest('.MuiIconButton-root')) {
      e.stopPropagation();
      setPreviewProductImage(imageUrl);
      setOpenProductImagePreview(true);
    }
  };

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

  useEffect(() => {
    if (selectedMenu === 'products') {
      fetchProducts();
      fetchCategories();
    }
  }, [selectedMenu]);

  useEffect(() => {
    let filtered = [...products];
    
    // 根據類別過濾
    if (selectedClass) {
      filtered = filtered.filter(product => product.prodClass3Id === selectedClass);
    }
    
    // 根據搜尋詞過濾
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.prodId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.prodName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedClass, searchTerm]);

  const renderProductsTable = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },  // 在小螢幕上垂直排列
        gap: 2 
      }}>
        <TextField
          placeholder="搜商品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            flexGrow: 1,
            width: { xs: '100%', sm: 'auto' }  // 在小螢幕上佔滿寬度
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ 
          minWidth: { xs: '100%', sm: 200 }  // 在小螢幕上佔滿寬度
        }}>
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
                          onClick={(e) => handleProductImageClick(e, product.prodImage)}
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
      />

      <Dialog
        open={openProductImagePreview}
        onClose={() => setOpenProductImagePreview(false)}
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
          onClick={() => setOpenProductImagePreview(false)}
        >
          <img
            src={previewProductImage ? `${API_ENDPOINTS.GET_IMAGE}?fileName=${previewProductImage.replace('/uploads/', '')}&t=${new Date().getTime()}` : ''}
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

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_ORDERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.startOf('day').toISOString(),
          endDate: endDate.endOf('day').toISOString(),
          state: orderState,
          orderId: orderIdQuery.trim(),
          apiKey: API_KEY
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setOrderPage(0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      await Swal.fire({
        title: '錯誤',
        text: '獲取訂單資料失敗',
        icon: 'error',
        position: 'top',
      });
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleUpdateOrderState = async (orderId, newState) => {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_ORDER_STATE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          state: newState,
          apiKey: API_KEY,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order state');
      }

      // 直接更新本地狀態，而不是重新獲取整個列表
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, state: newState }
            : order
        )
      );

      // 使用 toast 樣式的提示，不影響使用者操作
      await Swal.fire({
        title: `訂單狀態更新為「${newState}」`,
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error('Error updating order state:', error);
      await Swal.fire({
        title: '更新失敗',
        text: error.message,
        icon: 'error',
        position: 'top',
      });
    }
  };

  const renderOrdersTable = () => (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: 'center'
      }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="開始日期"
            value={startDate}
            onChange={setStartDate}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
            slotProps={{
              popper: {
                container: document.getElementById('dialog-root'),
                disablePortal: false,
              },
              textField: {
                size: "small",
                onFocus: (e) => e.target.blur(),
              },
            }}
          />
          <DatePicker
            label="結束日期"
            value={endDate}
            onChange={setEndDate}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
            slotProps={{
              popper: {
                container: document.getElementById('dialog-root'),
                disablePortal: false,
              },
              textField: {
                size: "small",
                onFocus: (e) => e.target.blur(),
              },
            }}
          />
        </LocalizationProvider>
        <FormControl sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <InputLabel id="order-state-label">訂單狀態</InputLabel>
          <Select
            labelId="order-state-label"
            value={orderState}
            onChange={(e) => setOrderState(e.target.value)}
            label="訂單狀態"
            size="small"
            sx={{ width: { xs: 'auto', sm: '200px' } }}
          >
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="待處理">待處理</MenuItem>
            <MenuItem value="處理中">處理中</MenuItem>
            <MenuItem value="已完成">已完成</MenuItem>
            <MenuItem value="已取消">已取消</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="訂單編號"
          value={orderIdQuery}
          onChange={(e) => setOrderIdQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
          size="small"
          placeholder="請輸入訂單編號"
        />
        <Button
          variant="contained"
          onClick={fetchOrders}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          查詢
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 'calc(100vh - 300px)',  // 設置最大高度，留出空間給其他元素
          overflow: 'auto'  // 啟用滾動
        }}
      >
        {isOrdersLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>載入訂單資料中...</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow >
                <TableCell />
                <TableCell>訂單編號</TableCell>
                <TableCell>訂購時間</TableCell>
                <TableCell>訂購人</TableCell>
                <TableCell>手機</TableCell>
                <TableCell>取餐時間</TableCell>
                <TableCell>金額</TableCell>
                <TableCell>狀態</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography sx={{ py: 2 }}>
                      無符合條件的訂單
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders
                  .slice(orderPage * orderRowsPerPage, orderPage * orderRowsPerPage + orderRowsPerPage)
                  .map((order) => (
                    <OrderRow 
                      key={order.id} 
                      order={order}
                      onStateChange={handleUpdateOrderState}
                    />
                  ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {!isOrdersLoading && orders.length > 0 && (
        <TablePagination
          component="div"
          count={orders.length}
          page={orderPage}
          onPageChange={(e, newPage) => setOrderPage(newPage)}
          rowsPerPage={orderRowsPerPage}
          onRowsPerPageChange={(e) => {
            setOrderRowsPerPage(parseInt(e.target.value, 10));
            setOrderPage(0);
          }}
          labelRowsPerPage="每頁顯示筆數"
          labelDisplayedRows={({ from, to, count }) => 
            `第 ${from}-${to} 筆，共 ${count} 筆`
          }
        />
      )}
    </Box>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'storeInfo':
        return renderStoreInfoForm();
      case 'products':
        return renderProductsTable();
      case 'orders':
        return renderOrdersTable();
      default:
        return null;
    }
  };

  // 處理登出
  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  useEffect(() => {
    const handleResize = () => {
      // 根據螢幕寬度決定選單是否顯示
      setDrawerOpen(window.innerWidth >= 600);
    };

    // 監聽視窗大小變化
    window.addEventListener('resize', handleResize);

    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 修改選單項目點擊處理函數
  const handleMenuItemClick = (value) => {
    setSelectedMenu(value);
    // 在手機版時自動隱藏選單
    if (window.innerWidth < 600) {
      setDrawerOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBarStyled position="fixed" open={drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
            edge="start"
            sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {storeInfo?.storeName ? `${storeInfo.storeName} - 後台管理系統` : '後台管理系統'}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="登出">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.value}
              selected={selectedMenu === item.value}
              onClick={() => handleMenuItemClick(item.value)}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={drawerOpen}>
        <DrawerHeader />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {menuItems.find(item => item.value === selectedMenu)?.text}
          </Typography>
          {renderContent()}
        </Box>
      </Main>
    </Box>
  );
};

export default AdminDashboard; 