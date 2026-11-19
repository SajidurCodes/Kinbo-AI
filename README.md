# Kinbo AI

A gadget-shopping assistant for Bangladesh. Kinbo answers product questions with live catalog queries and retrieves store policies before answering delivery or warranty questions. Its web interface includes a searchable-by-category catalog, expandable product details, conversation history, visible tool calls, and light and dark themes.

## Try Kinbo

| Experience | What to try |
| --- | --- |
| Hosted guided demo | Choose a sample question, filter the 16 seeded gadgets, expand a product, or switch themes. The static site uses a catalog snapshot and preset examples. |
| Full local application | Open [the gadget desk](http://localhost:8000/studio/). Ask a follow-up question and expand **Tool calls** beneath the reply. |
| API and MCP | Explore [interactive API docs](http://localhost:8000/docs) or connect an MCP client to `http://localhost:8000/mcp`. |

## Two questions that exercise the backend

**“Is the Samsung Galaxy A35 8/128 GB available?”** Gemini calls `search_products` to identify the variant and `get_product_details` to check PostgreSQL. The seed catalog lists BDT 38,999, zero units in stock, and a 12-month warranty.

**“My order is exactly BDT 20,000. What is delivery outside Dhaka?”** The assistant calls `search_policies`. The retrieved passage waives delivery charges at this threshold and estimates four working days.

## Implementation

- FastAPI serves the catalog, authentication, knowledge, chat, and MCP endpoints. The browser calls the catalog and chat APIs on the same origin.
- SQLAlchemy and Alembic manage PostgreSQL. The seed dataset contains 16 products across four categories.
- Gemini selects tools for catalog search, product details, alternatives, comparisons, and policy retrieval. Tool calls are returned alongside each assistant reply.
- EmbeddingGemma produces 768-dimensional vectors. The knowledge index includes 27 policy passages and 16 product descriptions. Hybrid search combines keyword and vector rankings using reciprocal rank fusion.
- MCP exposes five tools over stdio and HTTP, a product resource template, and a product comparison prompt.
- Registration uses Argon2 password hashes. Login issues signed JWTs. The course implementation checks the admin role on product creation. Catalog update and archive routes lack that check.

## Run the full project locally

Use Windows CMD, Docker Desktop with Linux containers, Python 3.12, and uv. Run commands from the repository root. The portfolio checkout mounts the frontend at `/studio/` in `app/main.py`.

1. Run `uv sync`. Copy `.env.example` to `.env` on a fresh clone. Configure these values to match the development Compose setup.

   ```dotenv
   APP_NAME="AI Sales Agent"
   DEBUG=false
   DB_HOST=db
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=sales_agent
   DB_SCHEMA=public
   GEMINI_API_KEY=<your-local-key>
   GEMINI_MODEL=gemini-3.5-flash-lite
   JWT_SECRET=<your-generated-secret>
   EMBEDDINGS_URL=http://embedder:80
   ```

   Generate a JWT secret locally with `uv run python -c "import secrets; print(secrets.token_hex(32))"`. Keep real secrets in the ignored .env file.

2. Start the services and check the embedder.

   ```cmd
   docker compose up --build -d
   curl.exe -i http://localhost:8090/health
   ```

   The embedder downloads its model on first startup. Wait for HTTP 200.

3. On a fresh database, run migrations, seed the catalog, and index the knowledge base. The ingestion script replaces the stored knowledge chunks. Existing initialized checkouts can skip this step.

   ```cmd
   docker compose run --rm --no-deps -v "%CD%\alembic:/app/alembic" -v "%CD%\alembic.ini:/app/alembic.ini:ro" api alembic upgrade head
   docker compose run --rm --no-deps -v "%CD%\scripts:/app/scripts:ro" api python -m scripts.seed_products
   docker compose run --rm --no-deps -v "%CD%\scripts:/app/scripts:ro" api python -m scripts.ingest_knowledge
   ```

4. Open the gadget desk and try the two questions above. Check the backend with `curl.exe http://localhost:8000/health/db`. To inspect MCP, run `uv run python -m scripts.mcp_check http://localhost:8000/mcp`.


