
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { VoucherCard } from "@/components/VoucherCard";

interface Voucher {
  id: string;
  code: string;
  status: "active" | "used" | "expired" | "disabled";
  duration: string;
  dataLimit: string;
  createdAt: string;
  usedAt?: string;
  expiresAt: string;
}

export function VoucherList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const voucherGridRef = useRef<HTMLDivElement>(null);
  const [printCodesOnly, setPrintCodesOnly] = useState(false);
  const codesPrintRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/vouchers/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch vouchers");
        return res.json();
      })
      .then((data) => {
        // Map snake_case to camelCase for all relevant fields
        setVouchers(
          data.map((v: any) => ({
            ...v,
            dataLimit: v.data_limit ?? v.dataLimit,
            createdAt: v.created_at ?? v.createdAt,
            usedAt: v.used_at ?? v.usedAt,
            expiresAt: v.expires_at ?? v.expiresAt,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || voucher.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    fetch(`${API_URL}/api/vouchers/export/`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to export vouchers');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vouchers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        alert(err.message);
      });
  };

  const handlePrintCodes = () => {
    setPrintCodesOnly(true);
    setTimeout(() => {
      if (!codesPrintRef.current) return;
      const printContents = codesPrintRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Voucher Codes</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} td{border:1px solid #ccc;padding:12px;text-align:center;font-size:1.2rem;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
      setPrintCodesOnly(false);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search voucher codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handlePrintCodes}>
              <Download className="w-4 h-4 mr-2" />
              Print Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading vouchers...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      {/* Voucher Grid */}
      {!loading && !error && (
        <div ref={voucherGridRef} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} />
          ))}
        </div>
      )}

      {!loading && !error && filteredVouchers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No vouchers found</h3>
            <p className="text-gray-500">
              Try adjusting your search query or filter settings
            </p>
          </CardContent>
        </Card>
      )}

      {printCodesOnly && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={codesPrintRef}>
            <table>
              <tbody>
                {Array.from({ length: Math.ceil(filteredVouchers.length / 6) }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {filteredVouchers.slice(rowIdx * 6, rowIdx * 6 + 6).map((voucher) => (
                      <td key={voucher.id} style={{ width: '16.6%', padding: '18px 0', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.15em', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-block', width: '100%' }}>{voucher.code}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
