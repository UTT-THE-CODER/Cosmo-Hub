# Cosmos Hub — Authentication Instructions

## 1. Authentication Goal

Add a complete authentication system to Cosmos Hub.

Users should be able to:

* Sign up with email and password
* Log in with email and password
* Log out
* Stay logged in after refreshing the page
* Reset their password
* View their authenticated state
* Access personalized features through their account

Authentication should use **Supabase Auth**.

Do NOT create a custom authentication backend.

Do NOT store passwords in localStorage.

---

# 2. Authentication Technology

Use:

```text
Supabase Auth
@supabase/supabase-js
React
React Router
```

Supabase will handle:

* password hashing
* authentication
* sessions
* refresh tokens
* user identity
* password reset

The React application should only communicate with Supabase through the official Supabase JavaScript client.

---

# 3. Environment Variables

Create:

```text
.env
```

with:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Also create:

```text
.env.example
```

with the same variable names but empty values.

Never hard-code Supabase credentials inside React components.

Never commit `.env`.

---

# 4. Supabase Client

Create:

```text
src/lib/supabase.js
```

This file should initialize the Supabase client.

All authentication functionality should use this single client.

Do not initialize Supabase separately in different components.

---

# 5. Authentication Pages

Create these pages:

```text
/login
/signup
/forgot-password
/reset-password
```

---

# 6. Login Page

The Login page should contain:

* Cosmos Hub branding
* Email input
* Password input
* Show/hide password button
* Login button
* Forgot Password link
* Link to Signup
* Optional Google login button only if configured

Validation:

* Email must be valid
* Password cannot be empty

Show clear error messages.

Examples:

```text
Invalid email or password
Please enter your email
Please enter your password
```

Do not expose raw Supabase/internal error messages directly to users.

---

# 7. Signup Page

The Signup page should contain:

* Name/display name
* Email
* Password
* Confirm password
* Signup button
* Link to Login

Validation:

* Name cannot be empty
* Email must be valid
* Password must satisfy the chosen minimum length
* Password and confirm password must match

Show useful errors such as:

```text
Passwords do not match
Please enter a valid email
This email is already registered
```

---

# 8. Password Requirements

Use a reasonable password policy.

At minimum:

* 8 characters

Optionally show a password strength indicator.

Do not make the password rules unnecessarily complicated for the hackathon MVP.

---

# 9. Forgot Password

Create:

```text
/forgot-password
```

User enters their email.

The application should request a password reset email through Supabase.

Show:

```text
If an account exists for this email, a password reset link has been sent.
```

Do not reveal whether a specific email exists in the system.

---

# 10. Reset Password

Create:

```text
/reset-password
```

User should be able to enter:

* New password
* Confirm new password

Validate that both passwords match.

After successful reset:

* show success message
* provide Login button

---

# 11. Authentication State

Create a centralized authentication context:

```text
src/context/AuthContext.jsx
```

The context should provide:

```text
user
session
loading
signUp()
signIn()
signOut()
resetPassword()
updatePassword()
```

Do not duplicate authentication logic across pages.

---

# 12. Session Persistence

Supabase should manage authentication sessions.

After:

```text
Login → Refresh browser
```

the user should remain logged in if the Supabase session is valid.

The app should display a loading state while the authentication state is being determined.

Avoid showing the Login page for a split second while the session is loading.

---

# 13. Navigation

Update the navbar based on authentication state.

### Logged Out

Show:

```text
Login
Sign Up
```

### Logged In

Show:

```text
My Cosmos
Profile/User Menu
Logout
```

The user's display name or email can be shown in the user menu.

---

# 14. Protected Routes

The following route should require authentication:

```text
/my-cosmos
```

Create:

```text
src/components/auth/ProtectedRoute.jsx
```

Behavior:

```text
User logged out
       ↓
tries /my-cosmos
       ↓
redirect to /login
       ↓
after successful login
       ↓
return to /my-cosmos
```

Do not protect the public exploration features.

These should remain accessible without login:

```text
/
/discover
/news
/quotes
/planet-lab
/about
```

---

# 15. My Cosmos + Authentication

Previously My Cosmos used localStorage.

After authentication is added:

* user authentication is handled by Supabase
* user-specific data should be associated with the authenticated user
* do not allow one user's private data to appear as another user's data

For the current MVP, it is acceptable to keep non-sensitive UI preferences in localStorage.

However, account-specific data should be structured so it can later be moved to Supabase database tables.

---

# 16. Profile

Add a small user profile section.

Display:

* Name
* Email
* Account status
* Logout button

Do not expose authentication tokens.

---

# 17. Logout

Logout should:

1. Call Supabase sign-out
2. Clear the current auth state
3. Redirect the user to Home
4. Update the navbar immediately

---

# 18. Loading States

Authentication actions should have loading states.

Example:

```text
Signing in...
Creating account...
Sending reset email...
Updating password...
Signing out...
```

Disable the relevant button while the request is running.

Prevent duplicate submissions.

---

# 19. Error Handling

Convert authentication errors into user-friendly messages.

Do not display raw technical errors such as:

```text
AuthApiError
invalid_grant
PostgREST error
```

Instead display understandable messages.

---

# 20. Route Behavior

Expected behavior:

```text
/
Public

/discover
Public

/news
Public

/quotes
Public

/planet-lab
Public

/about
Public

/my-cosmos
Protected

/login
Guest-only

/signup
Guest-only

/forgot-password
Public

/reset-password
Public
```

If an authenticated user visits `/login` or `/signup`, redirect them to `/my-cosmos` or Home.

---

# 21. UI Design

Authentication pages must match the existing Cosmos Hub design.

Use:

* dark space background
* stars
* glassmorphism
* subtle planetary visuals
* violet/cyan accents
* smooth animations
* responsive layout

The login/signup page should feel like part of Cosmos Hub, not a separate generic authentication template.

---

# 22. Security Requirements

Never:

* store passwords in localStorage
* store passwords in sessionStorage
* hard-code credentials
* expose private service-role keys
* put sensitive authentication logic in frontend code
* commit `.env`

Only the Supabase public/anonymous client key intended for frontend use should be used in the React application.

---

# 23. Database Scope

Do NOT build a custom database/backend right now.

Authentication should be handled by Supabase Auth.

Do not create FastAPI or Python.

Do not create custom login API endpoints.

Future database integration for saved planets, quotes, profiles, etc. can be added later.

---

# 24. File Structure

Use:

```text
src/
├── components/
│   └── auth/
│       ├── ProtectedRoute.jsx
│       ├── AuthForm.jsx
│       └── UserMenu.jsx
├── context/
│   └── AuthContext.jsx
├── lib/
│   └── supabase.js
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ForgotPassword.jsx
│   └── ResetPassword.jsx
└── App.jsx
```

Keep authentication components reusable.

---

# 25. Definition of Done

Authentication is complete when:

* Signup works
* Login works
* Logout works
* Session persists after refresh
* Forgot password works
* Reset password works
* Protected My Cosmos route works
* Logged-in navbar works
* Logged-out navbar works
* Authenticated users cannot access Login/Signup unnecessarily
* Loading states work
* Errors are user-friendly
* No passwords are stored locally
* No secrets are committed
* Mobile authentication UI works
* Authentication pages match Cosmos Hub's visual design
* Existing Cosmos Hub features continue working
