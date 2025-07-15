import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AlertTriangle, Users, Shield, Plus } from 'lucide-react';
import { EnhancedSecurityMonitor } from './EnhancedSecurityMonitor';
import { validateEmail, sanitizeInput, logSecurityEvent } from '@/utils/security';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const { isAdmin, loading } = useSecureAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && !loading) {
      fetchUsers();
      fetchUserRoles();
    }
  }, [isAdmin, loading]);

  const fetchUsers = async () => {
    try {
      // Note: This would require an edge function to fetch auth.users data
      // For now, we'll work with user_roles table
      console.log('Users fetch would be implemented via edge function');
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to fetch user roles');
    }
  };

  const addUserRole = async () => {
    const sanitizedEmail = sanitizeInput(newUserEmail);
    
    if (!sanitizedEmail.trim()) {
      toast.error('Please enter a user email');
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // This would require finding the user by email first
      // For demo purposes, showing the structure
      toast.info('User role management requires user lookup by email - implement via edge function');
      
      logSecurityEvent('admin_add_user_role', {
        targetEmail: sanitizedEmail,
        role: newUserRole
      });
      
      setNewUserEmail('');
      setNewUserRole('user');
    } catch (error) {
      console.error('Error adding user role:', error);
      toast.error('Failed to add user role');
      logSecurityEvent('admin_add_user_role_failed', {
        targetEmail: sanitizedEmail,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;
      
      toast.success(`User role updated to ${newRole}`);
      logSecurityEvent('admin_update_user_role', {
        targetUserId: userId,
        newRole
      });
      fetchUserRoles();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      logSecurityEvent('admin_update_user_role_failed', {
        targetUserId: userId,
        error: String(error)
      });
    }
  };

  const removeUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      
      toast.success('User role removed');
      logSecurityEvent('admin_remove_user_role', {
        roleId
      });
      fetchUserRoles();
    } catch (error) {
      console.error('Error removing user role:', error);
      toast.error('Failed to remove user role');
      logSecurityEvent('admin_remove_user_role_failed', {
        roleId,
        error: String(error)
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access the admin panel.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security Monitor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-6">
          {/* Add New User Role */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add User Role
          </CardTitle>
          <CardDescription>
            Assign roles to users by their email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="User email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newUserRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setNewUserRole(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addUserRole} disabled={isLoading}>
              Add Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current User Roles ({userRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-muted-foreground">No user roles found.</p>
          ) : (
            <div className="space-y-2">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">User ID: {userRole.user_id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {userRole.role} • Created: {new Date(userRole.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={userRole.role}
                      onValueChange={(value: 'admin' | 'moderator' | 'user') => 
                        updateUserRole(userRole.user_id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeUserRole(userRole.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <EnhancedSecurityMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};