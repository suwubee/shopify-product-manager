// Cloudflare Worker entry point
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 定义密码常量
const PWD = 'bilibilibing'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

async function handleRequest(request) {
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  // 提取 URL 中的 pwd 参数
  const pwd = url.searchParams.get('pwd')

  // 检查是否为需要密码保护的路径
  if (
    path === '/web' ||
    path.startsWith('/web/') ||
    path.startsWith('/api/')
  ) {
    if (pwd !== PWD) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  // 路由处理
  if (path === '/web') {
    if (method === 'GET') {
      // 返回主页面或导航页面
      return new Response(renderMainPage(PWD), {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/web/upload') {
    if (method === 'GET') {
      // 返回商品上传表单页面
      return new Response(renderUploadForm(PWD), {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/web/updateInventory') {
    if (method === 'GET') {
      // 返回更新库存的表单页面
      return new Response(renderUpdateInventoryForm(PWD), {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/web/updatePrice') {
    if (method === 'GET') {
      // 返回更新价格的表单页面
      return new Response(renderUpdatePriceForm(PWD), {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/api/upload') {
    if (method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await request.json()
        const {
          shop_name,
          access_token,
          product_data,
          images,
          variants,
          metafields
        } = data
        // 验证必要的字段
        if (!shop_name || !access_token || !product_data) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        // 调用创建商品的函数
        try {
          const result = await createProduct(
            shop_name,
            access_token,
            product_data,
            images,
            variants,
            metafields
          )
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Vary': 'Origin'
            }          })
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500,         
              headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Vary': 'Origin'
            }}
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid content type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/api/updateInventory') {
    if (method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await request.json()
        const { shop_name, access_token, variant_id, inventory_quantity } = data
        // 验证必要的字段
        if (!shop_name || !access_token || !variant_id || inventory_quantity === undefined) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        // 调用更新库存的函数
        try {
          const result = await updateInventory(
            shop_name,
            access_token,
            variant_id,
            inventory_quantity
          )
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid content type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/api/updatePrice') {
    if (method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await request.json()
        const { shop_name, access_token, variant_id, price, compare_at_price } = data
        // 验证必要的字段
        if (!shop_name || !access_token || !variant_id || !price) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        // 调用更新价格的函数
        try {
          const result = await updatePrice(
            shop_name,
            access_token,
            variant_id,
            price,
            compare_at_price
          )
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid content type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else if (path === '/api/queryProduct') {
    if (method === 'POST') {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await request.json()
        const { shop_name, access_token, product_id } = data
        // 验证必要的字段
        if (!shop_name || !access_token || !product_id) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        // 调用查询函数
        try {
          const result = await queryProductDetails(shop_name, access_token, product_id)
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (e) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid content type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    } else {
      return new Response('Method not allowed', { status: 405 })
    }
  } else {
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400 }
    )
  }
}

// 主页面（导航页面）
function renderMainPage(pwd) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Shopify Product Manager</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    a { display: block; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Shopify Product Manager</h1>
  <a href="/web/upload?pwd=${pwd}">Upload Product</a>
  <a href="/web/updateInventory?pwd=${pwd}">Update Inventory</a>
  <a href="/web/updatePrice?pwd=${pwd}">Update Price</a>
</body>
</html>
`
}

// 商品上传表单页面
function renderUploadForm(pwd) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Upload Product</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    label { display: block; margin-top: 10px; }
    input[type="text"], textarea { width: 300px; padding: 5px; }
    input[type="submit"] { margin-top: 15px; padding: 10px 20px; }
    #result { margin-top: 20px; }
    .example { color: #666; font-size: 0.9em; margin-top: 5px; }
  </style>
</head>
<body>
  <h1>Upload Product to Shopify</h1>
  <form id="upload-form">
    <label for="shop_name">Shop Name:</label>
    <input type="text" id="shop_name" name="shop_name" required>
    <div class="example">Example: my-store</div>

    <label for="access_token">Access Token:</label>
    <input type="text" id="access_token" name="access_token" required>
    <div class="example">Example: shpat_xxxx...</div>

    <label for="title">Product Title:</label>
    <input type="text" id="title" name="title" required>
    <div class="example">Example: Premium Cotton T-Shirt</div>

    <label for="description">Product Description:</label>
    <textarea id="description" name="description" rows="5" required></textarea>
    <div class="example">Example HTML: 
    &lt;h2&gt;Product Features:&lt;/h2&gt;
    &lt;ul&gt;
      &lt;li&gt;100% Cotton&lt;/li&gt;
      &lt;li&gt;Available in multiple colors&lt;/li&gt;
      &lt;li&gt;Comfortable fit&lt;/li&gt;
    &lt;/ul&gt;</div>

    <label for="vendor">Vendor:</label>
    <input type="text" id="vendor" name="vendor">
    <div class="example">Example: Fashion Brand Co.</div>

    <label for="product_type">Product Type:</label>
    <input type="text" id="product_type" name="product_type">
    <div class="example">Example: Apparel</div>

    <label for="tags">Tags (comma-separated):</label>
    <input type="text" id="tags" name="tags">
    <div class="example">Example: t-shirt, cotton, summer</div>

    <label for="images">Image URLs (one per line):</label>
    <textarea id="images" name="images" rows="5"></textarea>
    <div class="example">Example:
https://example.com/image1.jpg
https://example.com/image2.jpg</div>

    <h3>Variants (JSON format):</h3>
    <textarea id="variants" name="variants" rows="5"></textarea>
    <div class="example">Example:
[
  {
    "price": "299.99",
    "compareAtPrice": "399.99",
    "sku": "DRESS-RED-S",
    "inventoryQuantity": 100,
    "image_url": "https://example.com/dress-red.jpg",
    "optionValues": [
      {"name": "Color", "value": "Red"},
      {"name": "Size", "value": "S"}
    ]
  },
  {
    "price": "299.99",
    "compareAtPrice": "399.99",
    "sku": "DRESS-BLUE-S",
    "inventoryQuantity": 100,
    "image_url": "https://example.com/dress-blue.jpg",
    "optionValues": [
      {"name": "Color", "value": "Blue"},
      {"name": "Size", "value": "S"}
    ]
  }
]</div>

    <h3>Metafields (JSON format):</h3>
    <textarea id="metafields" name="metafields" rows="5"></textarea>
    <div class="example">Example:
[
  {
    "namespace": "custom",
    "key": "material",
    "type": "single_line_text_field",
    "value": "100% Cotton"
  }
]</div>

    <input type="submit" value="Upload Product">
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('upload-form').addEventListener('submit', async function(event) {
      event.preventDefault(); // Prevent the default form submission
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = ''; // Clear previous results

      // Collect form data
      const formData = new FormData(event.target);
      const data = {
        shop_name: formData.get('shop_name'),
        access_token: formData.get('access_token'),
        product_data: {
          title: formData.get('title'),
          descriptionHtml: formData.get('description'),
          vendor: formData.get('vendor') || '',
          productType: formData.get('product_type') || '',
          tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
        },
        images: formData.get('images') ? formData.get('images').split('\\n').map(url => url.trim()) : [],
        variants: formData.get('variants') ? JSON.parse(formData.get('variants')) : [],
        metafields: formData.get('metafields') ? JSON.parse(formData.get('metafields')) : []
      };

      try {
        const response = await fetch('/api/upload?pwd=${pwd}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          resultDiv.innerHTML = '<h2>Success:</h2><p>Product uploaded successfully. Product ID: ' + result.id + '</p>';
        } else {
          resultDiv.innerHTML = '<h2>Error:</h2><p>' + result.error + '</p>';
        }
      } catch (e) {
        resultDiv.innerHTML = '<h2>Error:</h2><p>' + e.message + '</p>';
      }
    });
  </script>
</body>
</html>
`
}

// 更新库存表单页面
function renderUpdateInventoryForm(pwd) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Update Inventory</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    label { display: block; margin-top: 10px; }
    input[type="text"] { width: 300px; padding: 5px; }
    input[type="submit"] { margin-top: 15px; padding: 10px 20px; }
    #result { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Update Inventory Quantity</h1>
  <form id="inventory-form">
    <label for="shop_name">Shop Name:</label>
    <input type="text" id="shop_name" name="shop_name" required>

    <label for="access_token">Access Token:</label>
    <input type="text" id="access_token" name="access_token" required>

    <label for="variant_id">Variant ID:</label>
    <input type="text" id="variant_id" name="variant_id" required>

    <label for="inventory_quantity">Inventory Quantity:</label>
    <input type="text" id="inventory_quantity" name="inventory_quantity" required>

    <input type="submit" value="Update Inventory">
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('inventory-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '';

      // Collect form data
      const formData = new FormData(event.target);
      const data = {
        shop_name: formData.get('shop_name'),
        access_token: formData.get('access_token'),
        variant_id: formData.get('variant_id'),
        inventory_quantity: parseInt(formData.get('inventory_quantity'))
      };

      try {
        const response = await fetch('/api/updateInventory?pwd=${pwd}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          resultDiv.innerHTML = '<h2>Success:</h2><p>Inventory updated successfully.</p>';
        } else {
          resultDiv.innerHTML = '<h2>Error:</h2><p>' + result.error + '</p>';
        }
      } catch (e) {
        resultDiv.innerHTML = '<h2>Error:</h2><p>' + e.message + '</p>';
      }
    });
  </script>
</body>
</html>
`
}

// 更新价格表单页面
function renderUpdatePriceForm(pwd) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Update Price</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    label { display: block; margin-top: 10px; }
    input[type="text"] { width: 300px; padding: 5px; }
    input[type="submit"] { margin-top: 15px; padding: 10px 20px; }
    #result { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Update Price</h1>
  <form id="price-form">
    <label for="shop_name">Shop Name:</label>
    <input type="text" id="shop_name" name="shop_name" required>

    <label for="access_token">Access Token:</label>
    <input type="text" id="access_token" name="access_token" required>

    <label for="variant_id">Variant ID:</label>
    <input type="text" id="variant_id" name="variant_id" required>

    <label for="price">Price:</label>
    <input type="text" id="price" name="price" required>

    <label for="compare_at_price">Compare At Price (optional):</label>
    <input type="text" id="compare_at_price" name="compare_at_price">

    <input type="submit" value="Update Price">
  </form>

  <div id="result"></div>

  <script>
    document.getElementById('price-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '';

      // Collect form data
      const formData = new FormData(event.target);
      const data = {
        shop_name: formData.get('shop_name'),
        access_token: formData.get('access_token'),
        variant_id: formData.get('variant_id'),
        price: formData.get('price'),
        compare_at_price: formData.get('compare_at_price') || null
      };

      try {
        const response = await fetch('/api/updatePrice?pwd=${pwd}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          resultDiv.innerHTML = '<h2>Success:</h2><p>Price updated successfully.</p>';
        } else {
          resultDiv.innerHTML = '<h2>Error:</h2><p>' + result.error + '</p>';
        }
      } catch (e) {
        resultDiv.innerHTML = '<h2>Error:</h2><p>' + e.message + '</p>';
      }
    });
  </script>
</body>
</html>
`
}

// 创建商品的函数
/**
 * 创建商品的 API 接口数据格式：
 * 
 * 请求路径：/api/upload
 * 请求方法：POST
 * 请求头部：
 *   Content-Type: application/json
 * 
 * 请求体示例（JSON）：
 * {
 *   "shop_name": "your-shop-name",
 *   "access_token": "your-access-token",
 *   "product_data": {
 *     "title": "Product Title",
 *     "descriptionHtml": "Product Description",
 *     "vendor": "Vendor Name",
 *     "productType": "Product Type",
 *     "tags": ["tag1", "tag2"]
 *   },
 *   "images": [
 *     "https://example.com/image1.jpg",
 *     "https://example.com/image2.jpg"
 *   ],
 *   "variants": [
 *     {
 *       "price": "10.00",
 *       "compareAtPrice": "12.00",
 *       "sku": "SKU123",
 *       "inventoryQuantity": 100,
 *       "image_url": "https://example.com/variant1.jpg",  // 可选，变体特定的图片
 *       "optionValues": [
 *         { "name": "Size", "value": "M" },
 *         { "name": "Color", "value": "Red" }
 *       ]
 *     },
 *     {
 *       "price": "10.00",
 *       "compareAtPrice": "12.00",
 *       "sku": "SKU124",
 *       "inventoryQuantity": 100,
 *       "image_url": "https://example.com/variant2.jpg",  // 可选，变体特定的图片
 *       "optionValues": [
 *         { "name": "Size", "value": "M" },
 *         { "name": "Color", "value": "Blue" }
 *       ]
 *     }
 *   ],
 *   "metafields": [
 *     {
 *       "namespace": "custom",
 *       "key": "material",
 *       "type": "single_line_text_field",
 *       "value": "Cotton"
 *     }
 *   ]
 * }
 * 
 * 注意事项：
 * 1. variants 中的 image_url 字段是可选的
 * 2. 如果提供了 image_url，该图片会自动与对应的变体关联
 * 3. 如果没有提供 image_url，该变体将使用商品的主图
 * 4. 变体图片会在用户选择对应选项时显示
 */
// 创建商品的函数
async function createProduct(shop_name, access_token, product_data, images, variants, metafields) {
  const shop_url = `${shop_name}.myshopify.com`
  const base_url = `https://${shop_url}/admin/api/2024-10/graphql.json`
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json'
  }

  // 1. 从变体中提取选项名称和值
  const optionMap = new Map()
  variants.forEach(variant => {
    variant.optionValues.forEach(opt => {
      if (!optionMap.has(opt.name)) {
        optionMap.set(opt.name, new Set())
      }
      optionMap.get(opt.name).add(opt.value)
    })
  })

  // 2. 准备商品选项
  const productOptions = Array.from(optionMap.entries()).map(([name, values]) => ({
    name: name,
    values: Array.from(values).map(value => ({ name: value }))
  }))

  // 3. 创建商品
  const mutation = `
    mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          handle
          tags
          options {
            id
            name
            values
          }
          media(first: 250) {
            edges {
              node {
                ... on MediaImage {
                  id
                  status
                  image {
                    url
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  // 准备商品输入
  const productInput = {
    title: product_data.title,
    descriptionHtml: product_data.descriptionHtml,
    vendor: product_data.vendor || '',
    productType: product_data.productType || 'Apparel',
    status: 'ACTIVE',
    tags: product_data.tags,
    productOptions: productOptions,
    handle: product_data.handle || product_data.title
  }

  // 优化图片处理逻辑
  const uniqueImages = [...new Set(images)];
  const variantImageUrls = [...new Set(variants.filter(v => v.image_url).map(v => v.image_url))];
  const allUniqueImages = [...new Set([...uniqueImages, ...variantImageUrls])];
  
  // 准备媒体输入
  const mediaInputs = allUniqueImages.map(url => ({
    mediaContentType: 'IMAGE',
    originalSource: url,
    alt: product_data.title || ''
  }));

  // 创建URL到mediaIndex的映射
  const urlToMediaIndexMap = new Map();
  allUniqueImages.forEach((url, index) => {
    urlToMediaIndexMap.set(url, index);
  });

  // 创建变体和图片的关联映射
  const variantImageAssociations = {};
  variants.forEach((variant, index) => {
    if (variant.image_url) {
      const mediaIndex = urlToMediaIndexMap.get(variant.image_url);
      if (mediaIndex !== undefined) {
        // 存储颜色和图片URL的映射
        const colorValue = variant.optionValues.find(opt => opt.name === 'Colors')?.value;
        if (colorValue) {
          variantImageAssociations[colorValue] = mediaIndex;
        }
      }
    }
  });

  // 添加 metafields
  if (metafields && metafields.length > 0) {
    productInput.metafields = metafields
  }

  const variables = {
    input: productInput,
    media: mediaInputs
  }

  console.log('Creating product with:', JSON.stringify(variables, null, 2))

  // 发送创建商品请求
  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: mutation, variables: variables })
  })

  const result = await response.json()
  
  if (result.errors) {
    console.error('Product creation errors:', result.errors)
    throw new Error(JSON.stringify(result.errors))
  }

  if (result.data.productCreate.userErrors.length > 0) {
    console.error('Product creation user errors:', result.data.productCreate.userErrors)
    throw new Error(JSON.stringify(result.data.productCreate.userErrors))
  }

  const productId = result.data.productCreate.product.id
  console.log(`Product created with ID: ${productId}`)

  // 获取创建的媒体 ID
  const mediaIds = [];
  if (result.data.productCreate.product.media && result.data.productCreate.product.media.edges) {
    const mediaEdges = result.data.productCreate.product.media.edges;
    mediaEdges.forEach((edge) => {
      if (edge.node && edge.node.id) {
        mediaIds.push(edge.node.id);
      }
    });

    // 4. 如果有变体，先创建变体
    let createdVariants = [];
    if (variants && variants.length > 0) {
      try {
        // 获取位置 ID
        const locationId = await getFirstLocationId(base_url, headers);
        
        // 创建变体并获取变体ID
        const variantResult = await createVariants(base_url, headers, productId, locationId, variants);
        console.log('Variant creation result:', variantResult);
        
        // 等待一小段时间确保变体创建完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 现在获取所有变体（包括新创建的）
        const query = `
          query getProductVariants($id: ID!) {
            product(id: $id) {
              variants(first: 250) {
                edges {
                  node {
                    id
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch(base_url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            query: query,
            variables: { id: productId }
          })
        });

        const variantsResult = await response.json();
        console.log('All variants after creation:', JSON.stringify(variantsResult, null, 2));
        
        if (variantsResult.data && variantsResult.data.product) {
          createdVariants = variantsResult.data.product.variants.edges;
        }
      } catch (e) {
        console.error(`Error creating variants: ${e.message}`);
        throw e;
      }
    }

    // 现在处理媒体关联
    if (mediaIds.length > 0) {
      await waitForMediaReady(base_url, headers, productId, mediaIds);

      // 创建颜色到mediaId的映射
      const colorToMediaIdMap = new Map();
      
      // 首先建立图片URL到mediaId的映射
      const imageUrlToMediaIdMap = new Map();
      allUniqueImages.forEach((url, index) => {
        if (index < mediaIds.length) {
          imageUrlToMediaIdMap.set(url, mediaIds[index]);
        }
      });

      // 为每个颜色找到对应的mediaId
      variants.forEach(variant => {
        const colorOption = variant.optionValues.find(opt => opt.name === 'Colors');
        if (colorOption && variant.image_url) {
          const mediaId = imageUrlToMediaIdMap.get(variant.image_url);
          if (mediaId) {
            colorToMediaIdMap.set(colorOption.value, mediaId);
          }
        }
      });

      console.log('Color to MediaId mapping:', Object.fromEntries(colorToMediaIdMap));

      // 构建变体ID和媒体ID的映射
      const finalAssociations = {};
      
      createdVariants.forEach(edge => {
        const variant = edge.node;
        const colorOption = variant.selectedOptions.find(opt => opt.name === 'Colors');
        if (colorOption) {
          const mediaId = colorToMediaIdMap.get(colorOption.value);
          if (mediaId) {
            finalAssociations[variant.id] = mediaId;
          }
        }
      });

      console.log('Final variant associations:', finalAssociations);

      // 批量关联图片到变体
      if (Object.keys(finalAssociations).length > 0) {
        try {
          const result = await associateImagesWithVariants(base_url, headers, productId, finalAssociations);
          console.log('Association result:', result);
        } catch (error) {
          console.error('Error associating images:', error);
          throw error;
        }
      }
    }

    // 5. 发布到所有销售渠道
    try {
      await publishToAllChannels(base_url, headers, productId);
      console.log('Product published to all channels');
    } catch (e) {
      console.error(`Error publishing to channels: ${e.message}`);
      throw e;
    }

    return { id: productId };
  }
}

// 创建变体的函数
async function createVariants(base_url, headers, productId, locationId, variants) {
  // 1. 首先获取现有变体
  const query = `
    query getProductVariants($id: ID!) {
      product(id: $id) {
        variants(first: 100) {
          edges {
            node {
              id
              inventoryItem {
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `

  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: { 'id': productId }
    })
  })

  const result = await response.json()

  // 2. 检查现有变体并建立映射
  const existingVariants = {}
  const existingInventoryItems = {}
  if (result.data && result.data.product) {
    for (const variantEdge of result.data.product.variants.edges) {
      const variantNode = variantEdge.node
      const optionCombo = variantNode.selectedOptions.map(opt => [opt.name, opt.value])
      const variantId = variantNode.id
      const inventoryItemId = variantNode.inventoryItem.id
      existingVariants[JSON.stringify(optionCombo)] = variantId
      existingInventoryItems[variantId] = inventoryItemId
      console.log(`Found existing variant: ${optionCombo}`)
      console.log(`Variant ID: ${variantId}`)
      console.log(`Inventory Item ID: ${inventoryItemId}`)
    }
  }

  // 3. 分离需要更新和需要创建的变体
  const variantsToCreate = []
  const updatePromises = []

  for (const variant of variants) {
    const optionCombo = variant.optionValues.map(opt => [opt.name, opt.value])
    const optionKey = JSON.stringify(optionCombo)

    if (existingVariants[optionKey]) {
      // 更新现有变体
      const variantId = existingVariants[optionKey]
      const inventoryItemId = existingInventoryItems[variantId]
      updatePromises.push(
        updateExistingVariant(
          base_url,
          headers,
          productId,
          variantId,
          inventoryItemId,
          variant.price,
          variant.compareAtPrice,
          variant.inventoryQuantity,
          variant.sku,
          locationId
        )
      )
    } else {
      // 准备创建新变体
      variantsToCreate.push({
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        barcode: variant.sku,
        inventoryItem: {
          tracked: true,
          cost: variant.price,
          requiresShipping: true,
          sku: variant.sku
        },
        inventoryPolicy: 'CONTINUE',
        inventoryQuantities: [{
          availableQuantity: variant.inventoryQuantity,
          locationId: locationId
        }],
        taxable: true,
        optionValues: variant.optionValues.map(opt => ({
          name: opt.value,
          optionName: opt.name
        }))
      })
    }
  }

  // 4. 处理更新
  if (updatePromises.length > 0) {
    await Promise.all(updatePromises)
    console.log(`Updated ${updatePromises.length} existing variants`)
  }

  // 5. 处理创建
  if (variantsToCreate.length > 0) {
    const mutation = `
      mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            price
            sku
            inventoryQuantity
            selectedOptions {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const createResponse = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: mutation,
        variables: {
          productId: productId,
          variants: variantsToCreate
        }
      })
    })

    const createResult = await createResponse.json()
    if (createResult.errors) {
      console.error('Error creating new variants:', createResult.errors)
      throw new Error(JSON.stringify(createResult.errors))
    }

    console.log(`Successfully created ${variantsToCreate.length} new variants`)
    return createResult
  }

  return { message: 'All variants processed' }
}

// 更新现有变体的辅助函数
async function updateExistingVariant(base_url, headers, productId, variantId, inventoryItemId, price, compareAtPrice, inventoryQuantity, sku, locationId) {
  // 1. 启用库存跟踪
  const trackMutation = `
    mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          tracked
        }
        userErrors {
          message
        }
      }
    }
  `
  await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: trackMutation,
      variables: {
        id: inventoryItemId,
        input: { tracked: true }
      }
    })
  })

  // 2. 更新价格和 SKU
  const priceMutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          compareAtPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `
  await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: priceMutation,
      variables: {
        productId: productId,
        variants: [{
          id: variantId,
          price: price,
          compareAtPrice: compareAtPrice,
          inventoryItem: {
            tracked: true,
            sku: sku
          }
        }]
      }
    })
  })

  // 3. 更新库存
  const inventoryMutation = `
    mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        inventoryAdjustmentGroup {
          reason
          changes {
            name
            delta
            quantityAfterChange
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `
  await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: inventoryMutation,
      variables: {
        input: {
          name: 'available',
          reason: 'correction',
          ignoreCompareQuantity: true,
          quantities: [{
            inventoryItemId: inventoryItemId,
            locationId: locationId,
            quantity: inventoryQuantity
          }]
        }
      }
    })
  })
}

// 发布商品到所有销售渠道的函数
async function publishToAllChannels(base_url, headers, productId) {
  const channels = await getSalesChannels(base_url, headers)
  console.log(`Found ${channels.length} sales channels.`)

  for (const channel of channels) {
    console.log(`Publishing to channel: ${channel.name} (ID: ${channel.id})`)
    try {
      await publishProductToChannel(base_url, headers, productId, channel.id)
      console.log(`Published to channel: ${channel.name}`)
    } catch (e) {
      console.error(`Error publishing to channel ${channel.name}: ${e.message}`)
      // 根据需求，您可以选择继续发布其他渠道，或中断流程
      // 这里选择继续
    }
  }
}

// 获取所有销售渠道的函数
async function getSalesChannels(base_url, headers) {
  const query = `
    {
      publications(first: 100) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `

  let response
  try {
    response = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query: query })
    })
  } catch (e) {
    console.error(`Network error during fetching sales channels: ${e.message}`)
    throw e
  }

  let result
  try {
    result = await response.json()
    console.log('Sales channels response:', JSON.stringify(result, null, 2)) // 调试日志
  } catch (e) {
    console.error(`Error parsing sales channels response: ${e.message}`)
    throw e
  }

  if (result.errors) {
    console.error('GraphQL errors during fetching sales channels:', JSON.stringify(result.errors))
    throw new Error(JSON.stringify(result.errors))
  }

  const channels = result.data.publications.edges.map(edge => ({
    id: edge.node.id,
    name: edge.node.name
  }))
  return channels
}

// 将商品发布到指定渠道的函数
async function publishProductToChannel(base_url, headers, productId, publicationId) {
  const mutation = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors {
          field
          message
        }
      }
    }
  `

  const variables = {
    id: productId,
    input: [{ publicationId: publicationId }]
  }

  console.log(`Publishing Product ID: ${productId} to Publication ID: ${publicationId}`) // 调试日志

  let response
  try {
    response = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query: mutation, variables: variables })
    })
  } catch (e) {
    console.error(`Network error during publishing to channel: ${e.message}`)
    throw e
  }

  let result
  try {
    result = await response.json()
    console.log('Publish to channel response:', JSON.stringify(result, null, 2)) // 调试日志
  } catch (e) {
    console.error(`Error parsing publish to channel response: ${e.message}`)
    throw e
  }

  if (result.errors) {
    console.error('GraphQL errors during publishing:', JSON.stringify(result.errors))
    throw new Error(JSON.stringify(result.errors))
  }
  if (result.data.publishablePublish.userErrors.length > 0) {
    console.error('User errors during publishing:', JSON.stringify(result.data.publishablePublish.userErrors))
    throw new Error(JSON.stringify(result.data.publishablePublish.userErrors))
  }

  console.log(`Product published to Publication ID: ${publicationId} successfully.`)
}

// 获取商店的第一个位置 ID
async function getFirstLocationId(base_url, headers) {
  const query = `
    {
      locations(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `
  let response
  try {
    response = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query: query })
    })
  } catch (e) {
    console.error(`Network error during fetching location ID: ${e.message}`)
    throw e
  }

  let result
  try {
    result = await response.json()
    console.log('Location ID response:', JSON.stringify(result, null, 2)) // 调试日志
  } catch (e) {
    console.error(`Error parsing location ID response: ${e.message}`)
    throw e
  }

  if (result.errors) {
    console.error('GraphQL errors during fetching location ID:', JSON.stringify(result.errors))
    throw new Error(JSON.stringify(result.errors))
  }

  try {
    const locationId = result.data.locations.edges[0].node.id
    return locationId
  } catch (e) {
    console.error(`Error extracting location ID: ${e.message}`)
    throw new Error('Failed to get location ID')
  }
}


// 更新库存的函数
/**
 * 更新库存的 API 接口数据格式：
 * 
 * 请求路径：/api/updateInventory
 * 请求方法：POST
 * 请求头部：
 *   Content-Type: application/json
 * 
 * 请求体示例（JSON）：
 * {
 *   "shop_name": "your-shop-name",
 *   "access_token": "your-access-token",
 *   "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
 *   "inventory_quantity": 50
 * }
 */
async function updateInventory(shop_name, access_token, variant_id, inventory_quantity) {
  const shop_url = `${shop_name}.myshopify.com`;
  const base_url = `https://${shop_url}/admin/api/2024-10/graphql.json`;
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json'
  };

  // 将 variant_id 转换为全局 ID
  const globalVariantId = encodeGlobalId('ProductVariant', variant_id);

  // 获取 inventoryItemId
  const inventoryItemId = await getInventoryItemId(base_url, headers, variant_id);

  // 获取 locationId
  const locationId = await getFirstLocationId(base_url, headers);

  // 启用库存跟踪
  //await enableInventoryTracking(base_url, headers, inventoryItemId);

  // 构建 GraphQL 请求
  const mutation = `
    mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
      inventorySetQuantities(input: $input) {
        inventoryAdjustmentGroup {
          changes {
            delta
            quantityAfterChange
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      name: "available",
      reason: "correction",
      ignoreCompareQuantity: true,
      quantities: [
        {
          inventoryItemId: inventoryItemId,
          locationId: locationId,
          quantity: inventory_quantity
        }
      ]
    }
  };

  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: mutation, variables: variables })
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }
  if (result.data.inventorySetQuantities.userErrors.length > 0) {
    throw new Error(JSON.stringify(result.data.inventorySetQuantities.userErrors));
  }
  return result.data.inventorySetQuantities.inventoryAdjustmentGroup;
}



// 启用库存跟踪
async function enableInventoryTracking(base_url, headers, inventoryItemId) {
  const mutation = `
    mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
      inventoryItemUpdate(id: $id, input: $input) {
        inventoryItem {
          id
          tracked
        }
        userErrors {
          message
        }
      }
    }
  `
  const variables = {
    id: inventoryItemId,
    input: { tracked: true }
  }
  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: mutation, variables: variables })
  })
  const result = await response.json()
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors))
  }
  if (result.data.inventoryItemUpdate.userErrors.length > 0) {
    throw new Error(JSON.stringify(result.data.inventoryItemUpdate.userErrors))
  }
}


// 更新价格的函数
/**
 * 更新价格的 API 接口数据格式：
 * 
 * 请求路径：/api/updatePrice
 * 请求方法：POST
 * 请求头部：
 *   Content-Type: application/json
 * 
 * 请求体示例（JSON）：
 * {
 *   "shop_name": "your-shop-name",
 *   "access_token": "your-access-token",
 *   "variant_id": "gid://shopify/ProductVariant/VARIANT_ID",
 *   "price": "15.00",
 *   "compare_at_price": "20.00"
 * }
 */
async function updatePrice(shop_name, access_token, variant_id, price, compare_at_price) {
  const shop_url = `${shop_name}.myshopify.com`;
  const base_url = `https://${shop_url}/admin/api/2024-10/graphql.json`;
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json'
  };

  // 将 variant_id 转换为全局 ID
  const globalVariantId = encodeGlobalId('ProductVariant', variant_id);

  // 获取 productId
  const productId = await getProductIdByVariantId(base_url, headers, variant_id);

  const mutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          compareAtPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: productId,
    variants: [
      {
        id: globalVariantId,
        price: price,
        compareAtPrice: compare_at_price || null
      }
    ]
  };

  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: mutation, variables: variables })
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }
  if (result.data.productVariantsBulkUpdate.userErrors.length > 0) {
    throw new Error(JSON.stringify(result.data.productVariantsBulkUpdate.userErrors));
  }
  return result.data.productVariantsBulkUpdate.productVariants[0];
}


// 根据 variant_id 获取 productId
async function getProductIdByVariantId(base_url, headers, variant_id) {
  const globalVariantId = encodeGlobalId('ProductVariant', variant_id);
  const query = `
    query {
      productVariant(id: "${globalVariantId}") {
        product {
          id
        }
      }
    }
  `
  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: query })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }

  try {
    const productId = result.data.productVariant.product.id;
    return productId;
  } catch (e) {
    throw new Error('Failed to retrieve Product ID from Variant ID');
  }
}


// 获取 inventoryItemId
async function getInventoryItemId(base_url, headers, variant_id) {
  const globalVariantId = encodeGlobalId('ProductVariant', variant_id);
  const query = `
    query {
      productVariant(id: "${globalVariantId}") {
        inventoryItem {
          id
        }
      }
    }
  `
  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: query })
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }

  try {
    const inventoryItemId = result.data.productVariant.inventoryItem.id;
    return inventoryItemId;
  } catch (e) {
    throw new Error('Failed to retrieve Inventory Item ID from Variant ID');
  }
}



// Helper function to encode a numeric ID to Shopify Global ID
function encodeGlobalId(type, id) {
  const str = `gid://shopify/${type}/${id}`;
  return btoa(str);
}

// Helper function to decode a Shopify Global ID to numeric ID (如果需要解码)
function decodeGlobalId(globalId) {
  const decoded = atob(globalId);
  const parts = decoded.split('/');
  return parts[parts.length - 1];
}

// 查询商品详情的函数
/**
 * 查询商品详情的 API 接口数据格式：
 * 
 * 请求路径：/api/queryProduct
 * 请求方法：POST
 * 请求头部：
 *   Content-Type: application/json
 * 
 * 请求体示例（JSON）：
 * {
 *   "shop_name": "your-shop-name",
 *   "access_token": "your-access-token",
 *   "product_id": "123456789"
 * }
 * 
 * 返回数据示例（JSON）：
 * {
 *   "product_id": "123456789",
 *   "title": "Product Title",
 *   "location_id": "74416062740",
 *   "variants": [
 *     {
 *       "variant_id": "987654321",
 *       "inventory_item_id": "111222333",
 *       "sku": "SKU-001",
 *       "price": "29.99",
 *       "compare_at_price": "39.99",
 *       "available_quantity": 100
 *     }
 *   ]
 * }
 */

// 添加查询函数
async function queryProductDetails(shop_name, access_token, product_id) {
  const shop_url = `${shop_name}.myshopify.com`
  const base_url = `https://${shop_url}/admin/api/2024-10/graphql.json`
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json'
  }

  // 首先获取 locationId
  const locationId = await getFirstLocationId(base_url, headers)
  const locationIdNumber = locationId.split('/').pop()

  const globalProductId = `gid://shopify/Product/${product_id}`

  const query = `
    query getProductDetails($id: ID!) {
      product(id: $id) {
        id
        title
        variants(first: 100) {
          edges {
            node {
              id
              sku
              price
              compareAtPrice
              inventoryItem {
                id
                inventoryLevels(first: 1) {
                  edges {
                    node {
                      quantities(names: ["available"]) {
                        name
                        quantity
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: { id: globalProductId }
    })
  })

  const result = await response.json()
  
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors))
  }

  // 格式化返回数据，从 gid://shopify/Type/ID 格式中提取数字 ID
  const formattedData = {
    product_id: product_id,
    title: result.data.product.title,
    location_id: locationIdNumber,
    variants: result.data.product.variants.edges.map(edge => {
      const variant = edge.node
      const inventoryLevels = variant.inventoryItem.inventoryLevels.edges[0]
      const availableQuantity = inventoryLevels ? 
        inventoryLevels.node.quantities.find(q => q.name === "available")?.quantity || 0 : 0

      return {
        variant_id: variant.id.split('/').pop(),
        inventory_item_id: variant.inventoryItem.id.split('/').pop(),
        sku: variant.sku,
        price: variant.price,
        compare_at_price: variant.compareAtPrice,
        available_quantity: availableQuantity
      }
    })
  }

  return formattedData
}

// 等待媒体就绪的函数
async function waitForMediaReady(base_url, headers, productId, mediaIds, maxRetries = 15, pollInterval = 2000) {
  let retries = 0;
  while (retries < maxRetries) {
    let allReady = true;
    const query = `
      query getProductMedia($productId: ID!) {
        product(id: $productId) {
          media(first: 250) {
            edges {
              node {
                ... on MediaImage {
                  id
                  status
                }
              }
            }
          }
        }
      }
    `;
    const variables = { 'productId': productId };
    const response = await fetch(base_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query: query, variables: variables })
    });
    const result = await response.json();
    if (result.errors) {
      console.log('Error fetching media statuses:', result.errors);
      break;
    }

    const mediaEdges = result.data.product.media.edges || [];
    const mediaStatusDict = {};
    for (const edge of mediaEdges) {
      const node = edge.node || {};
      const mediaId = node.id;
      const status = node.status;
      mediaStatusDict[mediaId] = status;
    }

    // 检查所有媒体状态
    for (const mediaId of mediaIds) {
      const status = mediaStatusDict[mediaId] || null;
      if (status !== 'READY') {
        allReady = false;
        break;
      }
    }

    if (allReady) {
      console.log('All media are READY.');
      return;
    } else {
      console.log(`Media not ready yet, retrying... (${retries + 1}/${maxRetries})`);
      retries += 1;
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  console.log('Some media are not READY after waiting.');
}

// 更新关联图片到变体的函数
async function associateImagesWithVariants(base_url, headers, productId, variantImageAssociations) {
  const mutation = `
    mutation productVariantAppendMedia($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
      productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
        product {
          id
        }
        productVariants {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // 一次性处理所有变体的关联
  const variantMediaInputs = Object.entries(variantImageAssociations).map(([variantId, mediaId]) => ({
    variantId: variantId,
    mediaIds: [mediaId]
  }));

  const variables = {
    productId: productId,
    variantMedia: variantMediaInputs
  };

  console.log('Sending variant media association request:', JSON.stringify(variables, null, 2));

  const response = await fetch(base_url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query: mutation, variables: variables })
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    throw new Error(JSON.stringify(result.errors));
  }

  if (result.data.productVariantAppendMedia.userErrors.length > 0) {
    console.error('User errors:', result.data.productVariantAppendMedia.userErrors);
    throw new Error(JSON.stringify(result.data.productVariantAppendMedia.userErrors));
  }

  console.log('Successfully associated all images with variants');
  return result.data.productVariantAppendMedia;
}