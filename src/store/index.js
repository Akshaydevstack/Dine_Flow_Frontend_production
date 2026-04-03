import { configureStore } from "@reduxjs/toolkit";

/* =========================================================
   AUTH
========================================================= */
import authReducer from "./slices/authSlices/authSlice";

/* =========================================================
   COMMON / GLOBAL
========================================================= */
import notificationReducer from "./slices/notificationSlice";

/* =========================================================
   CUSTOMER
========================================================= */
import categoriesReducer from "./slices/categorieSlice";
import homeDishReducer from "./slices/homeDishesSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import menuDishesReducer from "./slices/menuDishesSlice";
import restaurantDetailsReducer from "./slices/restaurantDetailsSlice";

/* =========================================================
   WAITER
========================================================= */
import waiterTablesReducer from "./slices/waiterSlice/waiterTablesSlice";
import waiterZonesReducer from "./slices/waiterSlice/waiterZonesSlice";
import waiterMenuDishesReducer from "./slices/waiterSlice/Waitermenudishesslice";
import waiterCartReducer from "./slices/waiterSlice/waiterCartSlice";
import waiterOrderReducer from "./slices/waiterSlice/waiterOrderSlice";
import waiterCategoriesReducer from "./slices/waiterSlice/waiterCategorieSlice";

/* =========================================================
   KITCHEN
========================================================= */
import kitchenReducer from "./slices/kitchenSlices/kitchenSlice";

/* =========================================================
   RESTAURANT ADMIN
========================================================= */
import adminCustomersReducer from "./slices/restaurantAdminSlice/adminUserSlice";
import adminOrderReducer from "./slices/restaurantAdminSlice/adminOrderSlice";
import adminDishesReducer from "./slices/restaurantAdminSlice/adminDishSlice";
import adminTablesReducer from "./slices/restaurantAdminSlice/adminTableSlice";
import adminEmployeeReducer from "./slices/restaurantAdminSlice/adminEmployeeslice";
import adminChartReducer from "./slices/restaurantAdminSlice/adminChartSlice";
import adminTableSessionsReducer from "./slices/restaurantAdminSlice/adminTableSessionsSlice";
import adminKitchenTicketsReducer from "./slices/restaurantAdminSlice/Adminkitchenticketslice";
import adminReviewsReducer from "./slices/restaurantAdminSlice/adminReviewSlice";
import adminRestaurantDetailsReducer from "./slices/restaurantAdminSlice/restaurantDetailsSlice";
import adminBroadcastNotificationsReducer from "./slices/restaurantAdminSlice/adminBroadcastNotificationSlice";

/* =========================================================
   SUPER ADMIN
   ⚠ FIX: was previously importing superAdminStaffReducer
     from the wrong file (superAdminRestaurantSlice).
     Now correctly imports from superAdminStaffSlice.
========================================================= */
import superAdminRestaurantsReducer from "./slices/superAdmin/superAdminRestaurantSlice";
import superAdminStaffReducer from "./slices/superAdmin/superAdminStaffSlice"; 
import superAdminCustomersReducer from "./slices/superAdmin/superAdminCustomerSlice"; 

/* =========================================================
   STORE
========================================================= */
const store = configureStore({
  reducer: {
    /* AUTH */
    auth: authReducer,

    /* GLOBAL */
    notifications: notificationReducer,

    /* CUSTOMER */
    categories: categoriesReducer,
    homeDishes: homeDishReducer,
    cart: cartReducer,
    orders: orderReducer,
    menuDishes: menuDishesReducer,
    restaurantDetails: restaurantDetailsReducer,

    /* WAITER */
    waiterTables: waiterTablesReducer,
    waiterZones: waiterZonesReducer,
    waiterMenuDishes: waiterMenuDishesReducer,
    waiterCategories: waiterCategoriesReducer,
    waiterCart: waiterCartReducer,
    waiterOrder: waiterOrderReducer,

    /* KITCHEN */
    kitchen: kitchenReducer,

    /* RESTAURANT ADMIN */
    adminCustomers: adminCustomersReducer,
    adminOrders: adminOrderReducer,
    adminDishes: adminDishesReducer,
    adminTables: adminTablesReducer,
    adminEmployees: adminEmployeeReducer,
    adminDashboard: adminChartReducer,
    adminKitchenTickets: adminKitchenTicketsReducer,
    adminReviews: adminReviewsReducer,
    adminTableSessions: adminTableSessionsReducer,
    adminRestaurantDetails: adminRestaurantDetailsReducer,
    adminBroadcastNotifications: adminBroadcastNotificationsReducer,

    /* SUPER ADMIN */
    superAdminRestaurants: superAdminRestaurantsReducer,
    superAdminStaff: superAdminStaffReducer, 
    superAdminCustomers:superAdminCustomersReducer
  },
});

export default store;