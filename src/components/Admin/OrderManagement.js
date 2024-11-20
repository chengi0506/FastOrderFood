import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  Typography, 
  Box,
  Paper,
  ListItemIcon,
  TextField,
  Button,
  IconButton,
  CircularProgress,
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
  Collapse,
} from '@mui/material';
import { 
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import InProgressIcon from '@mui/icons-material/Autorenew';
import DoneIcon from '@mui/icons-material/CheckCircle';
import CanceledIcon from '@mui/icons-material/Cancel';
import { API_ENDPOINTS } from '../../api/endpoints';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { API_KEY } from '../../config/config';
import { ROUTES } from '../../constants/routes';

const OrderManagement = () => {
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
    fetchOrders();
  }, [navigate]);

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
          orderID: orderIdQuery.trim(),
          apiKey: API_KEY
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(errorData || 'Failed to fetch orders');
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

      // 找到對應的訂單以獲取訂單編號
      const updatedOrder = orders.find(order => order.id === orderId);

      // 直接更新本地狀態，而不是重新獲取整個列表
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, state: newState }
            : order
        )
      );

      // 狀態更新成功 toast 提示
      await Swal.fire({
        title: '狀態更新成功',
        text: `訂單 「${updatedOrder.orderID} 」狀態更新為「${newState}」`,
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

   const OrderRow = ({ order, onStateChange }) => {
    const [open, setOpen] = useState(true);
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (open) {
        fetchDetails();
      }
    }, [open]);
  
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
        
        // 添加延遲
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        Swal.fire({
          title: '錯誤',
          text: '獲取訂單明細失敗',
          icon: 'error',
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
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
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 2,
                    minHeight: '100px'
                  }}>
                    <CircularProgress size={30} />
                    <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>
                      載入中...
                    </Typography>
                  </Box>
                ) : (
                  <>
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
                        <TableRow 
                          sx={{
                            '& td': { 
                              fontWeight: 'bold',
                              borderTop: '2px solid rgba(224, 224, 224, 1)',
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            } 
                          }}
                        >
                          <TableCell colSpan={2} align="right" sx={{ fontSize: '1.2rem' }}>合計：</TableCell>
                          <TableCell align="left" sx={{ fontSize: '1.2rem' }}>
                            {details.reduce((sum, detail) => sum + detail.quantity, 0)} 件
                          </TableCell>
                          <TableCell align="left" sx={{ fontSize: '1.2rem' }}>
                            ${details.reduce((sum, detail) => sum + detail.subtotal, 0)}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
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
};

export default OrderManagement;