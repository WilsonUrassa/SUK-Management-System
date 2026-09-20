import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const protectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/people") || pathname.startsWith("/finance") || pathname.startsWith("/inventory") || pathname.startsWith("/operations") || pathname.startsWith("/reports") || pathname.startsWith("/settings") || pathname.startsWith("/onboarding");
  if (!url || !key) {
    if (protectedPath) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.searchParams.set("error", "configuration");
      return NextResponse.redirect(login);
    }
    return response;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (protectedPath && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = { matcher: ["/dashboard/:path*","/people/:path*","/finance/:path*","/inventory/:path*","/operations/:path*","/reports/:path*","/settings/:path*","/onboarding/:path*"] };
