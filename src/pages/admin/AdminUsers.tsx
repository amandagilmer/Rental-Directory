import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Shield, Truck, Home, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserWithRole {
  id: string;
  email: string;
  business_name: string | null;
  location: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user' | null;
  user_type: 'renter' | 'host' | 'both' | null;
  marketing_consent: boolean | null;
  plan?: string | null;
  subscription_status?: string | null;
  full_name?: string | null;
  is_banned?: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newPlan, setNewPlan] = useState<string>('Free');
  const [newStatus, setNewStatus] = useState<string>('active');
  const [isBanned, setIsBanned] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          business_name: profile.business_name,
          location: profile.location,
          created_at: profile.created_at || '',
          role: userRole?.role || null,
          user_type: profile.user_type,
          marketing_consent: profile.marketing_consent,
          plan: profile.plan || 'Free',
          subscription_status: profile.subscription_status || 'active',
          full_name: profile.full_name,
          is_banned: profile.is_banned || false,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = async () => {
    if (!selectedUser) return;
    setUpdating(true);

    try {
      // 1. Update Role
      if (newRole === 'none') {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id);
      } else {
        await supabase
          .from('user_roles')
          .upsert({
            user_id: selectedUser.id,
            role: newRole as 'admin' | 'moderator' | 'user',
          }, { onConflict: 'user_id,role' });
      }

      // 2. Update Profile (Plan & Status)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: newPlan,
          subscription_status: newStatus,
          is_banned: isBanned
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      toast.success('User updated successfully');
      setShowManageDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Are you sure you want to PERMANENTLY delete user ${selectedUser.email}? This action cannot be undone and will remove all their data and listings.`)) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User and all associated data deleted successfully');
      setShowManageDialog(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.business_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' ||
      (roleFilter === 'none' && !user.role) ||
      user.role === roleFilter;

    const matchesUserType = userTypeFilter === 'all' ||
      (userTypeFilter === 'none' && !user.user_type) ||
      user.user_type === userTypeFilter;

    return matchesSearch && matchesRole && matchesUserType;
  });

  const getUserTypeBadge = (userType: string | null) => {
    if (!userType) return <Badge variant="outline">Not Set</Badge>;

    const config: Record<string, { class: string; icon: React.ReactNode; label: string }> = {
      renter: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Users className="h-3 w-3 mr-1" />, label: 'Renter' },
      host: { class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Truck className="h-3 w-3 mr-1" />, label: 'Host/Vendor' },
      both: { class: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: <Home className="h-3 w-3 mr-1" />, label: 'Both' },
    };

    const { class: className, icon, label } = config[userType] || { class: '', icon: null, label: userType };

    return (
      <Badge className={`${className} flex items-center`} variant="outline">
        {icon}
        {label}
      </Badge>
    );
  };

  // Stats for quick overview
  const stats = {
    totalRenters: users.filter(u => u.user_type === 'renter').length,
    totalHosts: users.filter(u => u.user_type === 'host').length,
    totalBoth: users.filter(u => u.user_type === 'both').length,
    totalPro: users.filter(u => u.plan === 'Pro' || u.plan === 'Premium').length,
    marketingOptIn: users.filter(u => u.marketing_consent).length,
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline">No Role</Badge>;

    const colors: Record<string, string> = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      moderator: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      user: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    return (
      <Badge className={colors[role] || ''} variant="outline">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage users, roles, and marketing segmentation</p>
      </div>

      {/* Segmentation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRenters}</p>
                <p className="text-xs text-muted-foreground">Renters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalHosts}</p>
                <p className="text-xs text-muted-foreground">Hosts/Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBoth}</p>
                <p className="text-xs text-muted-foreground">Both Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPro}</p>
                <p className="text-xs text-muted-foreground">Pro/Premium Fleet</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{users.length} total users</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="renter">Renters</SelectItem>
                  <SelectItem value="host">Hosts/Vendors</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">Not Set</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="none">No Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Business / Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {user.full_name && <span className="text-xs text-muted-foreground font-normal">{user.full_name}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{user.business_name || '-'}</TableCell>
                  <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "font-bold",
                        user.plan === 'Free' ? "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" :
                          user.plan === 'Pro' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      )}
                      variant="outline"
                    >
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewRole(user.role || 'none');
                        setNewPlan(user.plan || 'Free');
                        setNewStatus(user.subscription_status || 'active');
                        setIsBanned(user.is_banned || false);
                        setShowManageDialog(true);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Manage User
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0A0F1C] border-white/10 text-white dark">
          <DialogHeader>
            <DialogTitle className="text-white font-display uppercase italic tracking-tight">Manage User Account</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update permissions and subscription plan for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Access Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Role</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Tier</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free / Starter</SelectItem>
                  <SelectItem value="Pro">Pro Fleet</SelectItem>
                  <SelectItem value="Premium">Premium Fleet</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active / Healthy</SelectItem>
                  <SelectItem value="past_due">Past Due / Error</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Access</label>
              <div className="flex items-center gap-2 p-3 border rounded-md border-white/10 bg-white/5">
                <input
                  type="checkbox"
                  id="is_banned"
                  checked={isBanned}
                  onChange={(e) => setIsBanned(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_banned" className="text-sm font-medium cursor-pointer text-white">
                  Ban this user (Deny access to platform)
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full border-blue-600/50 text-blue-400 hover:bg-blue-600/20"
                asChild
              >
                <Link to="/admin/badges">
                  <Award className="h-4 w-4 mr-2" />
                  Award Badges to this User
                </Link>
              </Button>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <label className="text-sm font-medium text-red-500 uppercase tracking-widest text-[10px]">Danger Zone</label>
              <Button
                variant="destructive"
                className="w-full bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white"
                onClick={handleDeleteUser}
                disabled={deleting || updating}
              >
                {deleting ? "Deleting..." : "Delete User Account Permanently"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => setShowManageDialog(false)} disabled={updating || deleting}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUserUpdate} disabled={updating || deleting}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
