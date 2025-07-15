import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, Package, Clock, Star, Navigation, MapPin, DollarSign, 
  Phone, Calendar, TrendingUp, Activity, AlertCircle, CheckCircle,
  Timer, Route, Target, Wallet, Settings, User, Bell, Eye, Home,
  AlertTriangle, History
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DeliveryPartnerData {
  id: number;
  userId: number;
  vehicleType: string;
  vehicleNumber: string;
  drivingLicense: string;
  status: string;
  isAvailable: boolean;
  currentLocation: string;
  totalDeliveries: number;
  rating: string;
  totalEarnings: string;
  deliveryAreas: string[];
  emergencyContact: string;
  bankAccountNumber: string;
  ifscCode: string;
}

interface EnhancedDeliveryStats {
  // Today's metrics
  todayDeliveries: number;
  todayEarnings: number;
  todayDistance: number;
  todayOnlineTime: number;
  
  // Weekly metrics
  weekDeliveries: number;
  weekEarnings: number;
  weekDistance: number;
  weekAvgRating: number;
  
  // Monthly metrics
  monthDeliveries: number;
  monthEarnings: number;
  monthDistance: number;
  
  // Overall performance
  totalDeliveries: number;
  totalEarnings: number;
  totalDistance: number;
  overallRating: number;
  successRate: number;
  
  // Active orders
  activeDeliveries: number;
  pendingAcceptance: number;
  
  // Incentives and bonuses
  weeklyBonus: number;
  performanceBonus: number;
  fuelAllowance: number;
  
  // Rankings and achievements
  cityRank: number;
  totalPartners: number;
  badges: string[];
}

interface DeliveryDetails {
  id: number;
  orderId: number;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  
  // Pickup details
  pickupStoreName: string;
  pickupStorePhone: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  
  // Delivery details
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  
  // Financial details
  deliveryFee: number;
  extraCharges: number;
  totalEarnings: number;
  paymentMethod: string;
  codAmount: number;
  
  // Order details
  orderValue: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  
  // Time and distance
  estimatedDistance: number;
  estimatedTime: number;
  actualTime?: number;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  
  // Special instructions
  customerInstructions: string;
  storeInstructions: string;
  
  // Tracking
  currentLatitude?: number;
  currentLongitude?: number;
  isLiveTracking: boolean;
}

export default function EnhancedDeliveryPartnerDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDetails | null>(null);

  // Fetch delivery partner data
  const { data: partner, isLoading: partnerLoading, error: partnerError } = useQuery({
    queryKey: ['/api/delivery-partners/user', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/delivery-partners/user?userId=${user?.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch partner data');
      }
      return response.json();
    },
    enabled: !!user?.id,
    retry: 2,
  });

  // Update online status when partner data is loaded
  useEffect(() => {
    if (partner) {
      setIsOnlineMode(partner.isAvailable);
    }
  }, [partner]);

  // Fetch enhanced statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/delivery-partners/enhanced-stats', partner?.id],
    queryFn: async (): Promise<EnhancedDeliveryStats> => {
      const response = await fetch(`/api/delivery-partners/${partner?.id}/enhanced-stats`);
      if (!response.ok) {
        // Return mock data structure for development
        return {
          todayDeliveries: 8,
          todayEarnings: 640,
          todayDistance: 45.2,
          todayOnlineTime: 420, // 7 hours in minutes
          
          weekDeliveries: 47,
          weekEarnings: 3760,
          weekDistance: 312.8,
          weekAvgRating: 4.8,
          
          monthDeliveries: 195,
          monthEarnings: 15600,
          monthDistance: 1250.4,
          
          totalDeliveries: parseInt(partner?.totalDeliveries || '0'),
          totalEarnings: parseFloat(partner?.totalEarnings || '0'),
          totalDistance: 2847.6,
          overallRating: parseFloat(partner?.rating || '4.5'),
          successRate: 97.8,
          
          activeDeliveries: 2,
          pendingAcceptance: 3,
          
          weeklyBonus: 500,
          performanceBonus: 200,
          fuelAllowance: 150,
          
          cityRank: 42,
          totalPartners: 156,
          badges: ['Top Performer', 'On-Time Delivery', 'Customer Favorite']
        };
      }
      return response.json();
    },
    enabled: !!partner?.id,
  });

  // Fetch partner deliveries (all deliveries assigned to this partner)
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery({
    queryKey: ['/api/deliveries/partner', partner?.id],
    queryFn: async () => {
      const response = await fetch(`/api/deliveries/partner/${partner?.id}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!partner?.id,
  });

  // Fetch active deliveries (currently in progress)
  const { data: activeDeliveriesData = [], isLoading: activeDeliveriesLoading } = useQuery({
    queryKey: ['/api/deliveries/active', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/deliveries/active/${user?.id}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh active deliveries every 5 seconds
  });

  // Fetch available deliveries (orders ready for pickup)
  const { data: availableDeliveries = [], isLoading: availableDeliveriesLoading } = useQuery({
    queryKey: ['/api/deliveries/available', partner?.id],
    queryFn: async (): Promise<DeliveryDetails[]> => {
      const response = await fetch(`/api/deliveries/available?partnerId=${partner?.id}`);
      if (!response.ok) {
        // Return mock data for development
        return [
          {
            id: 1,
            orderId: 101,
            orderNumber: "SB001101",
            status: "pending_acceptance",
            customerName: "Priya Sharma",
            customerPhone: "+977-9841234567",
            
            pickupStoreName: "Family Restaurant",
            pickupStorePhone: "+977-9851234567",
            pickupAddress: "Main Road, Siraha",
            pickupLatitude: 26.6610,
            pickupLongitude: 86.2070,
            
            deliveryAddress: "Housing Colony, Siraha",
            deliveryLatitude: 26.6650,
            deliveryLongitude: 86.2120,
            
            deliveryFee: 50,
            extraCharges: 0,
            totalEarnings: 50,
            paymentMethod: "COD",
            codAmount: 450,
            
            orderValue: 450,
            orderItems: [
              { name: "Dal Bhat Set", quantity: 2, price: 180, image: "/images/dal-bhat.jpg" },
              { name: "Chicken Curry", quantity: 1, price: 270, image: "/images/chicken-curry.jpg" }
            ],
            
            estimatedDistance: 3.2,
            estimatedTime: 25,
            assignedAt: new Date().toISOString(),
            
            customerInstructions: "Please call before arriving. Blue gate house.",
            storeInstructions: "Order ready. Handle with care.",
            
            isLiveTracking: false
          },
          {
            id: 2,
            orderId: 102,
            orderNumber: "SB001102",
            status: "pending_acceptance",
            customerName: "Rajesh Kumar",
            customerPhone: "+977-9812345678",
            
            pickupStoreName: "Siraha Electronics",
            pickupStorePhone: "+977-9823456789",
            pickupAddress: "Electronics Market, Siraha",
            pickupLatitude: 26.6590,
            pickupLongitude: 86.2050,
            
            deliveryAddress: "New Colony, Siraha",
            deliveryLatitude: 26.6680,
            deliveryLongitude: 86.2150,
            
            deliveryFee: 30,
            extraCharges: 10,
            totalEarnings: 40,
            paymentMethod: "Online",
            codAmount: 0,
            
            orderValue: 2500,
            orderItems: [
              { name: "Samsung Mobile", quantity: 1, price: 2500, image: "/images/samsung-mobile.jpg" }
            ],
            
            estimatedDistance: 2.8,
            estimatedTime: 20,
            assignedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            
            customerInstructions: "Fragile item. Please handle carefully.",
            storeInstructions: "Check packaging before pickup.",
            
            isLiveTracking: false
          }
        ];
      }
      return response.json();
    },
    enabled: !!partner?.id,
  });

  // Fetch notifications for alerts tab
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/delivery-notifications', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/delivery-notifications/${user?.id}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 3000, // Refresh notifications every 3 seconds
  });

  // Calculate useful statistics from real data
  const deliveriesArray = Array.isArray(deliveries) ? deliveries : [];
  const activeDeliveriesArray = Array.isArray(activeDeliveriesData) ? activeDeliveriesData : [];
  const availableDeliveriesArray = Array.isArray(availableDeliveries) ? availableDeliveries : [];
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  
  const pendingDeliveries = deliveriesArray.filter((d: any) => d.status === 'assigned');
  const completedDeliveries = deliveriesArray.filter((d: any) => d.status === 'delivered');
  const unreadNotifications = notificationsArray.filter((n: any) => !n.isRead);

  // Toggle online/offline status
  const toggleOnlineStatus = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await fetch(`/api/delivery-partners/${partner?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      if (!response.ok) throw new Error('Failed to toggle status');
      return response.json();
    },
    onSuccess: () => {
      setIsOnlineMode(!isOnlineMode);
      queryClient.invalidateQueries({ queryKey: ['/api/delivery-partners/user', user?.id] });
      toast({
        title: isOnlineMode ? "Going Offline" : "Going Online",
        description: isOnlineMode ? "You won't receive new orders" : "You can now receive new orders"
      });
    }
  });

  // Accept delivery order
  const acceptDelivery = useMutation({
    mutationFn: async (deliveryId: number) => {
      console.log('Attempting to accept delivery/order ID:', deliveryId);
      console.log('Partner data:', partner);
      const response = await fetch(`/api/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partnerId: partner?.id || 1,
          deliveryPartnerId: partner?.id || 1 
        })
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Accept delivery failed:', response.status, errorData);
        throw new Error(`Failed to accept delivery: ${errorData}`);
      }
      return response.json();
    },
    onSuccess: async (data, orderId) => {
      console.log('Delivery accepted successfully:', data);
      
      // Mark related notifications as read
      try {
        // Find and mark notification as read
        const relatedNotification = notificationsArray.find((n: any) => n.orderId === orderId);
        if (relatedNotification) {
          await fetch(`/api/notifications/${relatedNotification.id}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.log('Failed to mark notification as read:', error);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/partner'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/delivery-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Order Accepted",
        description: "You have successfully accepted this delivery order"
      });
    },
    onError: (error) => {
      console.error('Accept delivery error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept delivery order",
        variant: "destructive",
      });
    }
  });

  // Update delivery status
  const updateDeliveryStatus = useMutation({
    mutationFn: async ({ deliveryId, status }: { deliveryId: number; status: string }) => {
      const response = await fetch(`/api/deliveries/${deliveryId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, partnerId: partner?.id }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/partner'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deliveries/available'] });
      toast({
        title: "Status Updated",
        description: "Delivery status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update delivery status.",
        variant: "destructive",
      });
    },
  });

  if (partnerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-600">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Delivery Partner Account Required</h2>
            <p className="text-gray-600 mb-4">You need to register as a delivery partner to access this dashboard.</p>
            <Button onClick={() => window.location.href = '/delivery-partner-signup'}>
              Register as Delivery Partner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full overflow-x-hidden">
      {/* Mobile-First Header - Full Width Coverage */}
      <div className="bg-white shadow-sm border-b w-full">
        <div className="w-full max-w-none px-2 xs:px-3 sm:px-4 lg:px-6 py-2 xs:py-3 sm:py-4">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 sm:gap-4">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="p-1.5 xs:p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex-shrink-0">
                <Truck className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">Partner Dashboard</h1>
                <Badge variant={partner.status === 'approved' ? 'default' : 'secondary'} className="text-[8px] xs:text-[9px] sm:text-xs px-1 xs:px-2 py-0.5">
                  {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-row items-center gap-2 xs:gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 xs:gap-2">
                <span className="text-[10px] xs:text-xs text-gray-600 font-medium">
                  {isOnlineMode ? "Online" : "Offline"}
                </span>
                <button
                  onClick={() => toggleOnlineStatus.mutate(!isOnlineMode)}
                  disabled={toggleOnlineStatus.isPending}
                  className={`relative inline-flex h-5 xs:h-6 w-9 xs:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isOnlineMode 
                      ? "bg-green-500 focus:ring-green-500" 
                      : "bg-gray-300 focus:ring-gray-300"
                  } ${toggleOnlineStatus.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`inline-block h-3 xs:h-4 w-3 xs:w-4 transform rounded-full bg-white transition-transform ${
                      isOnlineMode ? "translate-x-5 xs:translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center gap-1 xs:gap-1.5">
                <Star className="h-3 w-3 xs:h-4 xs:w-4 text-yellow-500 fill-current" />
                <span className="text-[10px] xs:text-xs font-semibold">{partner.rating || '4.5'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-none px-1 xs:px-2 sm:px-3 lg:px-6 py-2 xs:py-3 sm:py-4 lg:py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          {/* Mobile-First Icon-Only Tabs - Ultra Compact */}
          <TabsList className="grid grid-cols-6 mb-2 xs:mb-3 sm:mb-6 bg-white shadow-sm h-auto p-0.5 w-full rounded-xl">
            <TabsTrigger value="dashboard" className="flex items-center justify-center py-2 xs:py-2.5 px-1 h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg" title="Dashboard">
              <Home className="h-5 w-5 xs:h-6 xs:w-6" />
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center justify-center py-2 xs:py-2.5 px-1 h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 rounded-lg" title="Available Orders">
              <Package className="h-5 w-5 xs:h-6 xs:w-6" />
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center justify-center py-2 xs:py-2.5 px-1 h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg" title="Active Deliveries">
              <Activity className="h-5 w-5 xs:h-6 xs:w-6" />
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center justify-center py-2 xs:py-2.5 px-1 h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-green-50 data-[state=active]:text-green-600 rounded-lg" title="Earnings">
              <Wallet className="h-5 w-5 xs:h-6 xs:w-6" />
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center justify-center py-2 xs:py-2.5 px-1 h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 rounded-lg" title="Profile">
              <User className="h-5 w-5 xs:h-6 xs:w-6" />
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center py-2 xs:py-2.5 px-1 relative h-auto min-h-[45px] xs:min-h-[50px] data-[state=active]:bg-red-50 data-[state=active]:text-red-600 rounded-lg" title="Alerts">
              <div className="relative">
                <AlertTriangle className="h-5 w-5 xs:h-6 xs:w-6" />
                <div className="absolute -top-1 -right-1 w-2 h-2 xs:w-2.5 xs:h-2.5 bg-red-500 rounded-full"></div>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Overview */}
          <TabsContent value="dashboard" className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Mobile-First Stats Cards - Full Width Coverage */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 w-full">
              {/* Today's Performance */}
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                <CardContent className="p-2 xs:p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 xs:space-y-1">
                      <p className="text-emerald-100 text-[9px] xs:text-[10px] sm:text-sm font-medium leading-tight">Today's Performance</p>
                      <p className="text-sm xs:text-base sm:text-xl lg:text-2xl font-bold">₹{stats?.todayEarnings || 0}</p>
                      <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-[7px] xs:text-[8px] sm:text-xs text-emerald-100">
                        <Package className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
                        <span>{stats?.todayDeliveries || 0} orders</span>
                        <Timer className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" />
                        <span>{Math.floor((stats?.todayOnlineTime || 0) / 60)}h {(stats?.todayOnlineTime || 0) % 60}m</span>
                      </div>
                    </div>
                    <div className="bg-white/20 p-1 xs:p-1.5 sm:p-2 rounded-lg">
                      <TrendingUp className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Analytics */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-blue-100 text-sm font-medium">This Week</p>
                      <p className="text-2xl font-bold">₹{stats?.weekEarnings || 0}</p>
                      <div className="flex items-center gap-2 text-xs text-blue-100">
                        <Route className="h-3 w-3" />
                        <span>{stats?.weekDistance || 0}km</span>
                        <Star className="h-3 w-3" />
                        <span>{stats?.weekAvgRating || 4.5}/5.0</span>
                      </div>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Progress */}
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-purple-100 text-sm font-medium">Monthly Progress</p>
                      <p className="text-2xl font-bold">₹{stats?.monthEarnings || 0}</p>
                      <div className="flex items-center gap-2 text-xs text-purple-100">
                        <Truck className="h-3 w-3" />
                        <span>{stats?.monthDeliveries || 0} completed</span>
                        <Navigation className="h-3 w-3" />
                        <span>{stats?.monthDistance || 0}km</span>
                      </div>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-amber-100 text-sm font-medium">Performance</p>
                      <p className="text-2xl font-bold">{stats?.successRate || 95}%</p>
                      <div className="flex items-center gap-2 text-xs text-amber-100">
                        <Star className="h-3 w-3" />
                        <span>{stats?.overallRating || 4.5}/5.0 rating</span>
                        <Target className="h-3 w-3" />
                        <span>#{stats?.cityRank || 5} in city</span>
                      </div>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Incentives & Bonuses Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Incentives & Bonuses (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Weekly Target Bonus</p>
                        <p className="text-xl font-bold text-green-600">₹{stats?.weeklyBonus || 250}</p>
                        <p className="text-xs text-gray-500">35+ deliveries</p>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Performance Bonus</p>
                        <p className="text-xl font-bold text-blue-600">₹{stats?.performanceBonus || 150}</p>
                        <p className="text-xs text-gray-500">4.5+ rating</p>
                      </div>
                      <Star className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Fuel Allowance</p>
                        <p className="text-xl font-bold text-orange-600">₹{stats?.fuelAllowance || 120}</p>
                        <p className="text-xs text-gray-500">₹8 per delivery</p>
                      </div>
                      <Navigation className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(stats?.badges || []).map((badge: string, index: number) => (
                    <Badge key={index} variant="outline" className="px-3 py-1 text-sm bg-purple-50 border-purple-200 text-purple-700">
                      <Star className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                  {(!stats?.badges || stats.badges.length === 0) && (
                    <p className="text-gray-500 text-sm">Complete more deliveries to earn achievement badges!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Performance This Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Deliveries Completed</span>
                    <span className="font-semibold">{stats?.weekDeliveries || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="font-semibold">₹{stats?.weekEarnings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Distance Covered</span>
                    <span className="font-semibold">{stats?.weekDistance || 0} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{stats?.weekAvgRating || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Earnings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Delivery Fees</span>
                    <span className="font-semibold">₹{(stats?.weekEarnings || 0) - (stats?.weeklyBonus || 0) - (stats?.performanceBonus || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weekly Bonus</span>
                    <span className="font-semibold text-green-600">₹{stats?.weeklyBonus || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Performance Bonus</span>
                    <span className="font-semibold text-blue-600">₹{stats?.performanceBonus || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fuel Allowance</span>
                    <span className="font-semibold text-purple-600">₹{stats?.fuelAllowance || 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total This Week</span>
                      <span className="text-green-600">₹{stats?.weekEarnings || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Badges */}
            {stats?.badges && stats.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Achievement Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Available Orders */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Orders</h2>
              <Badge variant="outline">
                {availableDeliveries.length} orders available
              </Badge>
            </div>

            <div className="grid gap-6">
              {availableDeliveries.map((delivery) => (
                <Card key={delivery.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Information */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">Order #{delivery.orderNumber}</h3>
                          <Badge variant={delivery.paymentMethod === 'COD' ? 'destructive' : 'default'}>
                            {delivery.paymentMethod}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{delivery.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{delivery.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">Earn ₹{delivery.totalEarnings}</span>
                          </div>
                          {delivery.codAmount > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Wallet className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Collect ₹{delivery.codAmount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pickup & Delivery Locations */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-green-700">Pickup from:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{delivery.pickupStoreName}</p>
                            <p className="text-gray-600">{delivery.pickupAddress}</p>
                            <p className="text-gray-500">{delivery.pickupStorePhone}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-700">Deliver to:</h4>
                          <div className="text-sm">
                            <p className="font-medium">{delivery.customerName}</p>
                            <p className="text-gray-600">{delivery.deliveryAddress}</p>
                            {delivery.customerInstructions && (
                              <p className="text-orange-600 text-xs italic">"{delivery.customerInstructions}"</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Details & Actions */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-purple-500" />
                            <span>{delivery.estimatedDistance} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4 text-blue-500" />
                            <span>{delivery.estimatedTime} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-500" />
                            <span>{delivery.orderItems.length} items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>₹{delivery.orderValue}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            onClick={() => acceptDelivery.mutate(delivery.id)}
                            disabled={acceptDelivery.isPending}
                          >
                            {acceptDelivery.isPending ? 'Accepting...' : 'Accept Delivery'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>

                        {delivery.storeInstructions && (
                          <div className="text-xs bg-yellow-50 p-2 rounded border-l-2 border-yellow-300">
                            <p className="text-yellow-800">
                              <strong>Store Note:</strong> {delivery.storeInstructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {availableDeliveries.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Available</h3>
                    <p className="text-gray-500">New delivery orders will appear here when available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Active Deliveries Tab */}
          <TabsContent value="active" className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">Active Deliveries</h2>
              <Badge variant="outline" className="text-xs xs:text-sm">
                {activeDeliveriesArray.length + pendingDeliveries.length} active
              </Badge>
            </div>

            {activeDeliveriesLoading ? (
              <Card>
                <CardContent className="p-6 xs:p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 xs:h-12 xs:w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading active deliveries...</p>
                </CardContent>
              </Card>
            ) : (activeDeliveriesArray.length === 0 && pendingDeliveries.length === 0) ? (
              <Card>
                <CardContent className="p-6 xs:p-8 sm:p-12 text-center">
                  <Route className="h-8 w-8 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-2">No Active Deliveries</h3>
                  <p className="text-sm xs:text-base text-gray-500">Accept an order to start tracking your deliveries</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {/* Pending Deliveries (Assigned but not started) */}
                {pendingDeliveries.map((delivery: any) => (
                  <Card key={delivery.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-3 xs:p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2 xs:gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm xs:text-base font-semibold">Order #{delivery.orderId}</h3>
                            <Badge variant="secondary" className="text-[8px] xs:text-[9px] sm:text-xs">
                              Pending Start
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 xs:space-y-2 text-xs xs:text-sm">
                            <div className="flex items-center gap-1 xs:gap-2">
                              <User className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500 flex-shrink-0" />
                              <span className="font-medium truncate">{delivery.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <MapPin className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-600 truncate">{delivery.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 text-green-600 flex-shrink-0" />
                              <span className="font-semibold text-green-600">₹{delivery.deliveryFee}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 xs:gap-2 flex-shrink-0">
                          <Button 
                            size="sm" 
                            className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                            onClick={() => updateDeliveryStatus.mutate({ deliveryId: delivery.id, status: 'en_route_pickup' })}
                            disabled={updateDeliveryStatus.isPending}
                          >
                            Start Pickup
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Active Deliveries (In progress) */}
                {activeDeliveriesArray.map((delivery: any) => (
                  <Card key={delivery.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-3 xs:p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-2 xs:gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm xs:text-base font-semibold">Order #{delivery.orderId}</h3>
                            <Badge variant="default" className="text-[8px] xs:text-[9px] sm:text-xs bg-green-500">
                              {delivery.status === 'en_route_pickup' ? 'Going to Pickup' :
                               delivery.status === 'picked_up' ? 'Picked Up' :
                               delivery.status === 'en_route_delivery' ? 'Delivering' :
                               'In Progress'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 xs:space-y-2 text-xs xs:text-sm">
                            <div className="flex items-center gap-1 xs:gap-2">
                              <User className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500 flex-shrink-0" />
                              <span className="font-medium truncate">{delivery.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <MapPin className="h-3 w-3 xs:h-4 xs:w-4 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-600 truncate">{delivery.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <Timer className="h-3 w-3 xs:h-4 xs:w-4 text-blue-600 flex-shrink-0" />
                              <span className="text-blue-600">ETA: {delivery.estimatedTime || 15} mins</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 xs:gap-2 flex-shrink-0">
                          {delivery.status === 'en_route_pickup' && (
                            <Button 
                              size="sm" 
                              className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                              onClick={() => updateDeliveryStatus.mutate({ deliveryId: delivery.id, status: 'picked_up' })}
                              disabled={updateDeliveryStatus.isPending}
                            >
                              Mark Picked Up
                            </Button>
                          )}
                          {delivery.status === 'picked_up' && (
                            <Button 
                              size="sm" 
                              className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                              onClick={() => updateDeliveryStatus.mutate({ deliveryId: delivery.id, status: 'en_route_delivery' })}
                              disabled={updateDeliveryStatus.isPending}
                            >
                              Start Delivery
                            </Button>
                          )}
                          {delivery.status === 'en_route_delivery' && (
                            <Button 
                              size="sm" 
                              className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                              onClick={() => updateDeliveryStatus.mutate({ deliveryId: delivery.id, status: 'delivered' })}
                              disabled={updateDeliveryStatus.isPending}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                          >
                            Track Live
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <h2 className="text-2xl font-bold">Earnings Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">₹{stats?.monthEarnings || 0}</p>
                  <p className="text-sm text-gray-500">{stats?.monthDeliveries || 0} deliveries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">₹{stats?.totalEarnings || 0}</p>
                  <p className="text-sm text-gray-500">{stats?.totalDeliveries || 0} deliveries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Average per Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">
                    ₹{stats?.totalDeliveries ? Math.round((stats.totalEarnings || 0) / stats.totalDeliveries) : 0}
                  </p>
                  <p className="text-sm text-gray-500">per order</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Partner Profile</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vehicle Type</label>
                    <p className="font-semibold">{partner.vehicleType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vehicle Number</label>
                    <p className="font-semibold">{partner.vehicleNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Driving License</label>
                    <p className="font-semibold">{partner.drivingLicense}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                    <p className="font-semibold">{partner.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {partner.deliveryAreas && partner.deliveryAreas.length > 0 ? 
                    partner.deliveryAreas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    )) : 
                    <p className="text-gray-500">No delivery areas specified</p>
                  }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold">Alerts & Notifications</h2>
              <Badge variant="outline" className="text-xs xs:text-sm">
                {unreadNotifications.length} unread
              </Badge>
            </div>
            
            {notificationsLoading ? (
              <Card>
                <CardContent className="p-6 xs:p-8 sm:p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 xs:h-12 xs:w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading notifications...</p>
                </CardContent>
              </Card>
            ) : notificationsArray.length === 0 ? (
              <Card>
                <CardContent className="p-6 xs:p-8 sm:p-12 text-center">
                  <Bell className="h-8 w-8 xs:h-12 xs:w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-base xs:text-lg font-medium text-gray-900 mb-2">No New Alerts</h3>
                  <p className="text-sm xs:text-base text-gray-500">Delivery notifications and updates will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {notificationsArray.map((notification: any) => (
                  <Card key={notification.id} className={`transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}>
                    <CardContent className="p-3 xs:p-4 sm:p-6">
                      <div className="flex items-start gap-2 xs:gap-3 sm:gap-4">
                        <div className={`p-1.5 xs:p-2 sm:p-3 rounded-full flex-shrink-0 ${
                          notification.type === 'delivery_assignment' ? 'bg-orange-100 text-orange-600' :
                          notification.type === 'order_update' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.type === 'delivery_assignment' ? (
                            <Package className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                          ) : notification.type === 'order_update' ? (
                            <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                          ) : notification.type === 'payment' ? (
                            <DollarSign className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <Bell className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm xs:text-base font-semibold text-gray-900 truncate">
                                {notification.title}
                              </h3>
                              <p className="text-xs xs:text-sm text-gray-600 mt-0.5 xs:mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {/* Enhanced location and order data display */}
                              {notification.orderId && (
                                <div className="space-y-1 xs:space-y-2 mt-1 xs:mt-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-[8px] xs:text-[9px] sm:text-xs px-1 xs:px-2 py-0.5">
                                      Order #{notification.orderId}
                                    </Badge>
                                    {notification.data && (() => {
                                      try {
                                        const data = JSON.parse(notification.data);
                                        return (
                                          <>
                                            {data.deliveryFee && (
                                              <Badge variant="secondary" className="text-[8px] xs:text-[9px] sm:text-xs px-1 xs:px-2 py-0.5">
                                                ₹{data.deliveryFee} earnings
                                              </Badge>
                                            )}
                                            {data.deliveryInfo?.estimatedDistance && (
                                              <Badge variant="secondary" className="text-[8px] xs:text-[9px] sm:text-xs px-1 xs:px-2 py-0.5">
                                                📍 {data.deliveryInfo.estimatedDistance}
                                              </Badge>
                                            )}
                                            {data.hasCompleteLocationData && (
                                              <Badge variant="default" className="text-[8px] xs:text-[9px] sm:text-xs px-1 xs:px-2 py-0.5 bg-green-100 text-green-700">
                                                📍 GPS Available
                                              </Badge>
                                            )}
                                          </>
                                        );
                                      } catch (e) {
                                        return null;
                                      }
                                    })()}
                                  </div>
                                  
                                  {/* Enhanced location information display */}
                                  {notification.data && (() => {
                                    try {
                                      const data = JSON.parse(notification.data);
                                      
                                      if (data.pickupLocation || data.deliveryLocation) {
                                        return (
                                          <div className="grid grid-cols-1 gap-1 xs:gap-2 text-[9px] xs:text-[10px] sm:text-xs text-gray-600">
                                            {data.pickupLocation && (
                                              <div className="flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-orange-500 flex-shrink-0" />
                                                <span className="truncate">
                                                  📦 {data.pickupLocation.name || 'Pickup'}: {data.pickupLocation.address}
                                                </span>
                                                {data.pickupLocation.googleMapsLink && (
                                                  <a 
                                                    href={data.pickupLocation.googleMapsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                                  >
                                                    🗺️
                                                  </a>
                                                )}
                                              </div>
                                            )}
                                            {data.deliveryLocation && (
                                              <div className="flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 text-green-500 flex-shrink-0" />
                                                <span className="truncate">
                                                  🏠 Delivery: {data.deliveryLocation.address}
                                                </span>
                                                {data.deliveryLocation.googleMapsLink && (
                                                  <a 
                                                    href={data.deliveryLocation.googleMapsLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 ml-1"
                                                  >
                                                    🗺️
                                                  </a>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* Order details summary */}
                                            {data.orderDetails && (
                                              <div className="flex items-center gap-2 text-gray-700">
                                                <span>👤 {data.orderDetails.customerName}</span>
                                                {data.orderDetails.customerPhone && (
                                                  <span>📞 {data.orderDetails.customerPhone}</span>
                                                )}
                                                {data.orderDetails.totalAmount && (
                                                  <span>💰 ₹{data.orderDetails.totalAmount}</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                      return null;
                                    } catch (e) {
                                      return null;
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 xs:gap-2 flex-shrink-0">
                              <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          {notification.type === 'delivery_assignment' && notification.orderId && (
                            <div className="flex gap-1 xs:gap-2 mt-2 xs:mt-3">
                              <Button 
                                size="sm" 
                                className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                                onClick={() => {
                                  const orderId = notification.orderId;
                                  console.log('Notification structure:', notification);
                                  console.log('Accepting delivery for order:', orderId);
                                  console.log('Notification ID:', notification.id);
                                  acceptDelivery.mutate(orderId);
                                }}
                                disabled={acceptDelivery.isPending}
                              >
                                {acceptDelivery.isPending ? 'Accepting...' : 'Accept Order'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-[9px] xs:text-[10px] sm:text-xs px-2 xs:px-3 py-1 h-auto"
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Details - #{selectedDelivery.orderNumber}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDelivery(null)}>
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedDelivery.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order Value:</span>
                    <span>₹{selectedDelivery.orderValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>₹{selectedDelivery.deliveryFee}</span>
                  </div>
                  {selectedDelivery.extraCharges > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Charges:</span>
                      <span>₹{selectedDelivery.extraCharges}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-green-600 border-t pt-2">
                    <span>Your Earnings:</span>
                    <span>₹{selectedDelivery.totalEarnings}</span>
                  </div>
                  {selectedDelivery.codAmount > 0 && (
                    <div className="flex justify-between font-semibold text-red-600">
                      <span>Collect from Customer:</span>
                      <span>₹{selectedDelivery.codAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  className="flex-1"
                  onClick={() => acceptDelivery.mutate(selectedDelivery.id)}
                  disabled={acceptDelivery.isPending}
                >
                  {acceptDelivery.isPending ? 'Accepting...' : 'Accept This Order'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedDelivery(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}