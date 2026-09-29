# GoodieTrack

MERN employee goodie distribution management system.

## Run locally

1. Start MongoDB locally, or provide a hosted MongoDB URI.
2. Create `backend/.env` from `backend/.env.example` and set `MONGO_URI` and `JWT_SECRET`.
3. Seed demo records and start the API:

```powershell
Set-Location backend
npm run seed
npm run dev
```
j
4. In another terminal:

```powershell
Set-Location frontend
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. Set `frontend/.env` with `VITE_API_URL` when the API is hosted elsewhere.

## Admin access

- Email: `admin@cirruslabs.io`
- Password: `admin123`

The backend protects every `/api/admin/*` route with JWT authentication and admin RBAC. Admin features currently supported are employee accounts, goodies and inventory, distribution events, distribution recording, and automatic stock decrementing.
