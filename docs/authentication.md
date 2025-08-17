# Authentication

## Overview

Xiomara implements a session-based authentication system with login, signup, and logout functionality.

## Key Files

- `actions/auth.ts`: Server actions for authentication operations
- `pages/LoginForm.tsx`: Login form component
- `pages/SignupForm.tsx`: Signup form component 
- `components/Navbar.tsx`: Contains logout functionality
- `lib/withAuth.tsx`: HOC for protecting authenticated routes

## Authentication Flow

1. **Login**: User submits credentials via `LoginForm`
   - On success: Redirects to dashboard
   - On failure: Displays error message

2. **Signup**: User creates account via `SignupForm`
   - On success: Creates account and logs in
   - On failure: Displays validation errors

3. **Logout**: User clicks logout in navbar dropdown
   - Terminates session and redirects to login page

4. **Auth Protection**: Routes requiring authentication check session validity
   - Invalid/missing session: Redirects to login page
   - Valid session: Allows access to requested page

## Login Implementation

The login form collects email and password, validates them, and submits to the login server action. On success, it sets an authentication cookie and redirects to the dashboard.

## Signup Implementation

The signup form collects user information, validates it using Zod schemas, and creates a new account. After successful creation, it automatically logs in the user.

## Session Management

Authentication state is maintained through HTTP-only cookies. The middleware checks these cookies for protected routes. The navbar displays the user menu only when authenticated.
