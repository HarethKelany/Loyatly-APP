# Memory: index.md
Updated: now

Multi-tenant SaaS loyalty card platform - warm bakery aesthetic with DM Serif Display + DM Sans fonts

## Design System
- Primary: warm brown (25 65% 42%)
- Accent: terracotta (18 75% 55%)
- Background: warm cream (35 30% 97%)
- Success: green (145 60% 40%)
- Custom tokens: stamp-filled, stamp-empty, reward-glow, surface-warm

## Architecture
- Multi-tenant SaaS with three roles: SUPER_ADMIN, RESTAURANT_OWNER, CUSTOMER
- /join = customer onboarding (public, accepts ?r=restaurantId)
- /dashboard = legacy staff dashboard (kept for backward compat)
- /owner = restaurant owner dashboard (scoped by restaurant_id)
- /admin = super admin dashboard (platform-wide)
- /auth = login/signup with role-based redirect
- BakeBar = pilot tenant (restaurant id: 00000000-0000-0000-0000-000000626162)
- Super admin: harethkelany7@outlook.com

## Database Tables
### Original (kept for backward compat)
customers, passes, visits, rewards, reward_configs, staff_users, webhook_logs

### Multi-tenant additions
profiles (id→auth.users, role, restaurant_id), restaurants, loyalty_programs, activity_logs

## Key Rules
- Roles stored in profiles table, checked via get_user_role() security definer function
- RLS on all new tables using security definer functions to avoid recursion
- BakeBar data preserved as pilot tenant
- 7 visits = 1 free item (configurable per restaurant via loyalty_programs)
