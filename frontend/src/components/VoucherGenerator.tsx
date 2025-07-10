
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function VoucherGenerator() {
  const [formData, setFormData] = useState({
    quantity: "1",
    duration: "1h",
    dataLimit: "1gb",
    expiration: "",
  });
  const [generatedVouchers, setGeneratedVouchers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Track if the user has manually set the expiration date
  const [dateManuallySet, setDateManuallySet] = useState(false);

  // Store both the full ISO string and the date string for expiration
  const [expiresAtISO, setExpiresAtISO] = useState("");

  useEffect(() => {
    if (!dateManuallySet) {
      const autoDateTime = parseDuration(formData.duration);
      setExpiresAtISO(autoDateTime);
      setFormData((prev) => ({ ...prev, expiration: autoDateTime.slice(0, 10) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.duration]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateManuallySet(true);
    setFormData({ ...formData, expiration: e.target.value });
    // If the user picks a date, set the ISO string to that date at the current time
    const pickedDate = e.target.value;
    if (pickedDate) {
      const now = new Date();
      const [year, month, day] = pickedDate.split("-");
      now.setFullYear(Number(year), Number(month) - 1, Number(day));
      setExpiresAtISO(now.toISOString());
    }
  };

  const parseDuration = (duration: string) => {
    const now = new Date();
    if (duration.endsWith('m')) {
      const minutes = parseInt(duration);
      now.setMinutes(now.getMinutes() + minutes);
    } else if (duration.endsWith('h')) {
      const hours = parseInt(duration);
      now.setHours(now.getHours() + hours);
    } else if (duration.endsWith('d')) {
      const days = parseInt(duration);
      now.setDate(now.getDate() + days);
    }
    return now.toISOString();
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedVouchers([]);
    try {
      let expires_at = expiresAtISO;
      if (!expires_at) {
        expires_at = parseDuration(formData.duration);
      }
      const response = await fetch("/api/vouchers/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: formData.quantity,
          duration: formData.duration,
          data_limit: formData.dataLimit,
          expires_at,
        }),
      });
      if (!response.ok) throw new Error("Failed to create voucher(s)");
      const vouchers = await response.json();
      setGeneratedVouchers(Array.isArray(vouchers) ? vouchers.map((v: any) => v.code) : [vouchers.code]);
      toast({
        title: "Vouchers Generated Successfully",
        description: `Generated ${Number(formData.quantity)} new voucher${Number(formData.quantity) > 1 ? 's' : ''}`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = generatedVouchers.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vouchers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Vouchers Exported",
      description: "Voucher codes downloaded as CSV file",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="quantity">Number of Vouchers</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="100"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">30 Minutes</SelectItem>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dataLimit">Data Limit</Label>
            <Select value={formData.dataLimit} onValueChange={(value) => setFormData({...formData, dataLimit: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100mb">100 MB</SelectItem>
                <SelectItem value="500mb">500 MB</SelectItem>
                <SelectItem value="1gb">1 GB</SelectItem>
                <SelectItem value="5gb">5 GB</SelectItem>
                <SelectItem value="10gb">10 GB</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiration">Expiration Date (Optional)</Label>
            <Input
              id="expiration"
              type="date"
              value={formData.expiration}
              onChange={handleDateChange}
              className="mt-1"
            />
          </div>

          <Button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            {loading ? "Generating..." : "Generate Vouchers"}
          </Button>
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </CardContent>
      </Card>

      {/* Generated Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Generated Vouchers
            </span>
            {generatedVouchers.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedVouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No vouchers generated yet</p>
              <p className="text-sm">Use the form to generate new vouchers</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedVouchers.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <span className="font-mono font-medium">{code}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Active</Badge>
                    <Badge variant="outline">{formData.duration}</Badge>
                    <Badge variant="outline">{formData.dataLimit}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
