# Architecture Decision Record: Auth-Ready Guest Mode

**Status**: Accepted  
**Date**: 2026-09-04  
**Deciders**: Product team

## Context

OurMorocco MVP's core feature (show nearest 5 places) does not require user authentication. However, future features like favorites, history, and cross-device sync will require knowing user identity.

The template (`react-native-template-obytes`) comes with a complete auth system (Zustand store, protected routes, login screens), but wiring up Supabase OAuth adds complexity to MVP launch.

## Decision

**Implement "guest mode" as default**: Skip authentication for MVP, but architect the app to make adding auth a simple configuration toggle later.

### Implementation approach:

1. **Feature flag**: Add `AUTH_ENABLED = false` to environment config
2. **Guest user pattern**: Auth store returns synthetic guest user when auth disabled
3. **Conditional routing**: Skip login screen when `AUTH_ENABLED = false`
4. **Dormant Supabase client**: Prepare Supabase integration code but leave it inactive
5. **No template removal**: Keep all auth infrastructure from template intact

### When auth is needed (future):

1. Create Supabase project
2. Configure Google OAuth (Android) + Apple Sign In (iOS)
3. Set `AUTH_ENABLED = true` + add credentials to env
4. Install `@supabase/supabase-js`
5. No code changes to Places feature required

## Consequences

### Positive

- ✅ **Faster MVP launch** - Skip Supabase setup, OAuth configuration, and platform-specific auth testing
- ✅ **Lower cognitive load** - Users don't need to create accounts to try the app
- ✅ **Auth-ready architecture** - Adding auth later is a config change, not a refactor
- ✅ **Template preservation** - Keep proven auth patterns from template (Zustand + route guards)
- ✅ **Progressive enhancement** - Guest mode is valid long-term; auth unlocks premium features

### Negative

- ❌ **No user analytics** - Cannot track individual user behavior without identity
- ❌ **No personalization** - Cannot save favorites or history (future features blocked)
- ❌ **No abuse prevention** - Cannot rate-limit or ban bad actors (not relevant for read-only MVP)
- ❌ **Future migration work** - When auth is added, existing users start fresh (no account recovery)

### Mitigations

- **Analytics**: Use anonymous device IDs for basic usage metrics (Expo Analytics, Sentry)
- **Future migration**: When auth launches, provide seamless "Create account" flow; guest sessions don't need migration
- **Local state**: Store any user preferences (theme, language) in MMKV (template's local storage)

## Alternatives Considered

### 1. Implement Supabase Auth immediately

**Pros**: Future-proof, enables user features from day 1  
**Cons**: Delays MVP, adds complexity, requires Google/Apple developer account setup  
**Why rejected**: Over-engineered for read-only MVP

### 2. Remove all auth infrastructure from template

**Pros**: Simpler codebase, less dead code  
**Cons**: Need to rebuild auth system later; loses template's battle-tested patterns  
**Why rejected**: Template's auth is well-architected; keeping it costs nothing

### 3. Use email/password auth instead of OAuth

**Pros**: Simpler than OAuth setup, no platform-specific config  
**Cons**: Poor UX (friction), less secure, PRD specifies Google/Apple  
**Why rejected**: PRD explicitly requires OpenID Connect with Google/Apple

## Implementation Details

### Auth Store Pattern

```typescript
// src/features/auth/use-auth-store.tsx
export const useAuthStore = create<AuthState>((set) => ({
  user: Env.AUTH_ENABLED ? null : { id: 'guest', isGuest: true },
  status: Env.AUTH_ENABLED ? 'idle' : 'authenticated',
  
  signIn: async (provider: 'google' | 'apple') => {
    if (!Env.AUTH_ENABLED) return;
    // Future: Supabase OAuth
  },
}))
```

### Route Guard

```typescript
// src/app/_layout.tsx
if (!Env.AUTH_ENABLED) {
  return <Redirect href="/(app)" />; // Skip login
}
```

### Future-Ready User Features

```typescript
// Example: Favorites (ready for both modes)
const userId = useAuthStore(state => state.user?.id);

if (userId === 'guest') {
  // Guest mode: save to local storage
  await storage.set('favorites', JSON.stringify(favorites));
} else {
  // Authenticated: save to Supabase
  await supabase.from('favorites').insert({ user_id: userId, place_id });
}
```

## Rollout Strategy

### Phase 1 (MVP): Guest mode only
- Launch with `AUTH_ENABLED = false`
- Validate core feature (place discovery) works
- Gather user feedback

### Phase 2: Auth + Favorites
- Enable `AUTH_ENABLED = true`
- Add favorites feature (requires auth)
- Existing guest users see "Sign in to save favorites" prompt

### Phase 3: Premium features
- History tracking
- Cross-device sync
- Personalized recommendations

## Reversibility

This decision is **easily reversible**:
- Flip `AUTH_ENABLED = true` → auth is enabled
- Remove flag and always enable → permanent auth
- Remove auth entirely → delete unused code (1-2 hours)

Suitable for MVP; low risk to revisit.
