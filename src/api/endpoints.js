const BASE_URL = 'http://localhost:16286/api';
//const BASE_URL = 'http://218.161.102.64/FastOrderFoodApi/api';
//const BASE_URL = 'https://ec21-61-218-249-187.ngrok-free.app/api';

export const API_ENDPOINTS = {
  GET_PROD_CLASS: `${BASE_URL}/Prod/GetProdClass`,
  GET_PRODUCTS_BY_CLASS: (prodClass) => `${BASE_URL}/Prod/GetProductsByClass/${prodClass}`,
  CHECKOUT: `${BASE_URL}/Order/Checkout`,
  GET_STORE_INFO : `${BASE_URL}/Store/GetStoreInfo`,
  UPDATE_STORE_INFO : `${BASE_URL}/Store/UpdateStoreInfo`,
  UPLOAD_BACKGROUND : `${BASE_URL}/Store/UploadBackground`,
  DELETE_BACKGROUND : `${BASE_URL}/Store/DeleteBackground`,
  GET_IMAGE : `${BASE_URL}/Store/GetImage`,

  GET_ALL_PRODUCTS: `${BASE_URL}/Prod/GetAllProducts`,
  UPDATE_PRODUCT_STATUS: `${BASE_URL}/Prod/UpdateProductStatus`,
  UPLOAD_PRODUCT_IMAGE: `${BASE_URL}/Prod/UploadProductImage`,
  DELETE_PRODUCT_IMAGE: `${BASE_URL}/Prod/DeleteProductImage`,

  GET_ORDERS: `${BASE_URL}/Order/GetOrders`,
  GET_ORDER_DETAILS: `${BASE_URL}/Order/GetOrderDetails`,
  UPDATE_ORDER_STATE: `${BASE_URL}/Order/UpdateOrderState`,

  GET_PRODUCT_STATS: `${BASE_URL}/Prod/GetProductStats`,
  GET_ORDER_STATS: `${BASE_URL}/Order/GetOrderStats`,
};

