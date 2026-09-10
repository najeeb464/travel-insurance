import api from './client';

export const destinationsApi = {
  getDestinations: (search = '') =>
    api.get(`/destinations/destinations/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCountries: (search = '') =>
    api.get(`/destinations/countries/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getRegions: () => api.get('/destinations/regions/'),
};

export const productsApi = {
  getProducts: () => api.get('/products/products/'),
  getPlans: () => api.get('/products/plans/'),
  getCoverages: () => api.get('/products/coverages/'),
  getTravelTypes: () => api.get('/products/travel-types/'),
};

export const quotesApi = {
  calculate: (data) => api.post('/quotes/calculate/', data),
  getQuote: (quoteNumber) => api.get(`/quotes/${quoteNumber}/`),
};

export const ordersApi = {
  create: (data) => api.post('/orders/create/', data),
  getOrder: (orderNumber) => api.get(`/orders/${orderNumber}/`),
  getMyOrders: () => api.get('/orders/my-orders/'),
  cancel: (orderNumber) => api.post(`/orders/${orderNumber}/cancel/`),
};

export const paymentsApi = {
  checkout: (data) => api.post('/payments/checkout/', data),
  getPayment: (transactionId) => api.get(`/payments/${transactionId}/`),
};

export const policiesApi = {
  validate: (policyNumber) => api.get(`/policies/validate/${policyNumber}/`),
  getPolicy: (policyNumber) => api.get(`/policies/${policyNumber}/`),
  getDocument: (policyNumber) => api.get(`/policies/${policyNumber}/document/`),
  getMyPolicies: () => api.get('/policies/my-policies/'),
};

export const promotionsApi = {
  validate: (code, amount = 0) => api.post('/promotions/validate/', { code, amount }),
};

export const refundsApi = {
  request: (data) => api.post('/refunds/request/', data),
  getMyRefunds: () => api.get('/refunds/my-requests/'),
};

export const reviewsApi = {
  getReviews: () => api.get('/reviews/'),
  createReview: (data) => api.post('/reviews/', data),
};

export const cmsApi = {
  getFaqs: () => api.get('/cms/faqs/'),
  getPages: () => api.get('/cms/pages/'),
  getPage: (slug) => api.get(`/cms/pages/${slug}/`),
  getArticles: () => api.get('/cms/articles/'),
};

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getMe: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
};
