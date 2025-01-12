# Shopify 产品上传/管理 (基于Cloudflare Workers)

[中文说明](https://github.com/suwubee/shopify-product-manager/blob/main/readme.md)
[English Readme](https://github.com/suwubee/shopify-product-manager/blob/main/readme_en.md)

一个 Cloudflare 工作器，旨在简化 Shopify 产品的管理。该工作器允许您通过 Shopify API 上传新产品、更新库存和价格、查询产品详细信息以及管理销售渠道。它包含一个用户友好的 Web 界面和一组 API 端点，以实现灵活的集成。

## 目录

- [功能](#功能)
- [先决条件](#先决条件)
- [安装](#安装)
- [配置](#配置)
- [使用](#使用)
  - [Web 界面](#web-界面)
  - [API 端点](#api-端点)
- [代码结构](#代码结构)
- [贡献](#贡献)
- [许可](#许可)

## 功能

- **产品上传**：轻松上传新产品到您的 Shopify 商店，包含详细信息、图片、变体和自定义字段。
- **库存管理**：更新现有产品变体的库存数量。
- **价格管理**：修改产品变体的价格和比较价格。
- **产品查询**：检索特定产品的详细信息及其变体。
- **销售渠道管理**：将产品发布到所有可用的销售渠道。
- **CORS 支持**：启用跨域资源共享，实现无缝集成。
- **密码保护**：通过预定义密码保护管理界面，确保安全访问。

## 先决条件

在开始之前，请确保您具备以下条件：

- **Shopify 商店**：访问 Shopify 商店并获得相应的权限。
- **Shopify API 访问令牌**：在您的 Shopify 商店中创建一个私有应用以获取访问令牌。
- **Cloudflare 账户**：用于部署和管理 Workers 的 Cloudflare 账户。
- **基本知识**：了解 Shopify 的 API、Cloudflare Workers 和 JavaScript。

## 获取 Shopify Access Token

Shopify API 的访问令牌是通过创建自定义应用并安装到 Shopify 商店中获取的。以下是具体步骤：

1. **创建自定义应用**：
   - 登录 Shopify 后台，转到 **Apps** > **Develop apps** > **Create an app**。
   - 设置应用名称并关联您的开发账号。

2. **设置权限范围（Scopes）**：
   - 在创建应用时，根据需要选择权限范围（Scopes）。本项目需要以下权限：
     - **`write_products`**: 允许创建和修改商品。
     - **`read_products`**: 允许读取商品信息。
     - **`write_inventory`**: 允许管理库存。
     - **`read_inventory`**: 允许读取库存信息。
     - **`write_locations`**: 允许管理商店位置(可能不需要写入权限)。
     - **`read_locations`**: 允许读取商店位置数据(获取库存ID)。
     - **`write_metaobject_definitions`**: 允许写入商品自定义属性。
     - **`read_metaobject_definitions`**: 允许读取商品自定义属性。
     - **`read_metaobjects`**: 允许写入商品自定义属性。
     - **`write_metaobjects`**: 允许读取商品自定义属性。
     - **`write_publications`**: 允许直接发布商品(会发布所有channel)。
     - **`read_publications`**: 允许读取发布状态。
   - 当前支持Webhook version为2024-10
     
3. **安装应用并获取 Access Token**：
   - 创建应用后，将其安装到 Shopify 商店。
   - 安装成功后，可以在应用的 API 凭证页面查看访问令牌（Access Token）。

更多详细步骤请参考 Shopify 官方文档：
- [Shopify Admin API 授权指南](https://shopify.dev/docs/api/usage/access-scopes)
- [如何创建自定义应用](https://help.shopify.com/zh-CN/manual/apps/app-types/custom-apps)

## 安装

### 1. 克隆仓库

```bash
git clone https://github.com/suwubee/shopify-product-manager.git
cd shopify-product-manager
```

### 2. 配置工作器

编辑 `index.js` 文件中的 `PWD` 常量，设置访问 Web 界面的密码。

```javascript
const PWD = 'your-secure-password'
```

### 3. 部署到 Cloudflare Workers

#### 手动部署
**推荐**
或者，您可以通过 Cloudflare Workers 控制面板手动上传 `index.js` 文件。

#### 使用 Wrangler

1. **安装 Wrangler**：Cloudflare 的 CLI 工具，用于管理 Workers。

    ```bash
    npm install -g wrangler
    ```

2. **认证 Wrangler**：

    ```bash
    wrangler login
    ```

3. **配置 `wrangler.toml`**：

    在项目根目录创建 `wrangler.toml` 文件，内容如下：

    ```toml
    name = "shopify-product-manager"
    type = "javascript"
    
    account_id = "your-cloudflare-account-id"
    workers_dev = true
    compatibility_date = "2025-01-12"
    ```

4. **发布工作器**：

    ```bash
    wrangler publish
    ```

### 4. 配置 DNS（可选）

如果您希望使用自定义域名，请在 Cloudflare 控制面板中设置相应的 DNS 记录，指向您的工作器。

## 配置

### 密码保护

工作器使用简单的密码机制来保护敏感路由。密码定义在 `PWD` 常量中：

```javascript
const PWD = 'your-secure-password'
```

请在部署前将其更改为强密码。

### CORS 头

CORS 已启用，并带有以下头信息，以允许跨域请求：

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}
```

根据需要修改这些头信息，以限制访问特定来源。

## 使用

### Web 界面

工作器提供了一个简单的 Web 界面来管理产品。通过访问工作器 URL 的 `/web` 路由即可访问。

#### 访问 Web 界面

1. 在浏览器中导航到：

    ```
    https://your-worker-domain/web?pwd=your-secure-password
    ```

2. **主页面**：提供导航链接到不同的管理部分。

    - **上传产品**：`/web/upload?pwd=your-secure-password`
    - **更新库存**：`/web/updateInventory?pwd=your-secure-password`
    - **更新价格**：`/web/updatePrice?pwd=your-secure-password`

#### 上传产品

1. 导航到上传产品页面。
2. 填写所需字段，包括产品详细信息、图片、变体和自定义字段。
3. 提交表单以将产品上传到您的 Shopify 商店。
4. 在表单下方查看结果，查看成功或错误消息。

#### 更新库存

1. 导航到更新库存页面。
2. 输入必要信息：商店名称、访问令牌、变体 ID 和新的库存数量。
3. 提交表单以更新库存。
4. 在表单下方查看结果，查看成功或错误消息。

#### 更新价格

1. 导航到更新价格页面。
2. 输入必要信息：商店名称、访问令牌、变体 ID、新价格和可选的比较价格。
3. 提交表单以更新价格。
4. 在表单下方查看结果，查看成功或错误消息。

### API 端点

工作器提供了几个 API 端点，以实现程序化访问。

#### 1. 上传产品

- **端点**：`/api/upload`
- **方法**：`POST`
- **头信息**：
  - `Content-Type: application/json`
- **查询参数**：
  - `pwd`：您的预定义密码
- **请求体**：

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

- **响应**：

    - **成功** (`200`)：

        ```json
        {
          "id": "gid://shopify/Product/123456789"
        }
        ```

    - **错误** (`4xx` 或 `5xx`)：

        ```json
        {
          "error": "错误消息"
        }
        ```

#### 2. 更新库存

- **端点**：`/api/updateInventory`
- **方法**：`POST`
- **头信息**：
  - `Content-Type: application/json`
- **查询参数**：
  - `pwd`：您的预定义密码
- **请求体**：

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
      "inventory_quantity": 50
    }
    ```

- **响应**：

    - **成功** (`200`)：

        ```json
        {
          "inventoryAdjustmentGroup": { ... }
        }
        ```

    - **错误** (`4xx` 或 `5xx`)：

        ```json
        {
          "error": "错误消息"
        }
        ```

#### 3. 更新价格

- **端点**：`/api/updatePrice`
- **方法**：`POST`
- **头信息**：
  - `Content-Type: application/json`
- **查询参数**：
  - `pwd`：您的预定义密码
- **请求体**：

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
      "price": "15.00",
      "compare_at_price": "20.00"
    }
    ```

- **响应**：

    - **成功** (`200`)：

        ```json
        {
          "id": "gid://shopify/ProductVariant/987654321",
          "price": "15.00",
          "compareAtPrice": "20.00"
        }
        ```

    - **错误** (`4xx` 或 `5xx`)：

        ```json
        {
          "error": "错误消息"
        }
        ```

#### 4. 查询产品详情

- **端点**：`/api/queryProduct`
- **方法**：`POST`
- **头信息**：
  - `Content-Type: application/json`
- **查询参数**：
  - `pwd`：您的预定义密码
- **请求体**：

    ```json
    {
      "shop_name": "your-shop-name",
      "access_token": "your-access-token",
      "product_id": "123456789"
    }
    ```

- **响应**：

    - **成功** (`200`)：

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

    - **错误** (`4xx` 或 `5xx`)：

        ```json
        {
          "error": "错误消息"
        }
        ```

### 发送 API 请求

您可以使用 `curl`、Postman 或将它们集成到应用程序中来与 API 端点进行交互。

**示例：使用 `curl` 上传产品**

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

## 代码结构

项目结构如下：

### 1. **入口点**

- **`addEventListener('fetch', ...)`**：监听传入的 HTTP 请求，并将它们路由到相应的处理程序。

### 2. **常量和头信息**

- **`PWD`**：定义访问受保护路由的密码。
- **`corsHeaders`**：配置 CORS 头，以允许跨域请求。

### 3. **请求处理程序**

- **`handleRequest(request)`**：主函数，处理传入请求，根据 URL 路径和 HTTP 方法进行路由。

### 4. **Web 路由**

- **`/web`**：主导航页面。
- **`/web/upload`**：产品上传表单。
- **`/web/updateInventory`**：库存更新表单。
- **`/web/updatePrice`**：价格更新表单。

每个 Web 路由返回一个包含表单的 HTML 页面，供用户交互。

### 5. **API 路由**

- **`/api/upload`**：处理产品创建。
- **`/api/updateInventory`**：处理库存更新。
- **`/api/updatePrice`**：处理价格更新。
- **`/api/queryProduct`**：处理查询产品详情。

每个 API 路由处理 JSON 请求，与 Shopify 的 API 交互，并返回 JSON 响应。

### 6. **辅助函数**

- **渲染函数**：
  - `renderMainPage(pwd)`：渲染主导航页面。
  - `renderUploadForm(pwd)`：渲染产品上传表单。
  - `renderUpdateInventoryForm(pwd)`：渲染库存更新表单。
  - `renderUpdatePriceForm(pwd)`：渲染价格更新表单。

- **Shopify API 交互**：
  - `createProduct(...)`：在 Shopify 中创建新产品。
  - `updateInventory(...)`：更新产品变体的库存数量。
  - `updatePrice(...)`：更新产品变体的价格。
  - `queryProductDetails(...)`：检索产品详细信息。
  - `publishToAllChannels(...)`：将产品发布到所有销售渠道。
  - `getSalesChannels(...)`：检索可用的销售渠道。
  - `getFirstLocationId(...)`：从 Shopify 检索第一个位置 ID。
  - `encodeGlobalId(...)` 和 `decodeGlobalId(...)`：辅助函数，用于编码/解码 Shopify 全局 ID。

- **实用函数**：
  - `waitForMediaReady(...)`：等待与产品关联的所有媒体（图片）准备就绪。
  - `associateImagesWithVariants(...)`：将图片与特定产品变体关联。

### 7. **错误处理**

每个 API 交互都包含健壮的错误处理，以捕获和响应网络问题、Shopify API 错误和数据验证错误。

### 8. **安全**

- **密码保护**：修改数据的路由通过查询参数中的密码进行保护。
- **CORS**：配置为允许来自任何来源的请求。根据需要调整 `corsHeaders` 以增强安全性。

## 贡献

欢迎贡献！请遵循以下步骤进行贡献：

1. **分叉仓库**

    点击页面右上角的“分叉”按钮。

2. **克隆您的分叉**

    ```bash
    git clone https://github.com/suwubee/shopify-product-manager.git
    cd shopify-product-manager
    ```

3. **创建新分支**

    ```bash
    git checkout -b feature/your-feature-name
    ```

4. **进行更改**

    实现您的功能或修复。

5. **提交更改**

    ```bash
    git commit -m "添加您的提交信息"
    ```

6. **推送到您的分叉**

    ```bash
    git push origin feature/your-feature-name
    ```

7. **创建拉取请求**

    导航到您的分叉，点击“比较和拉取请求”。

### 代码标准

- 遵循一致的编码风格和最佳实践。
- 确保所有新功能包含适当的测试。
- 编写清晰简洁的提交信息。

## 许可

本项目根据 [MIT 许可证](LICENSE) 发布。

---

*由 [suwubee](https://github.com/suwubee) 开发 ❤️*
