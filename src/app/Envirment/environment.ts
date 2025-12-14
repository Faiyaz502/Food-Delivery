export const environment = {
production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'http://localhost:8080/ws-chat',
  userId:2, // home 2 tsp 3
  ownerId:3, // tsp4 , home 3
  riderId : 4, // home 4 , tsp 1
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



