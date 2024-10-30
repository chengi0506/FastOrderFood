const BASE_URL = 'http://localhost:5079/api';
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
};

