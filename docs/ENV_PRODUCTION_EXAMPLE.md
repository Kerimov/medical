# Production env example

**Do not commit real secrets.** Put real values into your hosting provider (Vercel / server env vars).

## Required

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

## Optional (AI chat)

```bash
OPENAI_API_KEY="your_openai_key"
# Optional:
OPENAI_MODEL="gpt-4o-mini"
```


