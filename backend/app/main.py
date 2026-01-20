from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.products.routes import router as products_router
from app.stock.routes import router as stock_router
from app.customers.routes import router as customers_router
from app.sales.routes import router as sales_router
from app.pending.routes import router as pending_router
from app.reports.routes import router as reports_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Billing Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(stock_router)
app.include_router(customers_router)
app.include_router(sales_router)
app.include_router(pending_router)
app.include_router(reports_router)

@app.get("/", include_in_schema=False)
def root():
    return {"status": "running"}
