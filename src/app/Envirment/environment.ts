export const environment = {
production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080/ws-chat',
  userId:3, // home 5 tsp 3
  endpoints: {
    orders: '/api/orders',
    carts: '/api/carts'
  }


};

// // For production (environment.prod.ts)
// export const environment = {
//   production: true,
//   apiUrl: 'https://your-production-api.com/api',
//   endpoints: {
//     orders: '/orders',
//     carts: '/carts'
//   }



