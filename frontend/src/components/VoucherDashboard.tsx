
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Users, Clock, TrendingUp } from "lucide-react";

export function VoucherDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_URL}/api/vouchers/stats/`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      }),
      fetch(`${API_URL}/api/vouchers/activity/`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch activity");
        return res.json();
      })
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {loading && <div className="text-center py-8 text-gray-500">Loading dashboard...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Vouchers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Ticket className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Vouchers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Used Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.used_today}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.success_rate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="font-mono text-sm font-medium">
                        {activity.code}
                      </span>
                      <Badge
                        variant={
                          activity.status === "used"
                            ? "default"
                            : activity.status === "generated"
                            ? "secondary"
                            : "destructive"
                        }
                        className="mx-auto"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
