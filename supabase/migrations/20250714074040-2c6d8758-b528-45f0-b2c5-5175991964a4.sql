-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = $2
  );
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE USING (public.is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (you'll need to update this with actual admin user ID)
-- This is a placeholder - replace with actual user ID after user signs up
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_ADMIN_USER_ID', 'admin');