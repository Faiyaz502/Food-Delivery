export const environment = {
production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080/ws-chat',
  userId:3, // home 2 tsp 3
  ownerId:4, // tsp2 , home 4
  riderId : 1, // home 4 , tsp 1
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



