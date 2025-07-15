import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { apiDelete } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function DeleteAccount() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [confirmText, setConfirmText] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [reason, setReason] = useState("");

  const deleteAccountMutation = useMutation({
    mutationFn: async (data: { reason?: string }) => {
      return apiRequest(`/api/auth/delete-account?userId=${user?.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Account deleted successfully",
        description: "Your account and all associated data have been permanently deleted.",
      });
      logout();
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete account",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access this page</h1>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmationValid = confirmText === "DELETE" && confirmChecked;

  const handleDeleteAccount = () => {
    if (!isConfirmationValid) return;
    
    deleteAccountMutation.mutate({
      reason: reason.trim() || undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/account">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-red-600">Delete Account</h1>
        <p className="text-muted-foreground mt-2">
          Permanently delete your account and all associated data
        </p>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Warning: This action cannot be undone</span>
          </CardTitle>
          <CardDescription>
            Deleting your account will permanently remove all your data including:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Your profile information and account details</li>
                <li>Order history and purchase records</li>
                <li>Saved addresses and payment methods</li>
                <li>Wishlist items and shopping cart</li>
                {user.role === "shopkeeper" && (
                  <>
                    <li>Your store(s) and all product listings</li>
                    <li>Store analytics and sales data</li>
                    <li>Customer reviews and ratings</li>
                  </>
                )}
                {user.role === "delivery_partner" && (
                  <>
                    <li>Delivery history and earnings data</li>
                    <li>Performance ratings and statistics</li>
                  </>
                )}
                <li>All notifications and communications</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for deletion (optional)</Label>
              <Input
                id="reason"
                placeholder="Help us improve by sharing why you're leaving..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-checkbox"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                />
                <Label htmlFor="confirm-checkbox" className="text-sm">
                  I understand that this action is permanent and cannot be reversed
                </Label>
              </div>

              <div>
                <Label htmlFor="confirm-text" className="text-sm">
                  Type "DELETE" to confirm account deletion
                </Label>
                <Input
                  id="confirm-text"
                  placeholder="Type DELETE here"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Link href="/account">
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!isConfirmationValid || deleteAccountMutation.isPending}
                className="flex-1"
              >
                {deleteAccountMutation.isPending ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact our support team at{" "}
          <a href="mailto:sirahabazzar@gmail.com" className="text-blue-600 hover:underline">
            sirahabazzar@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}