# Atlanta RSOC

Atlanta RSOC (Road Safety Operations Center) is an AI-powered platform for monitoring and analyzing road safety conditions across the Atlanta metro area. It combines real-time traffic incident feeds with historical crash data to support operational decision-making.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Leaflet |
| Backend | Node.js, Express |
| AI | Anthropic Claude API |
| Data | GDOT 511 API, NHTSA FARS |

---

## Running Locally

**1. Clone the repository**

```bash
git clone <repo-url>
cd atlanta-rsoc
```

**2. Install dependencies**

```bash
npm run install:all
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3001
GDOT_511_KEY=your_511ga_developer_key
```

**4. Start the backend server**

```bash
cd server
node index.js
```

**5. Start the frontend dev server** (in a separate terminal)

```bash
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Data Sources

### GDOT 511 (`511ga.org`)

The Georgia Department of Transportation's 511 system provides real-time traffic events including incidents, construction, and road closures across the state highway network. A free developer API key can be obtained by registering at [511ga.org/my511/register](https://511ga.org/my511/register).

### NHTSA FARS (Fatality Analysis Reporting System)

The National Highway Traffic Safety Administration's FARS dataset contains census-level data on fatal motor vehicle crashes in the United States. This project uses FARS data for historical crash analysis and trend identification in the Atlanta region. The dataset is publicly available via the [NHTSA FARS API](https://crashviewer.nhtsa.dot.gov/CrashAPI).
