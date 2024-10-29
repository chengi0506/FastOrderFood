import { ROUTES } from '../constants/routes';

// 導航工具函數
export const navigateTo = {
  home: (navigate) => navigate(ROUTES.HOME),
  menu: (navigate) => navigate(ROUTES.MENU),
  cart: (navigate) => navigate(ROUTES.CART),
  confirmOrder: (navigate) => navigate(ROUTES.CONFIRM_ORDER),
  orderConfirmation: (navigate) => navigate(ROUTES.ORDER_CONFIRMATION),
  error: (navigate) => navigate(ROUTES.ERROR)
}; 