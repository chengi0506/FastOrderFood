import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  Logout as LogoutIcon,
  QrCode as QrCodeIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ROUTES } from '../../constants/routes';
import { API_ENDPOINTS } from '../../api/endpoints';
import { API_KEY } from '../../config/config';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [orderStats, setOrderStats] = useState([]);
  const [orderStatusStats, setOrderStatusStats] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // 獲取本月第一天和最後一天
  const getMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString(),
      end: lastDay.toISOString()
    };
  };

  // 格式化日期為西元年月
  const formatDateToYearMonth = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`;
  };

  const fetchDashboardStats = async () => {
    try {
      // 獲取商品統計
      const productResponse = await fetch(API_ENDPOINTS.GET_PRODUCT_STATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: API_KEY }),
      });

      if (!productResponse.ok) {
        throw new Error(`商品統計請求失敗: ${productResponse.status}`);
      }

      const productData = await productResponse.json();
      setProductStats(productData);

      // 獲取本月訂單統計
      const monthRange = getMonthRange();
      const orderResponse = await fetch(API_ENDPOINTS.GET_ORDER_STATS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: monthRange.start,
          endDate: monthRange.end,
          apiKey: API_KEY
        }),
      });

      if (!orderResponse.ok) {
        throw new Error(`訂單統計請求失敗: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();
      
      if (orderData && orderData.dailyStats && orderData.statusStats) {
        setOrderStats(orderData.dailyStats);
        setOrderStatusStats(orderData.statusStats);
        
        // 設置日期範圍，使用新的格式化函數
        setDateRange({
          start: formatDateToYearMonth(monthRange.start),
          end: formatDateToYearMonth(monthRange.end)
        });
      } else {
        console.warn('訂單統計數據格式不正確:', orderData);
        setOrderStats([]);
        setOrderStatusStats([]);
      }

    } catch (error) {
      console.error('統計資料獲取錯誤:', error);
      setProductStats({
        total: 0,
        active: 0,
        inactive: 0
      });
      setOrderStats([]);
      setOrderStatusStats([]);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // 圓餅圖顏色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Box sx={{ display: 'flex' }}>
      <Grid container spacing={3}>
        {/* 商品統計卡片 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="商品統計" />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">{productStats.total}</Typography>
                  <Typography color="textSecondary">總商品數</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {productStats.active}
                  </Typography>
                  <Typography color="textSecondary">上架中</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {productStats.inactive}
                  </Typography>
                  <Typography color="textSecondary">下架中</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 訂單狀態統計 - 修改標題顯示 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={
                dateRange.start
                  ? `${dateRange.start} 訂單處理狀態`  // 因為是同一個月，所以只顯示一個月份
                  : "本月訂單處理狀態"
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 每日訂單統計 - 修改標題 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                dateRange.start
                  ? `${dateRange.start} 訂單統計`
                  : "本月訂單統計"
              }
            />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={orderStats}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orderCount" name="訂單數" fill="#8884d8" />
                    <Bar dataKey="totalAmount" name="總金額" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;