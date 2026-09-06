# 03: Create useLocation hook

**What to build:** A hook that manages GPS permission state, returns coordinates when available, and provides permission request/retry methods.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Returns coords (null or {latitude, longitude})
- [ ] Returns status: 'unknown' | 'denied' | 'unavailable' | 'available'
- [ ] requestPermission() prompts for location access
- [ ] retry() re-attempts location after failure
- [ ] Handles Android and iOS permission flows
