## Develop

### Requirements

- OpenAI API key
- PostgreSQL database

### Steps

1. Install dependencies (from project root):

   ```bash
   npm i
   ```

2. In **apps/backend**, create a **.env** file:

   ```typescript
   OPENAI_API_KEY = your_openai_api_key;
   DATABASE_URL = your_postgres_url;
   ```

3. Back in the root, run:

   ```bash
   npm run dev
   ```

4. In Chrome, open **chrome://extensions/**
   - Enable Developer mode
   - Click **Load unpacked** and select apps/frontend/dis
