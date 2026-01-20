<<<<<<< HEAD
# Photo Studio & Gift Shop Management System

A complete business management system built with **React**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI** for the frontend, designed to connect with a **Django** backend API.

## 🚀 Features

### 📦 Product Management
- Add, edit, and delete products
- Track product categories (Frames, Albums, Mugs, Passport Photos, Printing, etc.)
- Monitor stock levels with visual indicators
- Low stock alerts

### 👥 Customer Management
- Manage retail and wholesale customers
- Phone number validation (10-digit Indian format)
- Track pending balances for wholesale customers
- Customer purchase history

### 🧾 Sales / Billing
- Point-of-Sale (POS) interface
- Product search with instant suggestions
- Shopping cart functionality
- Automatic stock updates
- Invoice generation with company details
- Print and WhatsApp sharing capabilities
- Support for retail (no pending) and wholesale (with pending) customers

### 💰 Pending Payment Management
- Track wholesale customer pending balances
- Accept partial payments
- Automatic calculation of new pending balance
- Payment history tracking

### 📊 Stock Management
- Add or remove stock for any product
- Visual stock level indicators
- Real-time stock updates

### 📈 Reports & Analytics
- Daily sales summaries
- Product-wise reports
- Customer purchase reports
- Pending balance reports

---

## 🏗️ Project Structure

```
photo-gift-shop-frontend/
├── src/
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ProductModal.tsx       # Add/Edit product form
│   │   │   ├── CustomerModal.tsx      # Add/Edit customer form
│   │   │   ├── PaymentModal.tsx       # Accept payment for wholesale
│   │   │   ├── InvoiceModal.tsx       # Invoice generation & printing
│   │   │   └── StockModal.tsx         # Update stock
│   │   ├── ui/                        # Shadcn UI components
│   │   ├── Layout.tsx                 # Main layout with sidebar
│   │   ├── NavLink.tsx                # Navigation links
│   │   └── StatCard.tsx               # Dashboard statistics cards
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx              # Business overview
│   │   ├── Products.tsx               # Product management
│   │   ├── Customers.tsx              # Customer management
│   │   ├── Sales.tsx                  # POS / Billing interface
│   │   ├── Stock.tsx                  # Stock management
│   │   ├── Pending.tsx                # Pending payments
│   │   ├── Reports.tsx                # Sales reports
│   │   └── Settings.tsx               # Application settings
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios configuration
│   │   ├── productService.ts          # Product API calls
│   │   ├── customerService.ts         # Customer API calls
│   │   ├── salesService.ts            # Sales API calls
│   │   └── pendingService.ts          # Pending payment API calls
│   │
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   │
│   ├── data/
│   │   └── mockData.ts                # Mock data for development
│   │
│   ├── App.tsx                        # Main app component with routing
│   └── main.tsx                       # Entry point
│
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🔌 Connecting to Django Backend

### 1. **Configure API Base URL**

Open `src/services/api.ts` and set your Django backend URL:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';
```

For production, create a `.env` file:

```env
VITE_API_URL=https://your-django-backend.com/api
```

### 2. **Django Backend API Endpoints**

Your Django backend should implement the following REST API endpoints:

#### **Products**
```
GET    /api/products/              # Get all products
POST   /api/products/              # Create product
GET    /api/products/{id}/         # Get single product
PUT    /api/products/{id}/         # Update product
DELETE /api/products/{id}/         # Delete product
PATCH  /api/products/{id}/stock/   # Update stock
```

#### **Customers**
```
GET    /api/customers/             # Get all customers
POST   /api/customers/             # Create customer
GET    /api/customers/{id}/        # Get single customer
PUT    /api/customers/{id}/        # Update customer
DELETE /api/customers/{id}/        # Delete customer
```

#### **Sales**
```
GET    /api/sales/                 # Get all sales
POST   /api/sales/                 # Create sale
GET    /api/sales/{id}/            # Get single sale
GET    /api/customers/{id}/sales/  # Get customer purchase history
```

Query parameters for filtering:
- `start_date` - Filter sales from date (YYYY-MM-DD)
- `end_date` - Filter sales to date (YYYY-MM-DD)

#### **Pending Payments**
```
GET    /api/pending/               # Get all pending payments
POST   /api/pending/payment/       # Accept payment
GET    /api/customers/{id}/pending/ # Get customer pending history
```

### 3. **Expected Data Formats**

#### Product Object
```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "buyPrice": "number",
  "sellPrice": "number",
  "stock": "number"
}
```

#### Customer Object
```json
{
  "id": "string",
  "name": "string",
  "phone": "string",
  "type": "retail" | "wholesale",
  "pending": "number"
}
```

#### Sale Object
```json
{
  "id": "string",
  "invoiceNumber": "string",
  "date": "ISO string",
  "customerId": "string",
  "customerName": "string",
  "customerType": "retail" | "wholesale",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "subtotal": "number",
  "total": "number",
  "paid": "number",
  "pending": "number",
  "paymentMethod": "string"
}
```

#### Pending Payment Object
```json
{
  "id": "string",
  "customerId": "string",
  "customerName": "string",
  "date": "ISO string",
  "oldPending": "number",
  "paid": "number",
  "newPending": "number"
}
```

### 4. **Django Backend Setup (CSV Storage)**

Your Django backend should handle CSV file storage for:

```
csv_files/
├── products.csv
├── customers.csv
├── sales.csv
├── pending_history.csv
└── daily_summary.csv
```

Each Django app should have a `csv_handler.py` module with CRUD functions.

#### Example: `csv_handler.py` for Products

```python
import csv
import os

CSV_FILE = 'csv_files/products.csv'

def read_products():
    """Read all products from CSV"""
    products = []
    if os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'r') as file:
            reader = csv.DictReader(file)
            products = list(reader)
    return products

def write_products(products):
    """Write all products to CSV"""
    with open(CSV_FILE, 'w', newline='') as file:
        if products:
            writer = csv.DictWriter(file, fieldnames=products[0].keys())
            writer.writeheader()
            writer.writerows(products)

def create_product(product):
    """Add new product"""
    products = read_products()
    products.append(product)
    write_products(products)
    return product

def update_product(product_id, updated_data):
    """Update existing product"""
    products = read_products()
    for i, product in enumerate(products):
        if product['id'] == product_id:
            products[i].update(updated_data)
            break
    write_products(products)
    return updated_data

def delete_product(product_id):
    """Delete product"""
    products = read_products()
    products = [p for p in products if p['id'] != product_id]
    write_products(products)
```

### 5. **CORS Configuration**

Add CORS headers to your Django backend to allow requests from the React app:

```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "https://your-frontend-domain.com",  # Production
]
```

### 6. **Error Handling**

The frontend includes automatic error handling via Axios interceptors:

- **401 Unauthorized**: Redirects to login (if implemented)
- **Network errors**: Shows user-friendly error messages
- **Validation errors**: Displays inline form errors

All errors are logged to the console for debugging.

### 7. **Authentication (Optional)**

If you implement authentication in Django:

1. Store the JWT token in `localStorage` after login
2. The Axios interceptor will automatically attach it to all requests
3. Implement token refresh logic in `src/services/api.ts`

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Django 4+ with Django REST Framework

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd photo-gift-shop-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run on `http://localhost:5173`

### Backend Setup (Django)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-cors-headers

# Create Django project
django-admin startproject photo_gift_shop
cd photo_gift_shop

# Create apps
python manage.py startapp products
python manage.py startapp customers
python manage.py startapp sales
python manage.py startapp pending

# Create CSV storage directory
mkdir csv_files

# Run server
python manage.py runserver
```

---

## 📝 Usage

### Development Mode

The frontend currently uses **mock data** stored in `src/data/mockData.ts`. All CRUD operations work locally without a backend.

To connect to Django:

1. Set up your Django backend following the API structure above
2. Update `VITE_API_URL` in `.env`
3. The services will automatically switch to API calls

### Form Validations

- **Products**: Name required, sell price > buy price, stock ≥ 0
- **Customers**: Name required, valid 10-digit phone number (starts with 6-9)
- **Payments**: Amount > 0, amount ≤ pending balance
- **Stock**: Quantity must be valid, cannot reduce more than available

### Invoice Features

- **Print**: Opens browser print dialog
- **WhatsApp Share**: Opens WhatsApp with pre-filled invoice text
- **Company Details**: Edit in `src/components/modals/InvoiceModal.tsx`

---

## 🎨 Customization

### Company Information

Update company details in `src/components/modals/InvoiceModal.tsx`:

```typescript
const COMPANY_INFO = {
  name: 'Your Company Name',
  address: 'Your Address',
  phone: '+91 XXXXXXXXXX',
  email: 'your-email@example.com',
  gstin: 'YOUR_GSTIN',
};
```

### Product Categories

Edit categories in `src/components/modals/ProductModal.tsx`:

```typescript
const categories = ['Frames', 'Albums', 'Mugs', 'Passport Photos', 'Printing', 'Other'];
```

### Colors & Theme

Customize in `src/index.css` and `tailwind.config.ts`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** with sensitive API keys
2. **Validate all inputs** on both frontend and backend
3. **Use HTTPS** in production
4. **Implement authentication** for production use
5. **Sanitize CSV data** to prevent injection attacks
6. **Rate limit** API endpoints to prevent abuse

---

## 📦 Build for Production

```bash
# Build frontend
npm run build

# Output will be in dist/ folder
# Deploy to any static hosting (Netlify, Vercel, etc.)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure `django-cors-headers` is installed and configured
- Check `CORS_ALLOWED_ORIGINS` in Django settings

### API Connection Failed
- Verify `VITE_API_URL` in `.env`
- Check that Django server is running
- Inspect network tab in browser DevTools

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: abihassan415.k@gmail.com

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, Shadcn UI, and Django**
=======
# Billing
>>>>>>> 8a804ff69c77f485421b2a3cc2399a2f2ce8fda1
