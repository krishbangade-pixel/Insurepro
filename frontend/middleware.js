import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for Supabase Auth
 * - Refreshes the auth session on every request
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users away from /login and /register
 */
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use `supabase.auth.getSession()` in middleware.
  // Use `supabase.auth.getUser()` which validates the session with the server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const dashboardForRole = (role) => {
    if (role === 'Insurance Agent') return '/agent/dashboard';
    if (role === 'Customer') return '/customer/dashboard';
    return '/dashboard';
  };

  // Auth callback route (always allow)
  if (pathname.startsWith('/auth/callback')) {
    return supabaseResponse;
  }

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Resolve role: profiles table is the authoritative source.
  // user_metadata.role is a secondary fallback for accounts created outside the app.
  let role = 'Admin'; // Default to Admin for unresolved cases (avoids blocking admin navigation)

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        // Profile table is the authoritative source
        role = profile.role;
      } else if (user?.user_metadata?.role) {
        // Fallback to Supabase auth user_metadata if profile not found
        role = user.user_metadata.role;
      } else {
        // Last resort: infer from current path to avoid locking user out
        if (pathname.startsWith('/agent')) role = 'Insurance Agent';
        else if (pathname.startsWith('/customer')) role = 'Customer';
        else role = 'Admin';
      }
    } catch {
      // If profile fetch fails entirely, infer from path to avoid redirect loops
      if (pathname.startsWith('/agent')) role = 'Insurance Agent';
      else if (pathname.startsWith('/customer')) role = 'Customer';
      else role = 'Admin';
    }
  }

  // If user is logged in and trying to access auth pages, redirect to their own dashboard.
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardForRole(role);
    return NextResponse.redirect(url);
  }

  // Do not allow a user to open another role's portal by editing the URL.
  const isAgentRoute = pathname.startsWith('/agent');
  const isCustomerRoute = pathname.startsWith('/customer');
  const isAdminRoute = !isPublicRoute && pathname !== '/' && !isAgentRoute && !isCustomerRoute;
  const routeIsAllowed =
    (role === 'Admin' && isAdminRoute) ||
    (role === 'Insurance Agent' && isAgentRoute) ||
    (role === 'Customer' && isCustomerRoute);

  if (user && !routeIsAllowed && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = dashboardForRole(role);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, png etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
