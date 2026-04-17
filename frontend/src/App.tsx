import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { CartProvider } from "./pages/user/pro/cart/CartContext";
import { AdminProvider } from "./pages/admin/Admincontext";
import { SuperAdminProvider } from "./pages/superadmin/SuperAdminContext";
import { NotificationProvider as AdminNotificationProvider } from "./pages/admin/NotificationContext";
import { NotificationProvider as SuperAdminNotificationProvider } from "./pages/superadmin/NotificationContext";
import { RetailerProvider } from "./pages/retailer/RetailerContext";
import { DeliveryBoyProvider } from "./pages/deliveryboy/DeliveryContexr";

// Import all necessary components
// { Guest Routes }
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ForgotPassword from "./Auth/ForgotPassword";
import GuestLiving from "./pages/guest/buy/guest-living";
import GuestStorage from "./pages/guest/buy/guest-storage";
import GuestChair from "./pages/guest/buy/guest-chairs";
import GuestDining from "./pages/guest/buy/guest-dining";
import GuestTable from "./pages/guest/buy/guest-table";
import GuestDeals from "./pages/guest/buy/guest-deals";
import GuestMattress from "./pages/guest/buy/guest-mattres";
import GuestBedroom from "./pages/guest/buy/guest-bedroom";
import GuestrLiving from "./pages/guest/rent/guest-rliving";
import GuestrStorage from "./pages/guest/rent/guest-rstorage";
import GuestrChair from "./pages/guest/rent/guest-rchairs";
import GuestrDining from "./pages/guest/rent/guest-rdining";
import GuestrTable from "./pages/guest/rent/guest-rtable";
import GuestrDeals from "./pages/guest/rent/guest-rdeals";
import GuestrMattress from "./pages/guest/rent/guest-rmattres";
import GuestrBedroom from "./pages/guest/rent/guest-rbedroom";
import ChatWidget from "./components/ChatAi/ChatWidget";
import Home from "./pages/guest/Home";
import Rent from "./pages/guest/rent/rent";
import Buy from "./pages/guest/buy/buy";
import AboutUs from "./pages/user/AboutUs";
import ContactUs from "./pages/guest/ContactUs";
import Contact from "./pages/user/contact";
import About from "./pages/guest/Guest-ab";
import GuestProductView from "./pages/guest/guest-pdview";

// { User Routes }
import RentPage from "./pages/user/rent/RentPage";
import BuyPage from "./pages/user/buy/BuyPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import HelpCenter from "./pages/HelpCenter";
import Cart from "./pages/user/pro/cart/Cart";
import SelectItemPage from "./pages/user/pro/cart/SelectItemPage";
import Profile from "./pages/user/pro/cart/Profile";
import BookingPage from "./pages/user/rent/BookingPage";
import OrderHistory from "./pages/user/pro/cart/OrderHistory";
import OrderTrackingPage from "./pages/user/pro/cart/OrderTracking";
// import Payment from "./test/Payment";
import UserChangePassword from "./pages/user/pro/cart/ChangePassword";
import Wishlist from "./pages/user/pro/cart/Wishlist";
import Viewproduct from "./pages/user/Viewproduct";
import ProductView from "./pages/user/pro/product-view";
import LivingPage from "./pages/user/buy/living";
import StoragePage from "./pages/user/buy/storage";
import BedroomPage from "./pages/user/buy/bedroom";
import ChairPage from "./pages/user/buy/chairs";
import DiningPage from "./pages/user/buy/dining";
import TablePage from "./pages/user/buy/table";
import DealsPage from "./pages/user/buy/deals";
import MattressPage from "./pages/user/buy/mattres";
import Living from "./pages/user/rent/living";
import Storage from "./pages/user/rent/storage";
import Bedroom from "./pages/user/rent/bedroom";
import Chair from "./pages/user/rent/chairs";
import Dining from "./pages/user/rent/dining";
import Table from "./pages/user/rent/table";
import Deals from "./pages/user/rent/deals";
import Mattress from "./pages/user/rent/mattres";
import Payment from "./pages/user/pro/cart/Payment";
import BookingConfirmation from "./pages/user/pro/cart/BookingConfirmation";
import Loader from "../../frontend/src/components/loader";
import PaymentHistoryPage from "./pages/user/pro/cart/PaymentHistory";

// { Admin Routes }
import Dashboard from "./pages/admin/Dashboard";
// import Users from "./pages/admin/AdminProfilePage";
import Settings from "./pages/admin/Setting";


// import UpdateFurniture from "./pages/admin/UpdateFurniture";
import UpdateUserPage from "./pages/admin/Update_User";
import ShowUser from "./pages/admin/List_user";
import ChangePassword from "./pages/admin/ChangePassword";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import ListModerator from "./pages/admin/ListModerator";
import ChairsPage from "./pages/admin/category/chairs";
import List_Banned_User from "./pages/admin/Banned_User";
import ListFurniturePage from "./pages/admin/ListFurniturePage";
import CheckingStatusPage from "./pages/admin/CheckingStatusPage";
import Message from "./pages/admin/SendMessage";  
import RecieveMessage from "./pages/admin/RecieveMessage";
import ApprovedRejectedFurniture from "./pages/admin/Approved_Reject";
import ListSeller from "./pages/admin/List_Seller";
import ListDeliveryBoy from "./pages/admin/Listdeliveryboy";

// category pages
import Chairs from "./pages/admin/category/chairs";
import Store from "./pages/admin/category/store";
import Matt from "./pages/admin/category/matt";
import Sofa from "./pages/admin/category/sofa";
import Tab from "./pages/admin/category/table";
import Del from "./pages/admin/category/deal";
import Dinin from "./pages/admin/category/dinin";
import Bdroom from "./pages/admin/category/bdroom";

// { Super Admin Routes }
import SuperDashboard from "./pages/superadmin/Dashboard";
import Superusers from "./pages/superadmin/Superuser";
import TestComponent from "./test/TestComponent";
import Chatai from "./components/chatai";
import Checkout from "./pages/user/pro/cart/Checkout";
import AddWarning from "./pages/superadmin/Warning";
import Notification from "./pages/superadmin/Notification";
import SuperAdminProfilePage from "./pages/superadmin/SuperAdminProfilePage";
import ListWarning from "./pages/superadmin/List_Warning";
import SendMessage from "./pages/superadmin/SendMessaage";
import Password from "./pages/superadmin/ChangePassword";
import ComeMessage from "./pages/superadmin/Message";
import Banned_User from "./pages/superadmin/List_banned_users";
// import Bookings from "./pages/user/pro/cart/Bookings";
import BookingDetails from "./pages/user/pro/cart/BookingDetails";
import TermCondition from "./pages/user/Term-Condition";
import Privacy from "./pages/user/Privacy";
import Aboutus1 from "./pages/user/Aboutus1";
import Approved from "./pages/superadmin/Approved";
import ApprovedRejected from "./pages/superadmin/Approved_rejected";
// AddDiscountPage is already imported abover

// {retailer}
import AddFurniturePage from "./pages/retailer/AddFurniturePage";
import ListFurniture from "./pages/retailer/ListFurniture";
import AddDiscountPage from "./pages/retailer/Adddiscount";
import RetailerDashboard from "./pages/retailer/Dashboard";
import RetailerProfilePage from "./pages/retailer/RetailerProfile";
import ChangePasswordRetailer from "./pages/retailer/ChangePassword";

// delivery boy 
import PendingStatus from "./pages/deliveryboy/PendingStatus";
import DeliveryProfilePage from "./pages/deliveryboy/DeliveryProfile";
import Processing from "./pages/deliveryboy/Processing";
import Shipped from "./pages/deliveryboy/Shipped";
import Complete from "./pages/deliveryboy/Complete";
// import BookingDetailsPage from "./pages/user/pro/cart/BookingDetails";
import  DeliveryDashboard from "./pages/deliveryboy/Dashboard";
import DeliveryBoyPassword from "./pages/deliveryboy/Changepassword";
import Listorder from "./pages/admin/Listorder";




// Helper Functions
function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

function getUserRole() {
  return localStorage.getItem("user_role");
}

// General Protected Route
function ProtectedRoute({ role, children }: { role?: string; children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (role && getUserRole() !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/about-us" element={<AboutUs />} /> */}
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/order-history" element={<OrderHistory />} /> */}
        <Route path="/view-product/:productId" element={<Viewproduct />} />
        <Route path="/cart-product/:productId" element={<ProductView />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/test" element={<TestComponent />} />
        <Route path="/booking" element={<BookingPage />} />
        {/* <Route path="/payment" element={<Payment />} /> */}
        <Route path="/guest-rent" element={<Rent />} />
        <Route path="/guest-buy" element={<Buy />} />
        <Route path="/chat" element={<Chatai currentSystemMessage="" />} />
        <Route path="/chat-widget" element={<ChatWidget currentSystemMessage="Welcome to the Furniture Store!" />} />
        <Route path="/guest-living" element={<GuestLiving />} />
        <Route path="/guest-storage" element={<GuestStorage />} />
        <Route path="/guest-chairs" element={<GuestChair />} />
        <Route path="/guest-dining" element={<GuestDining />} />
        <Route path="/guest-table" element={<GuestTable />} />
        <Route path="/guest-deals" element={<GuestDeals />} />
        <Route path="/guest-mattress" element={<GuestMattress />} />
        <Route path="/guest-bedroom" element={<GuestBedroom />} />
        <Route path="/guest-rliving" element={<GuestrLiving />} />
        <Route path="/guest-rstorage" element={<GuestrStorage />} />
        <Route path="/guest-rchairs" element={<GuestrChair />} />
        <Route path="/guest-rdining" element={<GuestrDining />} />
        <Route path="/guest-rtable" element={<GuestrTable />} />
        <Route path="/guest-rdeals" element={<GuestrDeals />} />
        <Route path="/guest-rmattress" element={<GuestrMattress/>}/>
        <Route path="/guest-rbedroom" element={<GuestrBedroom/>}/>
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/guest-view-product/:productId" element={<GuestProductView />} />
        {/* <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/booking/:id" element={<BookingDetails />} /> */}
        
        {/* deliveryboy routes*/}
        <Route
          path="/deliveryboy/pending-status"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <PendingStatus/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        /> 
        <Route
          path="/deliveryboy/processing"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <Processing/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />  
         <Route
          path="/deliveryboy/profile"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <DeliveryProfilePage/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />  
        <Route
          path="/deliveryboy/dashboard"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <DeliveryDashboard/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />  

          <Route
          path="/deliveryboy/password"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <DeliveryBoyPassword/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />    
        <Route
          path="/deliveryboy/shipped"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <Shipped/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />    
        <Route
          path="/deliveryboy/deliverd"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <Complete/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />    
        <Route
          path="/deliveryboy/password"
          element={
            <ProtectedRoute role="deliveryboy">
              <DeliveryBoyProvider>
                <DeliveryBoyPassword/>
              </DeliveryBoyProvider>
            </ProtectedRoute>
          }
        />    
       
        {/*retailer routes   */}
        <Route
          path="/retailer/add-furniture"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <AddFurniturePage />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/change-password"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <ChangePasswordRetailer />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/dashboard"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <RetailerDashboard />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/add-discount/:id"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <AddDiscountPage />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/add-discount"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <AddDiscountPage />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/retailer/profile"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <RetailerProfilePage />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/retailer/list-furniture"
          element={
            <ProtectedRoute role="retailer">
              <RetailerProvider>
                <ListFurniture />
              </RetailerProvider>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/buy"
          element={
            <ProtectedRoute role="user">
              <BuyPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-activity"
          element={
            <ProtectedRoute role="user">
              <div>User Activity Logger Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rent"
          element={
            <ProtectedRoute role="user">
              <RentPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute role="user">
              <UserChangePassword/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="user">
              <Profile/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-us"
          element={
            <ProtectedRoute role="user">
            <Contact/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about-us"
          element={
            <ProtectedRoute role="user">
              <AboutUs/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/term-condition"
          element={
            <ProtectedRoute role="user">
              <TermCondition/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/about-us1"
          element={
            <ProtectedRoute role="user">
              <Aboutus1/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <ProtectedRoute role="user">
              <Privacy/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute role="user">
              <Cart/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute role="user">
              <OrderHistory/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute role="user">
              <BookingDetails/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/itempage"
          element={
            <ProtectedRoute role="user">
              <SelectItemPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute role="user">
              <Checkout/>
            </ProtectedRoute>
          }
        />
         <Route
          path="/order/:id"
          element={
            <ProtectedRoute role="user">
              <OrderTrackingPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation"
          element={
            <ProtectedRoute role="user">
              <BookingConfirmation/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute role="user">
              <Payment/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loading"
          element={
            <ProtectedRoute role="user">
              <Loader/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute role="user">
            <Wishlist/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedRoute role="user">
              <PaymentHistoryPage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/living"
          element={
            <ProtectedRoute role="user">
              <LivingPage/>
            </ProtectedRoute>
          }
          />
        <Route
          path="/storage"
          element={
            <ProtectedRoute role="user">
              <StoragePage/>
            </ProtectedRoute>
          }
          />
        <Route
          path="/bedroom"
          element={
            <ProtectedRoute role="user">
              <BedroomPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/dining"
          element={
            <ProtectedRoute role="user">
              <DiningPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/chairs"
          element={
            <ProtectedRoute role="user">
              <ChairPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/tables"
          element={
            <ProtectedRoute role="user">
              <TablePage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/mattress"
          element={
            <ProtectedRoute role="user">
              <MattressPage/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/best-deals"
          element={
            <ProtectedRoute role="user">
              <DealsPage/>
            </ProtectedRoute>
          }
          />
          {/* rent page  */}
          <Route
          path="/rent-living"
          element={
            <ProtectedRoute role="user">
              <Living/>
            </ProtectedRoute>
          }
          />
        <Route
          path="/rent-storage"
          element={
            <ProtectedRoute role="user">
              <Storage/>
            </ProtectedRoute>
          }
          />
        <Route
          path="/rent-bedroom"
          element={
            <ProtectedRoute role="user">
              <Bedroom/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/rent-dining"
          element={
            <ProtectedRoute role="user">
              <Dining/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/rent-chairs"
          element={
            <ProtectedRoute role="user">
              <Chair/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/rent-tables"
          element={
            <ProtectedRoute role="user">
              <Table/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/rent-mattress"
          element={
            <ProtectedRoute role="user">
              <Mattress/>
            </ProtectedRoute>
          }
          />
          <Route
          path="/rent-best-deals"
          element={
            <ProtectedRoute role="user">
              <Deals/>
            </ProtectedRoute>
          }
          />
          
        
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute role="admin">
              <Listorder/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-furniture"
          element={
            <ProtectedRoute role="admin">
              <AddFurniturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/list-seller"
          element={
            <ProtectedRoute role="admin">
              <ListSeller />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/list-deliveryboy"
          element={
            <ProtectedRoute role="admin">
              <ListDeliveryBoy/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/show-user"
          element={
            <ProtectedRoute role="admin">
              <ShowUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/show-moderator"
          element={
            <ProtectedRoute role="admin">
              <ListModerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/list-furniture"
          element={
            <ProtectedRoute role="admin">
              <ListFurniturePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/test_profile"
          element={
            <ProtectedRoute role="admin">
              <UpdateUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banned-users"
          element={
            <ProtectedRoute role="admin">
              <List_Banned_User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/change-password"
          element={
            <ProtectedRoute role="admin">
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-profile"
          element={
            <ProtectedRoute role="admin">
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/status"
          element={
            <ProtectedRoute role="admin">
              <CheckingStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chairs"
          element={
            <ProtectedRoute role="admin">
              <ChairsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-message"
          element={
            <ProtectedRoute role="admin">
              <Message />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/recieve-message"
          element={
            <ProtectedRoute role="admin">
                <RecieveMessage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approved-rejected"
          element={
            <ProtectedRoute role="admin">
                <ApprovedRejectedFurniture />
            </ProtectedRoute>
          }
        />
        {/* category  */}
        <Route
          path="/admin/chairs"
          element={
            <ProtectedRoute role="admin">
              <Chairs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bedroom"
          element={
            <ProtectedRoute role="admin">
              <Bdroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/store"
          element={
            <ProtectedRoute role="admin">
              <Store />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/matt"
          element={
            <ProtectedRoute role="admin">
              <Matt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/living"
          element={
            <ProtectedRoute role="admin">
              <Sofa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
              <ProtectedRoute role="admin">
              <Tab/>
              </ProtectedRoute>
          }
        />
        <Route
          path="/admin/list-discounts"
          element={
              <ProtectedRoute role="admin">
              <Del/>
              </ProtectedRoute>
          }
        />
        <Route
          path="/admin/din"
          element={
              <ProtectedRoute role="admin">
              <Dinin/>
              </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute role="moderator">
              <SuperDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/approved"
          element={
            <ProtectedRoute role="moderator">
              <Approved/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/send-message"
          element={
            <ProtectedRoute role="moderator">
              <SendMessage/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/add-warning"
          element={
            <ProtectedRoute role="moderator">
              <AddWarning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/notifications"
          element={
            <ProtectedRoute role="moderator">
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/Superusers"
          element={
            <ProtectedRoute role="moderator">
              <Superusers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/profile"
          element={
            <ProtectedRoute role="moderator">
              <SuperAdminProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/list-warning"
          element={
            <ProtectedRoute role="moderator">
              <ListWarning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/password"
          element={
            <ProtectedRoute role="moderator">
              <Password/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/recieve-message"
          element={
            <ProtectedRoute role="moderator">
              <ComeMessage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/banned-users"
          element={
            <ProtectedRoute role="moderator">
              <Banned_User />  
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/approved-rejected"
          element={
            <ProtectedRoute role="moderator">
              <ApprovedRejected/>  
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// Main Render
function WrappedApp() {
  return (
    <Router>
      <SuperAdminNotificationProvider>
        <AdminNotificationProvider>
          <CartProvider>
            <AdminProvider>
              <SuperAdminProvider>
                <RetailerProvider>
                  <DeliveryBoyProvider>
                    <App />
                  </DeliveryBoyProvider>
                </RetailerProvider>
              </SuperAdminProvider>
            </AdminProvider>
          </CartProvider>
        </AdminNotificationProvider>
      </SuperAdminNotificationProvider>
    </Router>
  );
}
export default WrappedApp;