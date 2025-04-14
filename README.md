# Advanced API Features & Security Config for MongoDB

This repository provides a robust, feature-rich, and secure solution for building, customizing, and optimizing your Node.js APIs powered by MongoDB.

این مخزن راهکاری قدرتمند، جامع و امن برای ساخت، شخصی‌سازی و بهینه‌سازی APIهای Node.js مبتنی بر MongoDB ارائه می‌دهد.

---

## Table of Contents / فهرست مطالب

1. [Installation & Setup / نصب و راه‌اندازی](#installation--setup)
2. [Overview / معرفی](#overview)
3. [API Features Class Methods / متدهای کلاس API Features](#api-features-class-methods)
   - [filter() / فیلتر](#filter)
   - [sort() / مرتب‌سازی](#sort)
   - [limitFields() / انتخاب فیلدها](#limitfields)
   - [paginate() / صفحه‌بندی](#paginate)
   - [populate() / پرکردن (Populate)](#populate)
   - [addManualFilters() / فیلترهای دستی](#addmanualfilters)
   - [execute() / اجرا](#execute)
4. [Input Types & Supported Operators / انواع ورودی و اپراتورهای پشتیبانی‌شده](#input-types--supported-operators)
5. [Additional Conditions / شرایط اضافی](#additional-conditions)
6. [Security Configuration / تنظیمات امنیتی](#security-configuration)
7. [Security & Performance Enhancements / بهبودهای امنیتی و عملکردی](#security--performance-enhancements)
8. [Error Handling Middleware / مدیریت خطا به صورت Middleware](#error-handling-middleware)
9. [Full Examples / مثال‌های کامل](#full-examples)
10. [Summary / جمع‌بندی](#summary)

---

## English Version

### Installation & Setup
- **Prerequisites:** Node.js 16+, MongoDB 5+, Mongoose 7+  
- **Install Dependencies:**
  ```bash
  npm install mongoose lodash dotenv winston
  ```
  For testing purposes, install Jest or Mocha:
  ```bash
  npm install --save-dev jest
  ```

### Overview
The **ApiFeatures** class processes incoming query parameters and builds an aggregation pipeline step by step. It supports:
- Advanced filtering, sorting, and field selection.
- Pagination with default values (defaults to page 1 and limit 10 if not provided).
- Population of related documents including support for nested population.
- Automatic application of conditions such as `isActive: true` if the field exists (for non-admin users).
- Input sanitization, numeric validation, and security enforcement (via `securityConfig`).
- **Enhanced logging** using winston and improved error handling with custom error classes.
- **Dynamic configuration:** Security settings are maintained in a separate config file.
- **Performance improvements:** Includes aggregation cursor support and optimized pipeline order.
- **Error middleware:** A centralized error handling middleware (`catchError`) is provided.

### API Features Class Methods

#### filter()
- **Description:**  
  Parses query parameters, merges them with manually added filters (if provided), and applies security filters. If the model schema includes an `isActive` field and the user is not "admin," it auto-adds `isActive: true`.
- **Usage Example:**
  ```javascript
  // URL: /api/products?status=active&price[gte]=100
  const features = new ApiFeatures(Product, req.query);
  features.filter();
  // Pipeline adds: { $match: { status: "active", price: { $gte: 100 }, isActive: true } }
  ```

#### sort()
- **Description:**  
  Converts a comma-separated list of sorting fields into a `$sort` object. A "-" before a field indicates descending order.
- **Usage Example:**
  ```javascript
  // URL: /api/products?sort=-price,createdAt
  const features = new ApiFeatures(Product, req.query);
  features.sort();
  // Pipeline adds: { $sort: { price: -1, createdAt: 1 } }
  ```

#### limitFields()
- **Description:**  
  Uses `$project` to return only the specified fields, excluding forbidden fields (e.g., "password").
- **Usage Example:**
  ```javascript
  // URL: /api/products?fields=name,price,category,password
  const features = new ApiFeatures(Product, req.query);
  features.limitFields();
  // Pipeline adds: { $project: { name: 1, price: 1, category: 1 } }
  ```

#### paginate()
- **Description:**  
  Applies pagination by determining the page and limit. Defaults to page 1 and limit 10 if not provided. The max limit is based on the user's role (configured in `securityConfig`).
- **Usage Example:**
  ```javascript
  // URL: /api/products?page=2&limit=20
  const features = new ApiFeatures(Product, req.query, "user");
  features.paginate();
  // Pipeline adds: { $skip: 20 } and { $limit: 20 }
  ```

#### populate()
- **Description:**  
  Joins related documents using `$lookup` and `$unwind`. It supports:
  - **String Input:** A comma-separated list of field names.
  - **Object Input:** An object with `path` (required) and `select` (optional).
  - **Array Input:** An array of strings or objects for multiple or nested populates.
- **Usage Examples:**
  - **String Input:**
    ```javascript
    // URL: /api/products?populate=category,brand
    const features = new ApiFeatures(Product, req.query);
    features.populate();
    // Adds lookup for "category" and "brand"
    ```
  - **Object Input:**
    ```javascript
    const populateOptions = { path: "category", select: "name description" };
    const features = new ApiFeatures(Product, req.query);
    features.populate(populateOptions);
    ```
  - **Array Input:**
    ```javascript
    const populateArray = [
      "brand",  // simple string
      { path: "category", select: "name description" },
      { path: "category", select: "name", populate: { path: "subCategory", select: "title" } }
    ];
    const features = new ApiFeatures(Product, req.query, "admin");
    features.populate(populateArray);
    ```
  
#### addManualFilters()
- **Description:**  
  Merges additional filters with those parsed from the query. **Note:** Call `addManualFilters()` before `filter()` so that manual filters are included.
- **Usage Example:**
  ```javascript
  const manualFilter = { category: "electronics" };
  const features = new ApiFeatures(Product, { status: "active" });
  features.addManualFilters(manualFilter).filter();
  ```

#### execute()
- **Description:**  
  Executes the aggregation pipeline using Mongoose and returns an object containing a success flag, total count, and result data. Supports aggregation cursor for large datasets.
- **Usage Example:**
  ```javascript
  const features = new ApiFeatures(Product, req.query);
  const result = await features
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate()
    .execute();
  console.log(result);
  ```

### Input Types & Supported Operators

#### Filtering Operators
The class converts query parameters into MongoDB operators:
| Operator | Example Query            | Description                |
|----------|--------------------------|----------------------------|
| eq       | `?age=25`                | Equal to                   |
| ne       | `?status[ne]=inactive`   | Not equal to               |
| gt       | `?price[gt]=100`         | Greater than               |
| gte      | `?stock[gte]=50`         | Greater than or equal to   |
| lt       | `?weight[lt]=500`        | Less than                  |
| lte      | `?rating[lte]=3`         | Less than or equal to      |
| in       | `?colors[in]=red,blue`   | In the list                |
| nin      | `?size[nin]=xl`          | Not in the list            |
| regex    | `?name[regex]=^A`        | Regex search               |
| exists   | `?discount[exists]=true` | Field existence            |

#### Sorting, Projection, Pagination
- **Sorting:** Uses `$sort`  
- **Projection:** Uses `$project`  
- **Pagination:** Uses `$skip` and `$limit` (defaults to page 1 and limit 10)

#### Populate Input Variations
- **String:** e.g., `"category,brand"`  
- **Object:** e.g., `{ path: "category", select: "name description" }`  
- **Array:** e.g., `["brand", { path: "category", select: "name" }, ...]`

### Additional Conditions
- **isActive Condition:**  
  If the model includes an `isActive` field and the user is not admin, `filter()` auto-adds `isActive: true`.
- **Default Pagination:**  
  If no `page` or `limit` are provided, defaults are used (page 1, limit 10), adjusted based on user role.
- **Numeric Validation:**  
  Validates that fields such as `page` and `limit` contain only numbers.
- **Removal of Dangerous Operators:**  
  Operators like `$where`, `$accumulator`, and `$function` are removed from the query.
- **Ordering of Manual Filters:**  
  Call `addManualFilters()` before `filter()` to ensure manual filters are properly merged.

### Security Configuration
Security settings are used to enforce:
- Allowed operators  
- Forbidden fields (e.g., `"password"`)
- Role-based access limits (maxLimit and allowedPopulate)
  
```javascript
export const securityConfig = {
  allowedOperators: [
    "eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "regex", "exists", "size", "or", "and"
  ],
  forbiddenFields: ["password"],
  accessLevels: {
    guest: { maxLimit: 50, allowedPopulate: ["*"] },
    user: { maxLimit: 100, allowedPopulate: ["*"] },
    admin: { maxLimit: 1000, allowedPopulate: ["*"] },
    superAdmin: { maxLimit: 1000, allowedPopulate: ["*"] }
  }
};
```
These settings are automatically applied in methods like `filter()`, `paginate()`, and `limitFields()`.

---

## Security & Performance Enhancements
- **Enhanced Logging:**  
  Uses winston to log events and errors with different levels (info, warn, error) along with timestamps and stack traces.
- **Improved Error Handling:**  
  Centralized error handling is done with a custom error class (**HandleERROR**) that marks errors as operational.
- **Dynamic Configuration:**  
  Security settings are maintained in `config.js`, allowing runtime changes without modifying core code.
- **Performance Optimization:**  
  Aggregation cursor support is added in `execute()` for large datasets, and pipelines are optimized by placing filtering stages at the beginning.

---

## Error Handling Middleware
A dedicated error-handling middleware (`catchError`) is implemented to centralize error responses:
```javascript
import catchError from "./errorHandler.js";

// Usage in Express.js:
// app.use(catchError);
```
This middleware standardizes error responses by setting the HTTP status code and JSON error message.

---

## Full Examples

#### Example 1: Basic Query
```javascript
import ApiFeatures from "./api-features.js";
import Product from "./models/product.js";

// URL: /api/products?status=active&price[gte]=100&sort=-price,createdAt&fields=name,price,category&page=1&limit=10&populate=category,brand
const features = new ApiFeatures(Product, req.query, "user");
const result = await features
  .filter()
  .sort()
  .limitFields()
  .paginate()
  .populate()
  .execute();
console.log(result);
```

#### Example 2: Query with Manual Filters  
*(Call `addManualFilters()` before `filter()`)*  
```javascript
const query = { status: "active" };
const manualFilter = { category: "electronics" };
const features = new ApiFeatures(Product, query, "user");
features.addManualFilters(manualFilter).filter();
const result = await features.execute();
console.log(result);
```

#### Example 3: Advanced Nested Populate with Array Input
```javascript
const populateArray = [
  "brand",  // Simple string input
  {         // Object input with projection
    path: "category",
    select: "name description"
  },
  {         // Nested populate: populate "category" then its "subCategory"
    path: "category",
    select: "name",
    populate: { path: "subCategory", select: "title" }
  }
];
const features = new ApiFeatures(Product, req.query, "admin");
const result = await features.populate(populateArray).execute();
console.log(result);
```

#### Example 4: Full Advanced Query Example
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

#### Example 5: Using Default Pagination (when page and limit are not provided)
```javascript
// URL: /api/products?status=active
const features = new ApiFeatures(Product, req.query);
const result = await features
  .filter()      // will use default page = 1, limit = 10
  .execute();
console.log(result);
```

---

## Summary
- **Filtering:**  
  Uses `$match` to apply combined query filters, manual filters, and condition `isActive: true` (for non-admin users).
- **Sorting:**  
  Converts a comma-separated string into a `$sort` object.
- **Field Selection:**  
  Uses `$project` to return only permitted fields.
- **Pagination:**  
  Applies `$skip` and `$limit` (defaults to page 1 and limit 10 if parameters are missing) with role-based max limits.
- **Populate:**  
  Uses `$lookup` and `$unwind` to join related documents; supports string, object, and array inputs (including nested population).
- **Security:**  
  Enforces allowed operators, sanitizes inputs, validates numeric fields, and removes dangerous operators through `securityConfig`.
- **Ordering of Manual Filters:**  
  Ensure `addManualFilters()` is called before `filter()` for proper inclusion.
- **Enhanced Logging & Error Handling:**  
  Advanced logging via winston and centralized error handling using a custom error class (**HandleERROR**) along with an Express middleware (`catchError`).
- **Performance Optimizations:**  
  Supports aggregation cursor for large datasets and optimizes aggregation pipelines for improved resource usage.

This comprehensive class provides a one-stop solution for integrating powerful, secure, and customizable query capabilities into any Node.js/MongoDB project.

---

## فارسی

### نصب و راه‌اندازی
- **پیش‌نیازها:** Node.js 16+، MongoDB 5+، Mongoose 7+  
- **نصب کتابخانه‌ها:**
  ```bash
  npm install mongoose lodash dotenv winston
  ```
  
### معرفی
کلاس **ApiFeatures** پارامترهای ورودی را پردازش کرده و به صورت مرحله به مرحله یک Pipeline Aggregation می‌سازد. این کلاس از فیلترینگ پیشرفته، مرتب‌سازی، انتخاب فیلد، صفحه‌بندی و پرکردن اسناد مرتبط پشتیبانی می‌کند. همچنین شرایطی مانند افزودن خودکار شرط `isActive: true` (برای کاربران غیر admin) و استفاده از مقادیر پیش‌فرض صفحه‌بندی (صفحه 1 و تعداد 10 آیتم) را اعمال می‌کند. علاوه بر این، با استفاده از لاگینگ پیشرفته (winston)، مدیریت خطاهای متمرکز (با کلاس HandleERROR و middleware catchError) و پیکربندی داینامیک تنظیمات امنیتی، بهینه‌سازی عملکرد نیز انجام شده است.

### متدهای کلاس API Features

#### filter() / فیلتر
- **توضیح:**  
  پارامترهای کوئری را تجزیه کرده، آن‌ها را با فیلترهای دستی ترکیب کرده و سپس فیلترهای امنیتی را اعمال می‌کند. اگر فیلد `isActive` وجود داشته باشد و کاربر admin نباشد، شرط `isActive: true` اضافه می‌شود.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?status=active&price[gte]=100
  const features = new ApiFeatures(Product, req.query);
  features.filter();
  // به Pipeline اضافه می‌کند: { $match: { status: "active", price: { $gte: 100 }, isActive: true } }
  ```

#### sort() / مرتب‌سازی
- **توضیح:**  
  رشته‌ای از فیلدهای مرتب‌سازی را دریافت کرده و به شیء `$sort` تبدیل می‌کند؛ اگر فیلد با "-" شروع شود، ترتیب نزولی در نظر گرفته می‌شود.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?sort=-price,createdAt
  const features = new ApiFeatures(Product, req.query);
  features.sort();
  // به Pipeline اضافه می‌کند: { $sort: { price: -1, createdAt: 1 } }
  ```

#### limitFields() / انتخاب فیلدها
- **توضیح:**  
  از `$project` استفاده می‌کند تا تنها فیلدهای مجاز را برگرداند و فیلدهای ممنوع مانند `password` حذف شوند.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?fields=name,price,category,password
  const features = new ApiFeatures(Product, req.query);
  features.limitFields();
  // به Pipeline اضافه می‌کند: { $project: { name: 1, price: 1, category: 1 } }
  ```

#### paginate() / صفحه‌بندی
- **توضیح:**  
  با استفاده از `$skip` و `$limit`، صفحه‌بندی را براساس پارامترهای ورودی یا مقادیر پیش‌فرض (صفحه 1، تعداد 10 آیتم) اعمال می‌کند. محدودیت تعداد آیتم نیز بر اساس نقش کاربر تنظیم می‌شود.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?page=2&limit=20
  const features = new ApiFeatures(Product, req.query, "user");
  features.paginate();
  // به Pipeline اضافه می‌کند: { $skip: 20 } و { $limit: 20 }
  ```

#### populate() / پرکردن (Populate)
- **توضیح:**  
  با استفاده از `$lookup` و `$unwind`، اسناد مرتبط را به سند اصلی متصل می‌کند. این متد از ورودی‌های مختلف مانند رشته‌ای، شیئی و آرایه‌ای (حتی تو در تو) پشتیبانی می‌کند.
- **مثال‌های استفاده:**
  - **ورودی رشته‌ای:**
    ```javascript
    // URL: /api/products?populate=category,brand
    const features = new ApiFeatures(Product, req.query);
    features.populate();
    ```
  - **ورودی شیئی:**
    ```javascript
    const populateOptions = { path: "category", select: "name description" };
    const features = new ApiFeatures(Product, req.query);
    features.populate(populateOptions);
    ```
  - **ورودی آرایه‌ای:**
    ```javascript
    const populateArray = [
      "brand", 
      { path: "category", select: "name description" },
      { path: "category", select: "name", populate: { path: "subCategory", select: "title" } }
    ];
    const features = new ApiFeatures(Product, req.query, "admin");
    features.populate(populateArray);
    ```
    
#### addManualFilters() / فیلترهای دستی
- **توضیح:**  
  فیلترهای دستی اضافه‌شده را با فیلترهای استخراج شده از کوئری ترکیب می‌کند. **توجه:** ابتدا این متد را فراخوانی کنید و سپس متد filter() را اجرا نمایید.
- **مثال استفاده:**
  ```javascript
  const manualFilter = { category: "electronics" };
  const features = new ApiFeatures(Product, { status: "active" });
  features.addManualFilters(manualFilter).filter();
  ```

#### execute() / اجرا
- **توضیح:**  
  Pipeline ساخته‌شده را با استفاده از Mongoose اجرا می‌کند و نتیجه شامل تعداد کل و داده‌های استخراج‌شده را برمی‌گرداند. در صورت نیاز از aggregation cursor جهت پردازش بهینه داده‌های حجیم استفاده می‌کند.
- **مثال استفاده:**
  ```javascript
  const features = new ApiFeatures(Product, req.query);
  const result = await features
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate()
    .execute();
  console.log(result);
  ```

#### انواع ورودی و اپراتورهای پشتیبانی‌شده
- **اپراتورهای فیلترینگ:** مانند eq، ne، gt، gte، lt، lte، in، nin، regex و exists.
- **مرتب‌سازی، انتخاب فیلد و صفحه‌بندی:** با استفاده از `$sort`، `$project`، `$skip` و `$limit`.
- **ورودی Populate:** ورودی به صورت رشته‌ای (به عنوان مثال "category,brand")، شیئی یا آرایه‌ای امکان‌پذیر است.

---

### شرایط اضافی
- **شرط isActive:** در صورت وجود فیلد `isActive` در اسکیما و عدم وجود نقش admin، شرط `isActive: true` به کوئری اضافه می‌شود.
- **صفحه‌بندی پیش‌فرض:** در صورت عدم ارسال `page` و `limit` از مقادیر پیش‌فرض (صفحه 1، تعداد 10) استفاده می‌شود.
- **اعتبارسنجی ورودی:** فیلدهای عددی مانند page و limit اعتبارسنجی می‌شوند تا تنها شامل اعداد باشند.
- **حذف اپراتورهای خطرناک:** اپراتورهایی مانند `$where`، `$accumulator` و `$function` از ورودی حذف می‌شوند.
- **ترتیب استفاده از فیلترهای دستی:** ابتدا `addManualFilters()` فراخوانی و سپس `filter()` اجرا می‌شود.

---

### تنظیمات امنیتی
تنظیمات امنیتی شامل محدودیت‌های اپراتور، حذف فیلدهای ممنوع و محدودیت‌های مبتنی بر نقش است:
```javascript
export const securityConfig = {
  allowedOperators: [
    "eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "regex", "exists", "size", "or", "and"
  ],
  forbiddenFields: ["password"],
  accessLevels: {
    guest: { maxLimit: 50, allowedPopulate: ["*"] },
    user: { maxLimit: 100, allowedPopulate: ["*"] },
    admin: { maxLimit: 1000, allowedPopulate: ["*"] },
    superAdmin: { maxLimit: 1000, allowedPopulate: ["*"] }
  }
};
```
این تنظیمات به‌صورت خودکار در متدهایی مانند filter، paginate و limitFields اعمال می‌شوند.

---

### بهبودهای امنیتی و عملکردی
- **لاگینگ پیشرفته:**  
  با استفاده از winston، رویدادها و خطاها با سطوح مختلف (info, warn, error) و اطلاعات دقیق (timestamp و stack trace) ثبت می‌شوند.
- **مدیریت خطا بهبود یافته:**  
  استفاده از کلاس سفارشی HandleERROR جهت دسته‌بندی خطاها و middleware استاندارد جهت پاسخ‌دهی به خطاها.
- **تنظیمات داینامیک:**  
  تنظیمات امنیتی در فایل config.js نگهداری شده و به راحتی قابل تغییر بدون نیاز به تغییر کد اصلی می‌باشد.
- **بهینه‌سازی عملکرد:**  
  پشتیبانی از aggregation cursor در متد execute جهت پردازش داده‌های حجیم و بهینه‌سازی ترتیب مراحل Pipeline جهت کاهش مصرف منابع.

---

### مدیریت خطا به صورت Middleware
برای مدیریت یکنواخت خطاهای رخ داده در API از middleware زیر استفاده می‌شود:
```javascript
import catchError from "./errorHandler.js";

// استفاده در Express.js:
app.use(catchError);
```
این middleware، خطا را دریافت کرده و با تنظیم status و پیام مناسب، پاسخ استانداردی به کلاینت برمی‌گرداند.

---

### مثال‌های کامل

#### مثال 1: کوئری پایه
```javascript
import ApiFeatures from "./api-features.js";
import Product from "./models/product.js";

// URL: /api/products?status=active&price[gte]=100&sort=-price,createdAt&fields=name,price,category&page=1&limit=10&populate=category,brand
const features = new ApiFeatures(Product, req.query, "user");
const result = await features
  .filter()
  .sort()
  .limitFields()
  .paginate()
  .populate()
  .execute();
console.log(result);
```

#### مثال 2: کوئری با فیلترهای دستی  
*(ابتدا `addManualFilters()` سپس `filter()` فراخوانی شود)*
```javascript
const query = { status: "active" };
const manualFilter = { category: "electronics" };
const features = new ApiFeatures(Product, query, "user");
features.addManualFilters(manualFilter).filter();
const result = await features.execute();
console.log(result);
```

#### مثال 3: پرکردن تو در تو با ورودی آرایه‌ای
```javascript
const populateArray = [
  "brand",  // ورودی رشته‌ای ساده
  {         // ورودی شیئی با انتخاب فیلد
    path: "category",
    select: "name description"
  },
  {         // پرکردن تو در تو: "category" به همراه "subCategory"
    path: "category",
    select: "name",
    populate: { path: "subCategory", select: "title" }
  }
];
const features = new ApiFeatures(Product, req.query, "admin");
const result = await features.populate(populateArray).execute();
console.log(result);
```

#### مثال 4: کوئری پیشرفته کامل
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

#### مثال 5: استفاده از صفحه‌بندی پیش‌فرض (بدون ارسال page و limit)
```javascript
// URL: /api/products?status=active
const features = new ApiFeatures(Product, req.query);
const result = await features
  .filter()      // در صورت عدم ارسال page/limit، صفحه 1 و محدودیت 10 اعمال می‌شود
  .execute();
console.log(result);
```

---

### جمع‌بندی
- **فیلترینگ:** از `$match` برای ترکیب فیلترهای کوئری، فیلترهای دستی و شرط `isActive: true` (در صورت وجود) استفاده می‌شود.
- **مرتب‌سازی:** رشته‌های جداشده با کاما به یک شیء `$sort` تبدیل می‌شوند.
- **انتخاب فیلد:** با استفاده از `$project` تنها فیلدهای مجاز برگردانده می‌شوند.
- **صفحه‌بندی:** از `$skip` و `$limit` با مقادیر پیش‌فرض (صفحه 1، محدودیت 10) استفاده می‌شود؛ محدودیت بر اساس نقش کاربر تنظیم می‌شود.
- **پرکردن:** با استفاده از `$lookup` و `$unwind` اسناد مرتبط به یک سند متصل می‌شوند؛ ورودی‌های رشته‌ای، شیئی و آرایه‌ای (شامل پرکردن تو در تو) پشتیبانی می‌شوند.
- **امنیت:** اپراتورهای مجاز، پاکسازی ورودی، اعتبارسنجی عددی، حذف فیلدهای ممنوع و محدودیت‌های مبتنی بر نقش از طریق تنظیمات securityConfig اعمال می‌شوند.
- **بهبود عملکرد:** پشتیبانی از aggregation cursor و بهینه‌سازی ترتیب مراحل Pipeline.
- **لاگینگ و مدیریت خطا:** استفاده از winston برای لاگینگ و کلاس سفارشی HandleERROR به همراه middleware catchError جهت مدیریت یکنواخت خطاها.
- **تنظیمات داینامیک:** امکان تغییر تنظیمات امنیتی از طریق فایل config.js بدون نیاز به تغییرات در کد اصلی.

این کلاس و ساختار پروژه یک راهکار جامع جهت ادغام قابلیت‌های پرس‌وجو قدرتمند، امنیت بالا، بهینه‌سازی عملکرد و نگهداری آسان در هر پروژه Node.js/MongoDB فراهم می‌کند.

---