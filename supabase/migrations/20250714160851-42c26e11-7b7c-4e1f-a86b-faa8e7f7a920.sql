-- Security Fix: Prevent users from escalating their own roles
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Create more secure policies
-- Users can only view their own roles (read-only)
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Only admins can view ALL roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.is_admin());

-- Only admins can insert roles, and they cannot insert roles for themselves
CREATE POLICY "Admins can insert roles for others" ON public.user_roles
FOR INSERT WITH CHECK (
  public.is_admin() AND user_id != auth.uid()
);

-- Only admins can update roles, and they cannot update their own role
CREATE POLICY "Admins can update roles for others" ON public.user_roles
FOR UPDATE USING (
  public.is_admin() AND user_id != auth.uid()
);

-- Only admins can delete roles, and they cannot delete their own role
CREATE POLICY "Admins can delete roles for others" ON public.user_roles
FOR DELETE USING (
  public.is_admin() AND user_id != auth.uid()
);

-- Prevent ANY user from modifying their own role (additional safety)
CREATE POLICY "Users cannot modify their own roles" ON public.user_roles
FOR ALL USING (user_id != auth.uid());

-- Create a trigger to automatically assign 'user' role to new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();