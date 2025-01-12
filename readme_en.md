# Shopify Product Import/Manager with Cloudflare Worker

[中文说明](https://github.com/suwubee/shopify-product-manager/blob/main/readme.md)
<br>
[English Readme](https://github.com/suwubee/shopify-product-manager/blob/main/readme_en.md)

A Cloudflare Worker designed to facilitate seamless management of Shopify products. This worker enables you to upload new products, update inventory and prices, query product details, and manage sales channels directly through Shopify's API. It includes a user-friendly web interface and a set of API endpoints for flexible integration.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Web Interface](#web-interface)
  - [API Endpoints](#api-endpoints)
- [Code Structure](#code-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Product Upload**: Easily upload new products to your Shopify store with detailed information, images, variants, and metafields.
- **Inventory Management**: Update the inventory quantities of existing product variants.
- **Price Management**: Modify the pricing and compare-at pricing for product variants.
- **Product Querying**: Retrieve detailed information about specific products and their variants.
- **Sales Channel Management**: Publish products to all available sales channels.
- **CORS Support**: Cross-Origin Resource Sharing enabled for seamless integration.
- **Password Protection**: Secure access to management interfaces with a predefined password.

## Prerequisites

Before you begin, ensure you have the following:

- **Shopify Store**: Access to a Shopify store with appropriate permissions.
- **Shopify API Access Token**: Generate a private app in your Shopify store to obtain an access token.
- **Cloudflare Account**: A Cloudflare account to deploy and manage Workers.
- **Basic Knowledge**: Familiarity with Shopify's API, Cloudflare Workers, and JavaScript.

## Obtaining Shopify Access Token

The access token for the Shopify API is obtained by creating a custom app and installing it into your Shopify store. Here are the detailed steps:

1. **Create a Custom App**:
   - Log in to your Shopify admin panel, navigate to **Apps** > **Develop apps** > **Create an app**.
   - Set the app name and link it to your developer account.

2. **Configure Permission Scopes**:
   - When creating the app, select the required permission scopes (Scopes) as needed. This project requires the following permissions:
     - **`write_products`**: Allows creating and modifying products.
     - **`read_products`**: Allows reading product information.
     - **`write_inventory`**: Allows managing inventory.
     - **`read_inventory`**: Allows reading inventory information.
     - **`write_locations`**: Allows managing store locations (write permissions may not be required).
     - **`read_locations`**: Allows reading store location data (to obtain inventory IDs).
     - **`write_metaobject_definitions`**: Allows writing custom attribute definitions for products.
     - **`read_metaobject_definitions`**: Allows reading custom attribute definitions for products.
     - **`read_metaobjects`**: Allows writing custom attributes for products.
     - **`write_metaobjects`**: Allows reading custom attributes for products.
     - **`write_publications`**: Allows directly publishing products (will publish to all sales channels).
     - **`read_publications`**: Allows reading publication status.
   - Support Webhook version 2024-10

3. **Install the App and Obtain the Access Token**:
   - After creating the app, install it into your Shopify store.
   - Once installed, you can view the access token (Access Token) on the app's API credentials page.

For more detailed steps, refer to the official Shopify documentation:
- [Shopify Admin API Authorization Guide](https://shopify.dev/docs/api/usage/access-scopes)
- [How to Create a Custom App](https://help.shopify.com/en/manual/apps/app-types/custom-apps)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/suwubee/shopify-product-manager.git
cd shopify-product-manager
```

### 2. Configure the Worker

Edit the `PWD` constant in the `index.js` file to set your desired password for accessing the web interface.

```javascript
const PWD = 'your-secure-password'
```

### 3. Deploy to Cloudflare Workers

#### Manual Deployment
**SUGGESTED**

Alternatively, you can manually upload the `index.js` file through the Cloudflare Workers dashboard.

#### Using Wrangler

1. **Install Wrangler**: Cloudflare's CLI tool for Workers.

    ```bash
    npm install -g wrangler
    ```

2. **Authenticate Wrangler**:

    ```bash
    wrangler login
    ```

3. **Configure `wrangler.toml`**:

    Create a `wrangler.toml` file in the project root with the following content:

    ```toml
    name = "shopify-product-manager"
    type = "javascript"
    
    account_id = "your-cloudflare-account-id"
    workers_dev = true
    compatibility_date = "2025-01-12"
    ```

4. **Publish the Worker**:

    ```bash
    wrangler publish
    ```


### 4. Configure DNS (Optional)

If you prefer to use a custom domain, set up the appropriate DNS records in your Cloudflare dashboard to point to the Worker.

## Configuration

### Password Protection

The worker uses a simple password mechanism to protect sensitive routes. The password is defined in the `PWD` constant:

```javascript
const PWD = 'your-secure-password'
```

Ensure you change this to a strong, unique password before deploying.

### CORS Headers

CORS is enabled with the following headers to allow cross-origin requests:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}
```

Modify these headers as needed to restrict access to specific origins.

## Usage

### Web Interface

The worker provides a simple web interface for managing products. Access it by navigating to the `/web` route of your Worker’s URL.

#### Accessing the Web Interface

1. Open your browser and navigate to:

    ```
    https://your-worker-domain/web?pwd=your-secure-password
    ```

2. **Main Page**: Provides navigation links to different management sections.

    - **Upload Product**: `/web/upload?pwd=your-secure-password`
    - **Update Inventory**: `/web/updateInventory?pwd=your-secure-password`
    - **Update Price**: `/web/updatePrice?pwd=your-secure-password`

#### Uploading a Product

1. Navigate to the Upload Product page.
2. Fill in the required fields, including product details, images, variants, and metafields.
3. Submit the form to upload the product to your Shopify store.
4. View the result below the form for success or error messages.

#### Updating Inventory

1. Navigate to the Update Inventory page.
2. Enter the necessary details: shop name, access token, variant ID, and new inventory quantity.
3. Submit the form to update the inventory.
4. View the result below the form for success or error messages.

#### Updating Price

1. Navigate to the Update Price page.
2. Enter the necessary details: shop name, access token, variant ID, new price, and optional compare-at price.
3. Submit the form to update the price.
4. View the result below the form for success or error messages.

### API Endpoints

The worker exposes several API endpoints for programmatic access.

#### 1. Upload Product

- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Query Parameters**:
  - `pwd`: Your predefined password
- **Request Body**:

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "product_data": {
        "title": "Product Title",
        "descriptionHtml": "Product Description",
        "vendor": "Vendor Name",
        "productType": "Product Type",
        "tags": ["tag1", "tag2"]
      },
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "variants": [
        {
          "price": "10.00",
          "compareAtPrice": "12.00",
          "sku": "SKU123",
          "inventoryQuantity": 100,
          "image_url": "https://example.com/variant1.jpg",
          "optionValues": [
            { "name": "Size", "value": "M" },
            { "name": "Color", "value": "Red" }
          ]
        }
      ],
      "metafields": [
        {
          "namespace": "custom",
          "key": "material",
          "type": "single_line_text_field",
          "value": "Cotton"
        }
      ]
    }
    ```

- **Response**:

    - **Success** (`200`):

        ```json
        {
          "id": "gid://shopify/Product/123456789"
        }
        ```

    - **Error** (`4xx` or `5xx`):

        ```json
        {
          "error": "Error message"
        }
        ```

#### 2. Update Inventory

- **Endpoint**: `/api/updateInventory`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Query Parameters**:
  - `pwd`: Your predefined password
- **Request Body**:

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
      "inventory_quantity": 50
    }
    ```

- **Response**:

    - **Success** (`200`):

        ```json
        {
          "inventoryAdjustmentGroup": { ... }
        }
        ```

    - **Error** (`4xx` or `5xx`):

        ```json
        {
          "error": "Error message"
        }
        ```

#### 3. Update Price

- **Endpoint**: `/api/updatePrice`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Query Parameters**:
  - `pwd`: Your predefined password
- **Request Body**:

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
      "price": "15.00",
      "compare_at_price": "20.00"
    }
    ```

- **Response**:

    - **Success** (`200`):

        ```json
        {
          "id": "gid://shopify/ProductVariant/987654321",
          "price": "15.00",
          "compareAtPrice": "20.00"
        }
        ```

    - **Error** (`4xx` or `5xx`):

        ```json
        {
          "error": "Error message"
        }
        ```

#### 4. Query Product Details

- **Endpoint**: `/api/queryProduct`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Query Parameters**:
  - `pwd`: Your predefined password
- **Request Body**:

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "product_id": "123456789"
    }
    ```

- **Response**:

    - **Success** (`200`):

        ```json
        {
          "product_id": "123456789",
          "title": "Product Title",
          "location_id": "74416062740",
          "variants": [
            {
              "variant_id": "987654321",
              "inventory_item_id": "111222333",
              "sku": "SKU-001",
              "price": "29.99",
              "compare_at_price": "39.99",
              "available_quantity": 100
            }
          ]
        }
        ```

    - **Error** (`4xx` or `5xx`):

        ```json
        {
          "error": "Error message"
        }
        ```

### Making API Requests

You can interact with the API endpoints using tools like `curl`, Postman, or integrate them into your applications.

**Example: Uploading a Product with `curl`**

```bash
curl -X POST "https://your-worker-domain/api/upload?pwd=your-secure-password" \
-H "Content-Type: application/json" \
-d '{
  "shop_name": "your-shop-name",
  "access_token": "your-access-token",
  "product_data": {
    "title": "Premium Cotton T-Shirt",
    "descriptionHtml": "<h2>Product Features:</h2><ul><li>100% Cotton</li><li>Available in multiple colors</li><li>Comfortable fit</li></ul>",
    "vendor": "Fashion Brand Co.",
    "productType": "Apparel",
    "tags": ["t-shirt", "cotton", "summer"]
  },
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "variants": [
    {
      "price": "299.99",
      "compareAtPrice": "399.99",
      "sku": "DRESS-RED-S",
      "inventoryQuantity": 100,
      "image_url": "https://example.com/dress-red.jpg",
      "optionValues": [
        { "name": "Color", "value": "Red" },
        { "name": "Size", "value": "S" }
      ]
    }
  ],
  "metafields": [
    {
      "namespace": "custom",
      "key": "material",
      "type": "single_line_text_field",
      "value": "100% Cotton"
    }
  ]
}'
```

## Code Structure

The project is organized as follows:

### 1. **Entry Point**

- **`addEventListener('fetch', ...)`**: Listens for incoming HTTP requests and routes them to the appropriate handler.

### 2. **Constants and Headers**

- **`PWD`**: Defines the password for accessing protected routes.
- **`corsHeaders`**: Configures CORS headers to allow cross-origin requests.

### 3. **Request Handler**

- **`handleRequest(request)`**: Main function that handles incoming requests, routing them based on the URL path and HTTP method.

### 4. **Web Routes**

- **`/web`**: Main navigation page.
- **`/web/upload`**: Product upload form.
- **`/web/updateInventory`**: Inventory update form.
- **`/web/updatePrice`**: Price update form.

Each web route returns an HTML page with forms for user interaction.

### 5. **API Routes**

- **`/api/upload`**: Handles product creation.
- **`/api/updateInventory`**: Handles inventory updates.
- **`/api/updatePrice`**: Handles price updates.
- **`/api/queryProduct`**: Handles querying product details.

Each API route processes JSON requests, interacts with Shopify's API, and returns JSON responses.

### 6. **Helper Functions**

- **Rendering Functions**:
  - `renderMainPage(pwd)`: Renders the main navigation page.
  - `renderUploadForm(pwd)`: Renders the product upload form.
  - `renderUpdateInventoryForm(pwd)`: Renders the inventory update form.
  - `renderUpdatePriceForm(pwd)`: Renders the price update form.

- **Shopify API Interaction**:
  - `createProduct(...)`: Creates a new product in Shopify.
  - `updateInventory(...)`: Updates the inventory quantity of a product variant.
  - `updatePrice(...)`: Updates the price of a product variant.
  - `queryProductDetails(...)`: Retrieves detailed information about a product.
  - `publishToAllChannels(...)`: Publishes a product to all sales channels.
  - `getSalesChannels(...)`: Retrieves available sales channels.
  - `publishProductToChannel(...)`: Publishes a product to a specific sales channel.
  - `getFirstLocationId(...)`: Retrieves the first location ID from Shopify.
  - `encodeGlobalId(...)` and `decodeGlobalId(...)`: Helper functions for encoding/decoding Shopify global IDs.

- **Utility Functions**:
  - `waitForMediaReady(...)`: Waits until all media (images) associated with a product are ready.
  - `associateImagesWithVariants(...)`: Associates images with specific product variants.

### 7. **Error Handling**

Each API interaction includes robust error handling to capture and respond to network issues, Shopify API errors, and data validation errors.

### 8. **Security**

- **Password Protection**: Routes that modify data are protected by a password passed as a query parameter.
- **CORS**: Configured to allow requests from any origin. Adjust `corsHeaders` as needed for enhanced security.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**

    Click the "Fork" button at the top right of this page.

2. **Clone Your Fork**

    ```bash
    git clone https://github.com/suwubee/shopify-product-manager.git
    cd shopify-product-manager
    ```

3. **Create a New Branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

4. **Make Your Changes**

    Implement your feature or fix.

5. **Commit Your Changes**

    ```bash
    git commit -m "Add your commit message"
    ```

6. **Push to Your Fork**

    ```bash
    git push origin feature/your-feature-name
    ```

7. **Create a Pull Request**

    Navigate to your fork on GitHub and click "Compare & pull request."

### Code Standards

- Follow consistent coding styles and best practices.
- Ensure all new features include appropriate tests.
- Write clear and concise commit messages.

## License

This project is licensed under the [MIT License](LICENSE).

---

*Developed with ❤️ by [suwubee](https://github.com/suwubee)*
