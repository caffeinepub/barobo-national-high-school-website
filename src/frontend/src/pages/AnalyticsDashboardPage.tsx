import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerRole, useGetVisitorAnalytics, useGetLoginAnalytics, useGetRecentLoginRecords, useGetTotalVisitors } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Users, LogIn, Eye, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();
  const { data: visitorAnalytics, isLoading: visitorLoading } = useGetVisitorAnalytics();
  const { data: loginAnalytics, isLoading: loginLoading } = useGetLoginAnalytics();
  const { data: recentLogins, isLoading: loginsLoading } = useGetRecentLoginRecords();
  const { data: totalVisitors } = useGetTotalVisitors();

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the analytics dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = role === 'SuperAdmin';

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only Super Admin can access the analytics dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const visitorChartData = visitorAnalytics ? [
    { period: 'Daily', visitors: Number(visitorAnalytics.daily) },
    { period: 'Weekly', visitors: Number(visitorAnalytics.weekly) },
    { period: 'Monthly', visitors: Number(visitorAnalytics.monthly) },
    { period: 'Yearly', visitors: Number(visitorAnalytics.yearly) },
  ] : [];

  const loginChartData = loginAnalytics ? [
    { period: 'Daily', logins: Number(loginAnalytics.daily) },
    { period: 'Weekly', logins: Number(loginAnalytics.weekly) },
    { period: 'Monthly', logins: Number(loginAnalytics.monthly) },
    { period: 'Yearly', logins: Number(loginAnalytics.yearly) },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            onClick={() => navigate({ to: '/admin/dashboard' })} 
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white border-none"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-school-blue">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visitor and login statistics
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-school-gold/20 shadow-lg bg-sky-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Eye className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {totalVisitors ? Number(totalVisitors).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">All-time site visits</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg bg-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Visitors</CardTitle>
              <Users className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {visitorAnalytics ? Number(visitorAnalytics.daily) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg bg-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Visitors</CardTitle>
              <TrendingUp className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {visitorAnalytics ? Number(visitorAnalytics.weekly) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg bg-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Logins</CardTitle>
              <LogIn className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {loginAnalytics ? Number(loginAnalytics.daily) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-school-gold/20 shadow-lg bg-green-50">
            <CardHeader>
              <CardTitle className="text-school-blue">Visitor Analytics</CardTitle>
              <CardDescription>Visitor counts by time period</CardDescription>
            </CardHeader>
            <CardContent>
              {visitorLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading chart...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={visitorChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#800000" name="Visitors" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle className="text-school-blue">Login Analytics</CardTitle>
              <CardDescription>Admin login activity by time period</CardDescription>
            </CardHeader>
            <CardContent>
              {loginLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading chart...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={loginChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="logins" stroke="#D4AF37" strokeWidth={2} name="Logins" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Login Records */}
        <Card className="border-school-gold/20 shadow-lg bg-pink-50">
          <CardHeader>
            <CardTitle className="text-school-blue">Recent Login Activity</CardTitle>
            <CardDescription>Latest admin login records</CardDescription>
          </CardHeader>
          <CardContent>
            {loginsLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading login records...</p>
              </div>
            ) : !recentLogins || recentLogins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No login records available</p>
            ) : (
              <div className="space-y-4">
                {recentLogins.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-school-maroon/10 p-2">
                        <LogIn className="h-5 w-5 text-school-maroon" />
                      </div>
                      <div>
                        <p className="font-medium text-school-maroon">{record.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.principal.toString().substring(0, 20)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(record.timestamp) / 1000000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
