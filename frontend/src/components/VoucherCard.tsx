
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Database, Clock, Copy, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Voucher {
  id: string;
  code: string;
  status: "active" | "used" | "expired" | "disabled";
  duration: string;
  dataLimit: string;
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
  expires_at?: string;
  used_at?: string;
}

interface VoucherCardProps {
  voucher: Voucher;
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(voucher.status);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!voucher.expires_at) return;
    const update = () => {
      const now = new Date();
      const expires = new Date(voucher.expires_at);
      const diff = expires.getTime() - now.getTime();
      // Debug output
      console.log('Now:', now.toISOString(), 'Expires:', voucher.expires_at, 'Diff (hrs):', diff / (1000 * 60 * 60));
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [voucher.expires_at]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "used":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "disabled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `Voucher code ${text} copied successfully`,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  };

  const handleToggle = async () => {
    if (status === "used" || status === "expired") return;
    const newStatus = status === "active" ? "disabled" : "active";
    setLoading(true);
    try {
      const res = await fetch(`/api/vouchers/${voucher.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setStatus(newStatus);
      toast({
        title: `Voucher ${newStatus === "active" ? "enabled" : "disabled"}`,
        description: `Voucher code ${voucher.code} is now ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vouchers/${voucher.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete voucher");
      toast({
        title: "Voucher deleted",
        description: `Voucher code ${voucher.code} has been deleted.`,
      });
      // Optionally, trigger a refresh or callback to remove the card from the list
      window.location.reload(); // Simple reload for now
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDelete(false);
    }
  };

  // Show countdown only if voucher is used and used_at is set
  const showCountdown = voucher.status === "used" && voucher.used_at && voucher.expires_at;
  // The switch is only active (toggleable) when the voucher is used
  const switchDisabled = status !== "used" || loading;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with code and status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg">{voucher.code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(voucher.code)}
                className="p-1 h-6 w-6"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Badge className={getStatusColor(voucher.status)}>
              {voucher.status.toUpperCase()}
            </Badge>
          </div>

          {/* Voucher details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Duration: {voucher.duration}</span>
              {showCountdown ? (
                <span className="ml-2 text-blue-600 font-mono">{timeLeft}</span>
              ) : voucher.expires_at ? (
                <span className="ml-2 text-gray-500 font-mono">{new Date(voucher.expires_at).toLocaleString()}</span>
              ) : (
                <span className="ml-2 text-gray-400 font-mono">Not started</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Database className="w-4 h-4" />
              <span>Data Limit: {voucher.dataLimit}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(voucher.created_at || voucher.createdAt)}</span>
            </div>
            {voucher.usedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Used: {formatDate(voucher.usedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Expires: {formatDate(voucher.expires_at || voucher.expiresAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Switch
                checked={status === "active"}
                disabled={switchDisabled}
                onCheckedChange={handleToggle}
              />
              <span className="text-sm text-gray-600">
                {status === "active" ? "Enabled" : "Disabled"}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDelete(true)} disabled={loading}>
                  Delete
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Edit (coming soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogTitle>Delete Voucher</DialogTitle>
          <div>Are you sure you want to delete voucher <b>{voucher.code}</b>?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
