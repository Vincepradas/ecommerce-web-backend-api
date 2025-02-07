
---

# E-commerce API

An API for an e-commerce platform I built with Node.js, Express, MongoDB, and GCash payment integration for my mom's small business.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [User Routes](#user-routes)
  - [Product Routes](#product-routes)
  - [Cart Routes](#cart-routes)
  - [Order Routes](#order-routes)
  - [Payment Routes](#payment-routes)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- User registration and authentication
- Role-based access control (Admin/User)
- CRUD operations for products
- Cart management for users
- Order management with payment integration via GCash
- Admin access to view and manage orders

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ecommerce-api.git
   cd ecommerce-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file (see [Environment Variables](#environment-variables) below).

4. Run the server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```plaintext
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
XENDIT_SECRET_KEY=your_xendit_secret_key
```

Replace the values with your actual environment settings.

## API Documentation

### User Routes

| Route               | HTTP Method | Description                     |
|---------------------|-------------|---------------------------------|
| `/api/users/register` | POST        | Register a new user             |
| `/api/users/login`    | POST        | Login for users and admin       |
| `/api/users/profile`  | GET         | Get logged-in user's profile    |
| `/api/users/profile`  | PUT         | Update logged-in user's profile |
| `/api/users`          | GET         | Admin only: Get all users       |

### Product Routes

| Route               | HTTP Method | Description                       |
|---------------------|-------------|-----------------------------------|
| `/api/products`       | GET         | Get all products                  |
| `/api/products/:id`   | GET         | Get a single product by ID        |
| `/api/products`       | POST        | Admin only: Create a new product  |
| `/api/products/:id`   | PUT         | Admin only: Update product by ID  |
| `/api/products/:id`   | DELETE      | Admin only: Delete product by ID  |

### Cart Routes

| Route                   | HTTP Method | Description                   |
|-------------------------|-------------|-------------------------------|
| `/api/cart`             | GET         | Get logged-in user's cart     |
| `/api/cart/add`         | POST        | Add product to cart           |
| `/api/cart/update`      | PUT         | Update item quantity in cart  |
| `/api/cart/remove/:id`  | DELETE      | Remove an item from cart      |

### Order Routes

| Route                    | HTTP Method | Description                            |
|--------------------------|-------------|----------------------------------------|
| `/api/orders`            | GET         | Admin only: Get all orders             |
| `/api/orders/my-orders`  | GET         | Get logged-in user's orders            |
| `/api/orders/:id`        | GET         | Get order details by ID                |
| `/api/orders`            | POST        | Create a new order from user's cart    |
| `/api/orders/:id/status` | PUT         | Admin only: Update order status by ID  |
| `/api/orders/:id/cancel` | DELETE      | Cancel the order (user or admin)       |

### Payment Routes

| Route                    | HTTP Method | Description                        |
|--------------------------|-------------|------------------------------------|
| `/api/payments/gcash`    | POST        | Initiate GCash payment             |
| `/api/payments/callback/gcash` | POST | Handle GCash payment callback      |

## Usage

1. **Register a User**: Send a POST request to `/api/users/register` with `{ "name": "Your Name", "email": "your.email@example.com", "password": "yourpassword" }`.

2. **Login**: Send a POST request to `/api/users/login` to receive a JWT token, which you'll need to access protected routes.

3. **Add Products (Admin Only)**: Admin users can add products via `/api/products` (POST).

4. **Add Items to Cart**: Send a POST request to `/api/cart/add` to add items to your cart.

5. **Create an Order**: When ready to purchase, send a POST request to `/api/orders`.

6. **Initiate Payment**: After creating an order, initiate GCash payment by sending a POST request to `/api/payments/gcash` with details like amount and orderId.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

## License

This project is licensed under the MIT License.

---
