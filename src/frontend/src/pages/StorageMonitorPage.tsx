import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerRole, useGetStorageStats, useGetFileTypeBreakdown } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, AlertCircle, HardDrive, Image, Video, FileText, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function StorageMonitorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();
  const { data: storageStats, isLoading: storageLoading } = useGetStorageStats();
  const { data: fileBreakdown, isLoading: breakdownLoading } = useGetFileTypeBreakdown();

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access the storage monitor.
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
            <p className="text-muted-foreground">Loading storage information...</p>
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
              Only Super Admin can access the storage monitor.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: bigint) => {
    const num = Number(bytes);
    if (num === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return Math.round((num / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const usagePercentage = storageStats 
    ? (Number(storageStats.usedSpace) / Number(storageStats.totalCapacity)) * 100 
    : 0;

  const isNearCapacity = usagePercentage > 80;

  const pieChartData = fileBreakdown ? [
    { name: 'Images', value: Number(fileBreakdown.images), color: '#800000' },
    { name: 'Videos', value: Number(fileBreakdown.videos), color: '#D4AF37' },
    { name: 'Documents', value: Number(fileBreakdown.documents), color: '#4A5568' },
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
            <h1 className="text-3xl font-bold text-school-blue">Storage Monitor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor storage usage and capacity
            </p>
          </div>
        </div>

        {/* Capacity Warning */}
        {isNearCapacity && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Storage usage is at {usagePercentage.toFixed(1)}%. Consider optimizing or removing unused files.
            </AlertDescription>
          </Alert>
        )}

        {/* Storage Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <HardDrive className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {storageStats ? formatBytes(storageStats.totalCapacity) : '0 Bytes'}
              </div>
              <p className="text-xs text-muted-foreground">Maximum storage</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used Space</CardTitle>
              <HardDrive className="h-4 w-4 text-school-maroon" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {storageStats ? formatBytes(storageStats.usedSpace) : '0 Bytes'}
              </div>
              <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% used</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Space</CardTitle>
              <HardDrive className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {storageStats ? formatBytes(storageStats.availableSpace) : '0 Bytes'}
              </div>
              <p className="text-xs text-muted-foreground">Remaining capacity</p>
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-school-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-school-maroon">
                {storageStats ? Number(storageStats.fileCount).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Uploaded files</p>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage Progress */}
        <Card className="border-school-gold/20 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-school-blue">Storage Usage</CardTitle>
            <CardDescription>Current storage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            {storageLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading storage data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Progress value={usagePercentage} className="h-4" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{storageStats ? formatBytes(storageStats.usedSpace) : '0 Bytes'} used</span>
                  <span>{storageStats ? formatBytes(storageStats.totalCapacity) : '0 Bytes'} total</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Type Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-school-blue">File Type Distribution</CardTitle>
              <CardDescription>Storage usage by file type</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading breakdown...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatBytes(BigInt(value as number))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-gold/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-school-blue">File Type Details</CardTitle>
              <CardDescription>Detailed storage breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-school-maroon/10 p-2">
                        <Image className="h-5 w-5 text-school-maroon" />
                      </div>
                      <div>
                        <p className="font-medium text-school-maroon">Images</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG, GIF</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-school-maroon">
                        {fileBreakdown ? formatBytes(fileBreakdown.images) : '0 Bytes'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-school-gold/10 p-2">
                        <Video className="h-5 w-5 text-school-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-school-maroon">Videos</p>
                        <p className="text-sm text-muted-foreground">MP4, MOV</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-school-maroon">
                        {fileBreakdown ? formatBytes(fileBreakdown.videos) : '0 Bytes'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-500/10 p-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-school-maroon">Documents</p>
                        <p className="text-sm text-muted-foreground">PDF, DOC, TXT</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-school-maroon">
                        {fileBreakdown ? formatBytes(fileBreakdown.documents) : '0 Bytes'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
