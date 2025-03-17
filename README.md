# 🚀 Advanced API Management Class for MongoDB

A comprehensive and secure solution for building efficient APIs with MongoDB in Node.js  
✅ Supports all advanced CRUD needs  
✅ Multi-layered security against common attacks  
✅ Easy to develop and customize  

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB 5+
- Mongoose 7+

### Install Dependencies
```bash
npm install mongoose lodash dotenv
```

## 🛠️ Quick Start

### Basic Implementation in Controller
```javascript
import { AdvancedApiFeatures } from './api-features.js';
import Product from './models/product.js';

export const getProducts = async (req, res) => {
  try {
    const features = new AdvancedApiFeatures(
      Product, 
      req.query,
      req.user?.role // Optional
    );
    
    const result = await features
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate()
      .execute();

    res.json({
      success: true,
      count: result.count,
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

## 🔍 Query Parameters Guide

### 1. Advanced Filtering
```http
GET /api/products?price[gte]=100&category[in]=electronics,phones&rating[gt]=4
```
| Operator | Example | Description |
|----------|------|---------|
| eq | ?age=25 | Equal to |
| ne | ?status[ne]=inactive | Not equal to |
| gt | ?price[gt]=100 | Greater than |
| gte | ?stock[gte]=50 | Greater than or equal to |
| lt | ?weight[lt]=500 | Less than |
| lte | ?rating[lte]=3 | Less than or equal to |
| in | ?colors[in]=red,blue | Exists in the list |
| nin | ?size[nin]=xl | Not in the list |
| regex | ?name[regex]=^A | Search using Regex |
| exists | ?discount[exists]=true | Field existence |

### 2. Multi-Level Sorting
```http
GET /api/products?sort=-price,createdAt
```

### 3. Field Selection
```http
GET /api/products?fields=name,price,specs
```

### 4. Smart Pagination
```http
GET /api/products?page=2&limit=20
```

### 5. Relationship Management
```http
GET /api/products?populate=category,brand
```

## 🔒 Advanced Security System

### 1. Protection Against NoSQL Injection
- Auto-sanitization of all inputs
- Blocking dangerous operators ($where, $function)
- ObjectId validation

### 2. Role-Based Access Control (RBAC)
```javascript
// security-config.js
export const securityConfig = {
  accessLevels: {
    guest: { maxLimit: 50 },
    user: { 
      maxLimit: 100,
      allowedPopulate: ['category']
    },
    admin: { maxLimit: 1000 }
  }
};
```

### 3. Input Validation
- Automatic data type conversion
- Numeric value limitations
- Regex structure checks

### 4. Layered Security
- Restriction of sensitive fields (passwords, tokens)
- Encrypted error messages

## 💡 Advanced Usage

### 1. Complex Filters
```javascript
features.addManualFilter({
  $or: [
    { price: { $lt: 100 } },
    { 'specs.weight': { $gt: 500 } }
  ]
});
```

### 2. Custom Aggregation Stages
```javascript
features.pipeline.push({
  $addFields: {
    priceWithTax: { 
      $multiply: ["$price", 1.09] 
    }
  }
});
```

### 3. Full-Text Search
```javascript
features.addManualFilter({
  $text: { 
    $search: "wireless headphones",
    $language: "en",
    $caseSensitive: false 
  }
});
```

### 4. Statistical Aggregation
```javascript
features.pipeline.push({
  $group: {
    _id: "$category",
    totalProducts: { $sum: 1 },
    avgPrice: { $avg: "$price" }
  }
});
```

## 🏆 Best Development Practices

### 1. Smart Indexing
```javascript
productSchema.index({ 
  name: 'text',
  price: 1, 
  createdAt: -1 
});
```

### 2. Caching System
```javascript
const redisClient = require('./redis');
const cacheKey = `products_${JSON.stringify(req.query)}`;

const cached = await redisClient.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));

await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
```

### 3. Performance Monitoring
```javascript
const explain = await Model.aggregate(pipeline)
  .explain("executionStats");

console.log('Execution Stats:', explain.executionStats);
```

### 4. Load Testing with Artillery
```yaml
# load-test.yml
config:
  target: "https://api.example.com"
  phases:
    - duration: 60
      arrivalRate: 100
scenarios:
  - flow:
      - get:
          url: "/products?limit=100"
```

### 5. Error Handling
```javascript
.catch(error => {
  console.error('API Error:', error);
  Sentry.captureException(error);
  NewRelic.noticeError(error);
});
```

## 📄 Full Example
```http
GET /api/products?
  page=1&
  limit=10&
  sort=-createdAt,price&
  fields=name,price,category&
  populate=category,brand&
  price[gte]=1000&
  category[in]=electronics,phones&
  name[regex]=^Samsung
```

---

# 🚀 کلاس پیشرفته مدیریت API برای MongoDB

npmیک راهکار جامع و امن برای ساخت APIهای کارا با MongoDB در Node.js  
✅ پشتیبانی از تمامی نیازهای CRUD پیشرفته  
✅ امنیت چندلایه در برابر حملات رایج  
✅ امکان توسعه و شخصی‌سازی آسان  

## 📦 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 16+
- MongoDB 5+
- Mongoose 7+

### نصب کتابخانه
```bash
npm install mongoose lodash dotenv
```

## 🛠️ شروع سریع

### پیاده‌سازی پایه در کنترلر
```javascript
import { AdvancedApiFeatures } from './api-features.js';
import Product from './models/product.js';

export const getProducts = async (req, res) => {
  try {
    const features = new AdvancedApiFeatures(
      Product, 
      req.query,
      req.user?.role // اختیاری
    );
    
    const result = await features
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .populate()
      .execute();

    res.json({
      success: true,
      count: result.count,
      data: result.data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

## 🔍 راهنمای کامل پارامترهای کوئری

### 1. فیلترینگ پیشرفته
```http
GET /api/products?price[gte]=100&category[in]=electronics,phones&rating[gt]=4
```
| اپراتور | مثال | توضیحات |
|----------|------|---------|
| eq | ?age=25 | برابر با |
| ne | ?status[ne]=inactive | نابرابر با |
| gt | ?price[gt]=100 | بزرگتر از |
| gte | ?stock[gte]=50 | بزرگتر یا مساوی |
| lt | ?weight[lt]=500 | کوچکتر از |
| lte | ?rating[lte]=3 | کوچکتر یا مساوی |
| in | ?colors[in]=red,blue | موجود در لیست |
| nin | ?size[nin]=xl | عدم موجودیت در لیست |
| regex | ?name[regex]=^A | جستجو با Regex |
| exists | ?discount[exists]=true | وجود فیلد |

### 2. مرتب‌سازی چند سطحی
```http
GET /api/products?sort=-price,createdAt
```

### 3. انتخاب فیلدها
```http
GET /api/products?fields=name,price,specs
```

### 4. صفحه‌بندی هوشمند
```http
GET /api/products?page=2&limit=20
```

### 5. مدیریت روابط
```http
GET /api/products?populate=category,brand
```

## 🔒 سیستم امنیتی پیشرفته

### 1. محافظت در برابر NoSQL Injection
- ضدعفونی خودکار تمام ورودی‌ها
- مسدودسازی اپراتورهای خطرناک ($where, $function)
- اعتبارسنجی ObjectIdها

### 2. کنترل دسترسی مبتنی بر نقش (RBAC)
```javascript
// security-config.js
export const securityConfig = {
  accessLevels: {
    guest: { maxLimit: 50 },
    user: { 
      maxLimit: 100,
      allowedPopulate: ['category']
    },
    admin: { maxLimit: 1000 }
  }
};
```

### 3. اعتبارسنجی ورودی‌ها
- تبدیل خودکار انواع داده
- محدودیت مقادیر عددی
- بررسی ساختار Regex

### 4. امنیت لایه‌ای
- محدودیت فیلدهای حساس (پسورد، توکن‌ها)
- رمزنگاری پیام‌های خطا

## 💡 استفاده پیشرفته

### 1. فیلترهای ترکیبی
```javascript
features.addManualFilter({
  $or: [
    { price: { $lt: 100 } },
    { 'specs.weight': { $gt: 500 } }
  ]
});
```

### 2. مراحل سفارشی Aggregation
```javascript
features.pipeline.push({
  $addFields: {
    priceWithTax: { 
      $multiply: ["$price", 1.09] 
    }
  }
});
```

### 3. جستجوی متن کامل
```javascript
features.addManualFilter({
  $text: { 
    $search: "wireless headphones",
    $language: "en",
    $caseSensitive: false 
  }
});
```

### 4. جمع‌آوری آمار
```javascript
features.pipeline.push({
  $group: {
    _id: "$category",
    totalProducts: { $sum: 1 },
    avgPrice: { $avg: "$price" }
  }
});
```

## 🏆 بهترین روش‌های توسعه

### 1. ایندکس‌گذاری هوشمند
```javascript
productSchema.index({ 
  name: 'text',
  price: 1, 
  createdAt: -1 
});
```

### 2. سیستم کشینگ
```javascript
const redisClient = require('./redis');
const cacheKey = `products_${JSON.stringify(req.query)}`;

const cached = await redisClient.get(cacheKey);
if (cached) return res.json(JSON.parse(cached));

await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));
```

### 3. مانیتورینگ عملکرد
```javascript
const explain = await Model.aggregate(pipeline)
  .explain("executionStats");

console.log('Execution Stats:', explain.executionStats);
```

### 4. تست استرس با Artillery
```yaml
# load-test.yml
config:
  target: "https://api.example.com"
  phases:
    - duration: 60
      arrivalRate: 100
scenarios:
  - flow:
      - get:
          url: "/products?limit=100"
```

### 5. مدیریت خطاها
```javascript
.catch(error => {
  console.error('API Error:', error);
  Sentry.captureException(error);
  NewRelic.noticeError(error);
});
```

## 📄 مثال کامل
```http
GET /api/products?
  page=1&
  limit=10&
  sort=-createdAt,price&
  fields=name,price,category&
  populate=category,brand&
  price[gte]=1000&
  category[in]=electronics,phones&
  name[regex]=^Samsung
```

## 📚 مستندات تکمیلی
- **Documentation:** DOCUMENTATION.md
- **گزارش اشکال:** Issues Page
- **پیشنهادات:** Discussions Page
