# SplitPay — Payments & Expense Sharing

A full-stack app for splitting shared expenses (like a restaurant bill) equally
among a group, tracking who owes whom, and marking debts as settled — with a
bright, spring-garden-themed interface.

**Stack:** React + Vite (frontend) · FastAPI (backend) · MongoDB (database)

---

## Authentication

SplitPay is now behind a simple login: create an account (username + password),
log in, and every page after that is protected. A JWT is issued on
signup/login, stored in the browser, and sent as `Authorization: Bearer
<token>` on every API call; the backend rejects any request to
`/api/expenses`, `/api/balances`, `/api/settlements`, or `/api/dashboard`
without a valid one.

- **Signup** (`/signup`) — username, password (6+ chars), optional display name.
- **Login** (`/login`) — returns a token valid for 7 days.
- **Logout** — the sidebar's "Log out" button discards the token client-side
  and calls `/api/auth/logout` for the record. Note this is a stateless-JWT
  setup: there's no server-side session to revoke, so the discarded token
  would technically still validate if replayed before it expires. That's a
  reasonable tradeoff for an app like this; a production system wanting hard
  server-side revocation would add a token blocklist or move to short-lived
  access tokens + refresh tokens.
- Set `JWT_SECRET` in `backend/.env` to something long and random before
  deploying this anywhere real — the default in `.env.example` is a
  placeholder.

Login accounts are separate from expense **participants**: participants are
still just names you type when logging a bill (so you can split a bill with
someone who hasn't signed up), while your account determines the "I am…"
perspective used on the Dashboard.

## How it works

1. Log an expense: *"I paid ₹1200 for Alice, Bob and Charlie"* → SplitPay splits
   it equally (₹400 each) and records that Bob and Charlie each owe Alice ₹400.
2. The **Balances** page nets everything between each pair of people, so if
   Bob and Alice have debts running in both directions across several bills,
   you just see the one number that's actually outstanding.
3. When someone pays up, mark it **settled** — from the Balances or Settlement
   page — and the ledger updates immediately.
4. The **Dashboard** gives you a quick snapshot depending on who you say you
   are ("I am…" in the sidebar): total group spend, what's owed to you, what
   you owe, and how many settlements are still open.

---

## Project structure

```
expense-app/
├── backend/            FastAPI app
│   ├── app/
│   │   ├── main.py          # app entrypoint, CORS, router registration
│   │   ├── database.py      # MongoDB (Motor) connection + indexes
│   │   ├── models.py        # Pydantic request/response models
│   │   ├── helpers.py       # serialization + balance-netting logic
│   │   └── routers/
│   │       ├── expenses.py
│   │       ├── balances.py
│   │       ├── settlements.py
│   │       └── dashboard.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/            React + Vite app
    ├── src/
    │   ├── pages/            Dashboard, AddExpense, Balances, History, Settlement
    │   ├── components/       Sidebar, StatCard, Avatar, PeopleTagInput, Icons, ...
    │   ├── context/          UserContext (who am I), ToastContext (notifications)
    │   ├── api/client.js      axios wrapper around the REST API
    │   └── styles/           theme.css, layout.css, components.css, pages.css
    └── .env.example
```

---

## Data model (MongoDB)

**`expenses`** — one document per logged bill
```json
{
  "description": "Dinner at cafe",
  "amount": 1200,
  "paid_by": "Alice",
  "participants": ["Alice", "Bob", "Charlie"],
  "split_amount": 400,
  "expense_date": "2026-09-26",
  "created_at": "2026-09-26T07:30:31"
}
```

**`debts`** — one document per person's share of a bill (this is what actually
gets "settled")
```json
{
  "expense_id": "…",
  "description": "Dinner at cafe",
  "from_person": "Bob",
  "to_person": "Alice",
  "amount": 400,
  "status": "pending",
  "created_at": "…",
  "settled_at": null
}
```

Balances shown to the user are computed on the fly by netting all *pending*
`debts` between each pair of people — nothing is double-counted, and a pair
that nets to zero is automatically cleaned up.

---

## Running it locally

You'll need **Node.js 18+**, **Python 3.10+**, and a **MongoDB** instance
(local install, Docker, or a free MongoDB Atlas cluster all work).

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt

cp .env.example .env
# edit .env if your MongoDB isn't on localhost:27017

uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` — interactive docs at
`http://localhost:8000/docs`.

If you don't have MongoDB installed:
- **Docker (quickest):** `docker run -d -p 27017:27017 --name splitpay-mongo mongo:7`
- **Or** create a free cluster at MongoDB Atlas and put its connection string
  in `MONGODB_URI` in `.env`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install

cp .env.example .env
# defaults to http://localhost:8000, matching the backend above

npm run dev
```

Open `http://localhost:5173`. Set your name in "I am…" in the sidebar so the
Dashboard's "owed to you" / "you owe" figures are calculated from your
perspective.

### 3. Try it

1. Open `http://localhost:5173` — you'll land on **Sign up**. Create an
   account (any username/password; display name defaults to your username).
   You're logged in immediately and dropped on the Dashboard.
2. Go to **Add Expense** → log ₹1200 paid by "Alice" split with "Bob" and
   "Charlie" (Bob and Charlie don't need accounts — they're just names).
3. Check **Balances** — you'll see Bob and Charlie each owe Alice ₹400.
4. Go to **Settlement** and mark the Bob → Alice balance settled. Check
   **Balances** again — it's gone, and shows up under "Settled" / "Recently
   settled".
5. **Expense History** lets you search past bills and expand any one to see
   its individual per-person breakdown and settlement status.
6. Try **Log out** in the sidebar — you're bounced back to the login screen,
   and the app's API calls are rejected until you log in again.

---

## API reference (quick)

| Method | Path                     | Purpose                                   |
|--------|--------------------------|--------------------------------------------|
| POST   | `/api/auth/signup`       | Create an account, returns a JWT          |
| POST   | `/api/auth/login`        | `{username, password}` → JWT              |
| GET    | `/api/auth/me`           | Current authenticated user                |
| POST   | `/api/auth/logout`       | Auth-checked no-op (client discards token)|
| POST   | `/api/expenses`          | Log a new expense, auto-splits & creates debts |
| GET    | `/api/expenses`          | List all expenses (history)               |
| GET    | `/api/expenses/{id}`     | One expense + its individual debt breakdown |
| DELETE | `/api/expenses/{id}`     | Remove an expense and its debts           |
| GET    | `/api/expenses/people`   | Distinct list of people seen so far (for autocomplete) |
| GET    | `/api/balances`          | Net pending balances between every pair   |
| GET    | `/api/balances/settled`  | History of settled debts                  |
| POST   | `/api/settlements`       | `{from_person, to_person}` → clears the balance between them |
| GET    | `/api/dashboard?person=` | Totals scoped to one person               |

Full interactive docs (Swagger UI) are always available at `/docs` once the
backend is running.

---

## Notes & possible next steps

- Accounts (login) and expense participants are deliberately separate: your
  account sets the Dashboard's "I am…" perspective, but you can still split a
  bill with anyone by typing their name, account or not. A stricter version
  of this app might require every participant to have an account.
- Splits are always equal across participants. Unequal/custom splits would be
  a natural next feature (the data model already supports arbitrary
  `from_person`/`amount` pairs per expense, so it wouldn't require a rework).
- Redis isn't used — the app is simple enough that Mongo alone keeps things
  fast; it would only earn its place if you added caching for a much larger
  group/history.
