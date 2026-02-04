import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { 
  useGetCallerRole, 
  useGetAllAdminUsers, 
  useCreateAdminUser, 
  useUpdateAdminUserPermissions,
  useSetAdminUserStatus,
  useDeleteAdminUser 
} from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, UserPlus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { AdminPermission, AdminUserData } from '@/backend';
import { toast } from 'sonner';

const PERMISSION_LABELS: Record<AdminPermission, string> = {
  [AdminPermission.ManageBanners]: 'Manage Banners',
  [AdminPermission.ManageSlider]: 'Manage School Activities',
  [AdminPermission.ManageHymn]: 'Manage BNHS Hymn',
  [AdminPermission.ManageHeritage]: 'Manage History',
  [AdminPermission.ManageCitizenCharter]: 'Manage Citizen Charter',
  [AdminPermission.ManageAlumni]: 'Manage Alumni',
  [AdminPermission.ManageClubs]: 'Manage Clubs',
  [AdminPermission.ManageResources]: 'Manage Resources',
  [AdminPermission.ManageFooter]: 'Manage Footer',
};

export default function UserManagementPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerRole();
  const { data: adminUsers, isLoading: usersLoading, refetch } = useGetAllAdminUsers();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  
  const [formData, setFormData] = useState({
    principal: '',
    name: '',
    email: '',
    permissions: [] as AdminPermission[],
  });

  const createMutation = useCreateAdminUser();
  const updatePermissionsMutation = useUpdateAdminUserPermissions();
  const setStatusMutation = useSetAdminUserStatus();
  const deleteMutation = useDeleteAdminUser();

  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to access user management.
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
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (role !== 'SuperAdmin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
        <div className="container mx-auto px-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only Super Admin can access user management.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleCreateUser = async () => {
    try {
      await createMutation.mutateAsync({
        userPrincipal: formData.principal,
        name: formData.name,
        email: formData.email,
        permissions: formData.permissions,
      });
      toast.success('Admin user created successfully');
      setIsCreateDialogOpen(false);
      setFormData({ principal: '', name: '', email: '', permissions: [] });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin user');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;
    try {
      await updatePermissionsMutation.mutateAsync({
        userPrincipal: selectedUser.principal.toString(),
        permissions: formData.permissions,
      });
      toast.success('Permissions updated successfully');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ principal: '', name: '', email: '', permissions: [] });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions');
    }
  };

  const handleToggleStatus = async (user: AdminUserData) => {
    try {
      await setStatusMutation.mutateAsync({
        userPrincipal: user.principal.toString(),
        isActive: !user.isActive,
      });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: AdminUserData) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(user.principal.toString());
      toast.success('User deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const openEditDialog = (user: AdminUserData) => {
    setSelectedUser(user);
    setFormData({
      principal: user.principal.toString(),
      name: user.name,
      email: user.email,
      permissions: user.permissions,
    });
    setIsEditDialogOpen(true);
  };

  const togglePermission = (permission: AdminPermission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate({ to: '/admin/dashboard' })} 
              className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white border-none"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-school-blue">User Management</h1>
          </div>
          <Button
            onClick={() => {
              setFormData({ principal: '', name: '', email: '', permissions: [] });
              setIsCreateDialogOpen(true);
            }}
            className="gap-2 bg-[#800000] hover:bg-[#9a0000] text-white border-none"
          >
            <UserPlus className="h-4 w-4 text-white" />
            Create Admin User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>Manage admin user accounts and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p className="text-center text-muted-foreground">Loading users...</p>
            ) : !adminUsers || adminUsers.length === 0 ? (
              <p className="text-center text-muted-foreground">No admin users yet. Create one to get started.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((user) => (
                    <TableRow key={user.principal.toString()}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {PERMISSION_LABELS[perm]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Admin User</DialogTitle>
              <DialogDescription>
                Create a new admin user account with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  value={formData.principal}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal: e.target.value }))}
                  placeholder="Enter user's Internet Identity Principal ID"
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter user's name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter user's email"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={formData.permissions.includes(key as AdminPermission)}
                        onCheckedChange={() => togglePermission(key as AdminPermission)}
                      />
                      <label htmlFor={key} className="text-sm cursor-pointer">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={!formData.principal || !formData.name || createMutation.isPending}
                className="bg-[#800000] hover:bg-[#9a0000] text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Permissions</DialogTitle>
              <DialogDescription>
                Update permissions for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${key}`}
                        checked={formData.permissions.includes(key as AdminPermission)}
                        onCheckedChange={() => togglePermission(key as AdminPermission)}
                      />
                      <label htmlFor={`edit-${key}`} className="text-sm cursor-pointer">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePermissions}
                disabled={updatePermissionsMutation.isPending}
                className="bg-[#800000] hover:bg-[#9a0000] text-white"
              >
                {updatePermissionsMutation.isPending ? 'Updating...' : 'Update Permissions'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
