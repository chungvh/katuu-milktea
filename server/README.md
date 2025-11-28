# KATUU Mock Server

This is a lightweight mock API server for local development. It provides:

- /api/login (POST) - accepts { username, password } and returns a JWT and user info
- /api/me (GET) - verify token and return user info
- /api/admin-only (GET) - example protected route that requires role=admin

Usage:

1. Install dependencies:

```bash
cd server
npm install
```

2. Run server:

```bash
npm run start
```

By default it listens on http://localhost:4000

Note: This mock is for development only. Do NOT use in production.

