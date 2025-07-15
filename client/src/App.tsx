import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { WishlistProvider } from "./hooks/useWishlist";
import { AppModeProvider, useAppMode } from "./hooks/useAppMode";
import NotFound from "@/pages/not-found";
import NavbarWrapper from "@/components/NavbarWrapper";
import BottomNavbar from "@/components/BottomNavbar";
import Footer from "@/components/Footer";
import ModeSwiper from "@/components/ModeSwiper";
import MobileNotificationBar from "@/components/MobileNotificationBar";
import { AndroidBridge } from "@/lib/androidBridge";
import { useEffect } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import Homepage from "@/pages/Homepage";
import SmartHomepage from "@/pages/SmartHomepage";
import FoodHomepage from "@/pages/FoodHomepage";
import Products from "@/pages/Products";
import ProductDetail from "./pages/ProductDetail";
import QuickBites from "@/pages/QuickBites";
import StoreDetail from "./pages/StoreDetail";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Stores from "@/pages/Stores";
import Account from "@/pages/Account";
import DeleteAccount from "@/pages/DeleteAccount";
import ShopkeeperDashboard from "@/pages/ShopkeeperDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import EnhancedAdminDashboard from "@/pages/EnhancedAdminDashboard";
import ComprehensiveAdminDashboard from "@/pages/ComprehensiveAdminDashboard";
import ImprovedAdminDashboard from "@/pages/ImprovedAdminDashboard";
import StoreMaps from "@/pages/StoreMaps";
import RestaurantMaps from "@/pages/RestaurantMaps";
import Wishlist from "@/pages/Wishlist";
import Categories from "@/pages/Categories";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerInventory from "@/pages/SellerInventory";
import SellerPromotions from "@/pages/SellerPromotions";
import SellerOrders from "@/pages/SellerOrders";
import SellerStore from "@/pages/SellerStore";
import AddProduct from "@/pages/AddProduct";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import DashboardRouter from "@/components/DashboardRouter";
import DeliveryPartnerDashboard from "./pages/DeliveryPartnerDashboard";
import EnhancedDeliveryPartnerDashboard from "./pages/EnhancedDeliveryPartnerDashboard";
import DeliveryPartnerTest from "./pages/DeliveryPartnerTest";
import DeliveryPartnerNotifications from "./pages/DeliveryPartnerNotifications";
import DeliveryTrackingMap from "@/pages/DeliveryTrackingMap";
import TrackingDemo from "@/pages/TrackingDemo";
import DeliveryTrackingDashboard from "@/pages/DeliveryTrackingDashboard";
import ProfessionalDeliveryTracking from "@/pages/ProfessionalDeliveryTracking";
import DeliveryPartnerQuickReg from "@/pages/DeliveryPartnerQuickReg";
import StreamlinedDeliveryPartnerReg from "@/pages/StreamlinedDeliveryPartnerReg";
import AdminDeliveryPartners from "@/pages/AdminDeliveryPartners";
import OrderTracking from "@/pages/OrderTracking";
import DeliveryMap from "@/pages/DeliveryMap";
import NotificationBanner from "@/components/NotificationBanner";
import FlashSales from "@/pages/FlashSales";
import SpecialOffers from "@/pages/SpecialOffers";
import NotificationTest from "@/pages/NotificationTest";

function AppRouter() {
  const { mode } = useAppMode();

  return (
    <div className="relative">
      <Switch>
        <Route path="/" component={mode === 'shopping' ? Homepage : FoodHomepage} />
        <Route path="/categories" component={Categories} />
        <Route path="/food-categories" component={Categories} />
        <Route path="/products" component={Products} />
        <Route path="/quick-bites" component={QuickBites} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/food/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-confirmation" component={OrderConfirmation} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/stores" component={Stores} />
        <Route path="/restaurants" component={Stores} />
        <Route path="/stores/:id" component={StoreDetail} />
        <Route path="/restaurants/:id" component={RestaurantDetail} />
        <Route path="/store/:id" component={StoreDetail} />
        <Route path="/restaurant/:id" component={RestaurantDetail} />
        <Route path="/account" component={Account} />
        <Route path="/delete-account" component={DeleteAccount} />
        <Route path="/shopkeeper-dashboard" component={ShopkeeperDashboard} />
        <Route path="/customer-dashboard" component={CustomerDashboard} />
        <Route path="/admin" component={ImprovedAdminDashboard} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/panel" component={AdminPanel} />
        <Route path="/admin/dashboard" component={ImprovedAdminDashboard} />
        <Route path="/store-maps" component={StoreMaps} />
        <Route path="/restaurant-maps" component={RestaurantMaps} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/flash-sales" component={FlashSales} />
        <Route path="/special-offers" component={SpecialOffers} />
        <Route path="/food-offers" component={SpecialOffers} />
        <Route path="/notification-test" component={NotificationTest} />

        {/* Seller Hub Routes */}
        <Route path="/seller/dashboard" component={SellerDashboard} />
        <Route path="/restaurant/dashboard" component={RestaurantDashboard} />
        <Route path="/seller/store" component={SellerStore} />
        <Route path="/seller/inventory" component={SellerInventory} />
        <Route path="/seller/promotions" component={SellerPromotions} />
        <Route path="/seller/orders" component={SellerOrders} />
        <Route path="/seller/products/add" component={AddProduct} />

        {/* Delivery Partner Routes */}
        <Route path="/delivery-partner-dashboard" component={EnhancedDeliveryPartnerDashboard} />
        <Route path="/delivery-partner/dashboard" component={EnhancedDeliveryPartnerDashboard} />
        <Route path="/delivery-partner/enhanced" component={EnhancedDeliveryPartnerDashboard} />
        <Route path="/delivery-partner/test" component={DeliveryPartnerTest} />
        <Route path="/delivery-partner/notifications" component={DeliveryPartnerNotifications} />
        <Route path="/delivery-partner/register" component={StreamlinedDeliveryPartnerReg} />
        <Route path="/delivery-partner/quick-reg" component={DeliveryPartnerQuickReg} />
        <Route path="/delivery-partner/tracking" component={ProfessionalDeliveryTracking} />

        <Route path="/delivery-map/:id" component={DeliveryMap} />
        <Route path="/admin/delivery-partners" component={AdminDeliveryPartners} />

        {/* Order Tracking Route */}
        <Route path="/orders/:orderId/tracking" component={OrderTracking} />

        {/* Real-time Tracking Demo */}
        <Route path="/tracking-demo" component={TrackingDemo} />

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Initialize Android bridge on app startup
  useEffect(() => {
    AndroidBridge.initialize();
    console.log('React app mounted successfully');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppModeProvider>
                <TooltipProvider>
                  <ErrorBoundary>
                    <div className="min-h-screen flex flex-col">
                      <ErrorBoundary>
                        <NotificationBanner />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <MobileNotificationBar className="md:hidden" />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <NavbarWrapper />
                      </ErrorBoundary>
                      <main className="flex-1 pb-16 md:pb-0">
                        <ErrorBoundary>
                          <AppRouter />
                        </ErrorBoundary>
                      </main>
                      <ErrorBoundary>
                        <Footer />
                      </ErrorBoundary>
                      <ErrorBoundary>
                        <BottomNavbar />
                      </ErrorBoundary>
                    </div>
                    <Toaster />
                  </ErrorBoundary>
                </TooltipProvider>
              </AppModeProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;