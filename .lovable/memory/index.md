Bakebar loyalty card platform - warm bakery aesthetic with DM Serif Display + DM Sans fonts

## Design System
- Primary: warm brown (25 65% 42%)
- Accent: terracotta (18 75% 55%)
- Background: warm cream (35 30% 97%)
- Success: green (145 60% 40%)
- Custom tokens: stamp-filled, stamp-empty, reward-glow, surface-warm

## Architecture
- /join = customer onboarding (public)
- /auth = staff login/register (public, Supabase Auth with auto-confirm)
- /dashboard = staff dashboard (protected route, requires auth)
- 7 visits = 1 free item cycle
- 5-digit unique customer codes

## Database Tables
customers, passes, visits, rewards, reward_configs, staff_users, webhook_logs

## Auth
- Supabase Auth with auto-confirm emails
- AuthProvider context in useAuth.tsx
- ProtectedRoute component wraps /dashboard
- No user profiles table — basic auth only

## Key Rules
- Stamps never expire
- Only one reward_config active at a time
