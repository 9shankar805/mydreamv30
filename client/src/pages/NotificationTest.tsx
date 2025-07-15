import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { 
  testNotificationSetup, 
  showManualNotification, 
  supportsNotifications,
  isMobileDevice 
} from '@/lib/firebaseNotifications';
import { Bell, CheckCircle, AlertCircle, Smartphone, Monitor, Zap } from 'lucide-react';

export default function NotificationTest() {
  const [testUserId, setTestUserId] = useState(1);
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testMessage, setTestMessage] = useState('This is a test notification from Siraha Bazaar!');
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [isTestingBrowser, setIsTestingBrowser] = useState(false);
  const [isTestingAndroid, setIsTestingAndroid] = useState(false);
  const [androidToken, setAndroidToken] = useState('');
  
  const { toast } = useToast();
  const { 
    token, 
    isSupported, 
    isLoading, 
    error, 
    requestPermission, 
    saveTokenToServer 
  } = useFirebaseMessaging();

  const handleTestFirebaseNotification = async () => {
    setIsTestingFirebase(true);
    try {
      await testNotificationSetup(testUserId);
      toast({
        title: "Firebase Test Successful",
        description: "Check your device for the test notification!",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Firebase Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleTestAndroidNotification = async () => {
    setIsTestingAndroid(true);
    try {
      if (!androidToken) {
        throw new Error('Android FCM token is required');
      }

      const response = await fetch('/api/android-notification-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: androidToken,
          title: testTitle,
          message: testMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Android notification');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Android Test Successful",
          description: "Check your Android device for the test notification!",
          duration: 5000,
        });
      } else {
        throw new Error(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      toast({
        title: "Android Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingAndroid(false);
    }
  };

  const handleTestBrowserNotification = async () => {
    setIsTestingBrowser(true);
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        const success = showManualNotification(testTitle, testMessage, {
          tag: 'test-notification',
          requireInteraction: true,
        });
        
        if (success) {
          toast({
            title: "Browser Test Successful",
            description: "Check your browser for the test notification!",
          });
        } else {
          throw new Error('Failed to show browser notification');
        }
      } else {
        throw new Error('Notification permission not granted');
      }
    } catch (error) {
      toast({
        title: "Browser Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingBrowser(false);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        const success = await saveTokenToServer(testUserId);
        if (success) {
          toast({
            title: "Notifications Enabled",
            description: "You will now receive push notifications from Siraha Bazaar!",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Failed to Enable Notifications",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getNotificationStatus = () => {
    if (!supportsNotifications()) {
      return {
        status: 'unsupported',
        message: 'Your browser does not support notifications',
        color: 'text-red-600'
      };
    }
    
    if (Notification.permission === 'granted') {
      return {
        status: 'granted',
        message: 'Notifications are enabled',
        color: 'text-green-600'
      };
    }
    
    if (Notification.permission === 'denied') {
      return {
        status: 'denied',
        message: 'Notifications are blocked. Please enable them in your browser settings.',
        color: 'text-red-600'
      };
    }
    
    return {
      status: 'default',
      message: 'Click to enable notifications',
      color: 'text-yellow-600'
    };
  };

  const notificationStatus = getNotificationStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Test Center</h1>
          <p className="text-gray-600">Test and configure push notifications for Siraha Bazaar</p>
        </div>

        {/* Device Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isMobileDevice() ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Device Type:</span>
                <span className="ml-2">{isMobileDevice() ? 'Mobile' : 'Desktop'}</span>
              </div>
              <div>
                <span className="font-medium">Browser Support:</span>
                <span className="ml-2">{isSupported ? 'Supported' : 'Not Supported'}</span>
              </div>
              <div>
                <span className="font-medium">Permission Status:</span>
                <span className={`ml-2 font-medium ${notificationStatus.color}`}>
                  {Notification.permission}
                </span>
              </div>
              <div>
                <span className="font-medium">Firebase Token:</span>
                <span className="ml-2">{token ? 'Available' : 'Not Available'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Status */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription className={notificationStatus.color}>
            {notificationStatus.message}
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Enable */}
        {notificationStatus.status === 'default' && (
          <Card>
            <CardHeader>
              <CardTitle>Enable Notifications</CardTitle>
              <CardDescription>
                Enable push notifications to receive updates from Siraha Bazaar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Push Notifications
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure test parameters for notification testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                value={testUserId}
                onChange={(e) => setTestUserId(parseInt(e.target.value) || 1)}
                placeholder="Enter user ID"
              />
            </div>
            
            <div>
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Enter notification title"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Notification Message</Label>
              <Textarea
                id="message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter notification message"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="androidToken">Android FCM Token (Optional)</Label>
              <Textarea
                id="androidToken"
                value={androidToken}
                onChange={(e) => setAndroidToken(e.target.value)}
                placeholder="Paste your Android FCM token here for direct testing"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Browser Notification Test
              </CardTitle>
              <CardDescription>
                Test basic browser notifications (works offline)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestBrowserNotification}
                disabled={isTestingBrowser || !isSupported}
                className="w-full"
                variant="outline"
              >
                {isTestingBrowser ? 'Testing...' : 'Test Browser Notification'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Firebase Push Test
              </CardTitle>
              <CardDescription>
                Test Firebase push notifications (requires internet)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestFirebaseNotification}
                disabled={isTestingFirebase || !isSupported}
                className="w-full"
              >
                {isTestingFirebase ? 'Testing...' : 'Test Firebase Push'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Android FCM Test
              </CardTitle>
              <CardDescription>
                Test direct Android notifications (requires FCM token)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestAndroidNotification}
                disabled={isTestingAndroid || !androidToken}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isTestingAndroid ? 'Testing...' : 'Test Android Notification'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Enable Notifications</h4>
              <p className="text-sm text-gray-600">
                Click "Enable Push Notifications" and allow permission when prompted by your browser.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. Test Browser Notifications</h4>
              <p className="text-sm text-gray-600">
                Click "Test Browser Notification" to see a basic notification from your browser.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. Test Firebase Push</h4>
              <p className="text-sm text-gray-600">
                Click "Test Firebase Push" to test the complete push notification system.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">4. Android App Testing</h4>
              <p className="text-sm text-gray-600">
                For Android app testing, paste your FCM token (from your Android app) in the FCM Token field above, then click "Test Android Notification".
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">5. How to Get Android FCM Token</h4>
              <p className="text-sm text-gray-600">
                Your Android app automatically gets an FCM token when it starts. Check your app's console logs for "FCMToken: Token from MainActivity: [token]" to find it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}