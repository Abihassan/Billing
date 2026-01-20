# Setup and run backend (FastAPI + PostgreSQL)

## 1. Create PostgreSQL database (example)
# open terminal:
psql -U postgres
# inside psql:
CREATE DATABASE billing_db;
\q

## 2. Copy .env.example -> .env and edit values
cp .env.example .env
# edit .env to set PG_PASSWORD etc.

## 3. Create virtualenv & install
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

## 4. Run the app
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# The API will be available at http://localhost:8000
# Open http://localhost:8000/docs for automatic OpenAPI docs
