import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { ROLES } from "../utils/constants";

import DineFlowLoader from "../components/ui/DineFlowLoader";

/* =========================================================
   AUTH PAGES
========================================================= */

const UserLogin = lazy(() => import("../modules/auth/pages/UserLogin"));
const UserRegister = lazy(() => import("../modules/auth/pages/UserRegistration"));
const UserOtpVerification = lazy(() => import("../modules/auth/pages/UserOtpVerification"));
const RestaurantStaffLogin = lazy(() => import("../modules/auth/pages/RestaurantStaffLogin"));
const SuperUserLogin = lazy(() => import("../modules/auth/pages/SuperUserLogin"));

/* =========================================================
   COMMON PAGES
========================================================= */

const LandingPage = lazy(() => import("../common/pages/LandingPage"));
const NotFound = lazy(() => import("../common/pages/NotFound"));
const Notifications = lazy(() => import("../common/pages/Notifications"));
const Unauthorized = lazy(() => import("../components/ui/Unauthorized"));

/* =========================================================
   CUSTOMER MODULE
========================================================= */

const CustomerLayout = lazy(() => import("../modules/customer/layout/CustomerLayout"));
const Home = lazy(() => import("../modules/customer/pages/Home"));
const Menu = lazy(() => import("../modules/customer/pages/Menu"));
const Cart = lazy(() => import("../modules/customer/pages/Cart"));
const Orders = lazy(() => import("../modules/customer/pages/Orders"));
const Profile = lazy(() => import("../modules/customer/pages/Profile"));
const DishDetails = lazy(() => import("../modules/customer/pages/DishDetail"));
const OrderDetails = lazy(() => import("../modules/customer/pages/OrderDetails"));

/* =========================================================
   WAITER MODULE
========================================================= */

const WaiterLayout = lazy(() => import("../modules/waiter/components/Layout/WaiterLayout"));
const WaiterTables = lazy(() => import("../modules/waiter/pages/WaiterTables"));
const WaiterMenu = lazy(() => import("../modules/waiter/pages/WaiterMenu"));
const WaiterCart = lazy(() => import("../modules/waiter/pages/WaiterCart"));
const WaiterOrders = lazy(() => import("../modules/waiter/pages/WaiterOrders"));
const WaiterOrderDetail = lazy(() => import("../modules/waiter/pages/WaiterOrderDetail"));
const WaiterDishDetail = lazy(() => import("../modules/waiter/pages/WaiterDishDetail"));
const WaiterProfile = lazy(() => import("../modules/waiter/pages/WaiterProfile"));
const TableBill = lazy(() => import("../modules/waiter/pages/Tablebill"));

/* =========================================================
   KITCHEN MODULE
========================================================= */

const KitchenDisplay = lazy(() => import("../modules/kitchen/pages/Kitchendisplay"));

/* =========================================================
   RESTAURANT ADMIN MODULE
========================================================= */

const AdminLayout = lazy(() => import("../modules/admin/layout/AdminLayout"));
const Dashboard = lazy(() => import("../modules/admin/pages/Dashboard"));
const CustomerManagement = lazy(() => import("../modules/admin/pages/CustomerManagement"));
const OrderManagement = lazy(() => import("../modules/admin/pages/OrderManagement"));
const MenuManagement = lazy(() => import("../modules/admin/pages/MenuManagement"));
const TableManagement = lazy(() => import("../modules/admin/pages/TableManagement"));
const EmployeeManagement = lazy(() => import("../modules/admin/pages/Employeemanagement"));
const KitchenTicketManagement = lazy(() => import("../modules/admin/pages/KitchenTicketManagement"));
const ReviewManagement = lazy(() => import("../modules/admin/pages/ReviewManagement"));
const CheckoutPage = lazy(() => import("../modules/admin/pages/Checkoutpage"));
const SessionManagement = lazy(() => import("../modules/admin/pages/Sessionmanagement"));
const RestaurantDetails = lazy(()=> import ("../modules/admin/pages/Restaurantdetails"))
const Broadcastnotifications = lazy ( ()=> import("../modules/admin/pages/Broadcastnotifications") )
/* =========================================================
   SUPER ADMIN MODULE
========================================================= */
const SuperAdminLayout = lazy(() => import("../modules/superAdmin/layout/Superadminlayout"));
const SuperAdminDashboard = lazy(() => import("../modules/superAdmin/pages/SuperAdminDashboard"));
const RestaurantManagement = lazy(()=> import("../modules/superAdmin/pages/RestaurantManagemant"));
const RestaurantStaffManagement = lazy(()=> import("../modules/superAdmin/pages/RestaurantStaffManagement"));
const TotalCustomerManagement = lazy(()=> import ("../modules/superAdmin/pages/Customermanagement"))
/* =========================================================
   ROUTES
========================================================= */

export default function AppRoutes() {
  return (
    <Suspense fallback={<DineFlowLoader />}>
      <Routes>

        {/* ======================================
           PUBLIC ROUTES
        ====================================== */}

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<GuestRoute />}>

          <Route path="/" element={<LandingPage />} />

          <Route
            path="/customer/scan/:restaurant_id/:current_table_id/:qr_code_token/:zone_id/:table_number/:restaurant_name"
            element={<UserLogin />}
          />

          <Route path="/customer/signup" element={<UserRegister />} />

          <Route path="/customer/verify-otp" element={<UserOtpVerification />} />

          <Route path="/restaurant/staff/login" element={<RestaurantStaffLogin />} />

          <Route path="/superadmin/login" element={<SuperUserLogin />} />

        </Route>


        {/* ======================================
           SUPER ADMIN ROUTES
        ====================================== */}

        <Route element={<ProtectedRoute allowedRole={ROLES.SUPER_ADMIN} />}>
        <Route element = {<SuperAdminLayout/>}>
          <Route path="/super-admin/dashboard"element={<SuperAdminDashboard />}/>
          <Route path="/super-admin/restaurant-management" element={<RestaurantManagement/>}></Route>
          <Route path="/super-admin/restaurant-staff-management" element={<RestaurantStaffManagement/>}></Route>
          <Route path="/super-admin/customer-management" element={<TotalCustomerManagement/>}></Route>
          
        </Route>
        </Route>


        {/* ======================================
           CUSTOMER ROUTES
        ====================================== */}

        <Route element={<ProtectedRoute allowedRole={ROLES.CUSTOMER} />}>

          <Route element={<CustomerLayout />}>

            <Route path="/customer/home" element={<Home />} />
            <Route path="/customer/menu" element={<Menu />} />
            <Route path="/customer/cart" element={<Cart />} />
            <Route path="/customer/orders" element={<Orders />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/notification" element={<Notifications />} />

            <Route path="/customer/dish/:dishId" element={<DishDetails />} />

            <Route
              path="/customer/orders/:orderId"
              element={<OrderDetails />}
            />

          </Route>

        </Route>


        {/* ======================================
           RESTAURANT ADMIN ROUTES
        ====================================== */}

        <Route element={<ProtectedRoute allowedRole={ROLES.RESTAURANT_ADMIN} />}>

          <Route element={<AdminLayout />}>

            <Route path="/restaurant/admin/dashboard" element={<Dashboard />} />

            <Route
              path="/restaurant/admin/customer-management"
              element={<CustomerManagement />}
            />

            <Route
              path="/restaurant/admin/order-management"
              element={<OrderManagement />}
            />

            <Route
              path="/restaurant/admin/menu-management"
              element={<MenuManagement />}
            />

            <Route
              path="/restaurant/admin/table-management"
              element={<TableManagement />}
            />

            <Route
              path="/restaurant/admin/employee-management"
              element={<EmployeeManagement />}
            />

            <Route
              path="/restaurant/admin/kitchenticket-management"
              element={<KitchenTicketManagement />}
            />

            <Route
              path="/restaurant/admin/review-management"
              element={<ReviewManagement />}
            />

            <Route
              path="/restaurant/admin/checkout/:tableId"
              element={<CheckoutPage />}
            />

            <Route
              path="/restaurant/admin/table-sessions"
              element={<SessionManagement />}
            />

             <Route
              path="/restaurant/admin/settings"
              element={<RestaurantDetails />}
            />

            <Route
              path="/restaurant/admin/notification"
              element={<Broadcastnotifications />}
            />
          </Route>

        </Route>


        {/* ======================================
           KITCHEN ROUTES
        ====================================== */}

        <Route element={<ProtectedRoute allowedRole={ROLES.KITCHEN} />}>

          <Route path="/kitchen/display" element={<KitchenDisplay />} />

        </Route>


        {/* ======================================
           WAITER ROUTES
        ====================================== */}

        <Route element={<ProtectedRoute allowedRole={ROLES.WAITER} />}>

          <Route element={<WaiterLayout />}>

            <Route path="/waiter/tables" element={<WaiterTables />} />
            <Route path="/waiter/menu" element={<WaiterMenu />} />
            <Route path="/waiter/cart" element={<WaiterCart />} />
            <Route path="/waiter/orders" element={<WaiterOrders />} />

            <Route
              path="/waiter/orders/:orderId"
              element={<WaiterOrderDetail />}
            />

            <Route
              path="/waiter/dishes/:dishId"
              element={<WaiterDishDetail />}
            />

            <Route path="/waiter/profile" element={<WaiterProfile />} />

            <Route
              path="/waiter/tables/:tableId/bill"
              element={<TableBill />}
            />

          </Route>

        </Route>


        {/* ======================================
           FALLBACK
        ====================================== */}

        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}