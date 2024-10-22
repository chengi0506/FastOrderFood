const BASE_URL = 'http://localhost:5079/api';
//const BASE_URL = 'http://localhost:7272/api';
//const BASE_URL = 'http://172.16.5.142:9090/api';

export const API_ENDPOINTS = {
  GET_PROD_CLASS: `${BASE_URL}/Prod/GetProdClass`,
  GET_PRODUCTS_BY_CLASS: (prodClass) => `${BASE_URL}/Prod/GetProductsByClass/${prodClass}`,
  CHECKOUT: `${BASE_URL}/Order/Checkout`,
};
