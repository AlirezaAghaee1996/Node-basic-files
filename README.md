```markdown
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
7. [Full Examples / مثال‌های کامل](#full-examples)
8. [Summary / جمع‌بندی](#summary)

---

## English Version

### Installation & Setup
- **Prerequisites:** Node.js 16+, MongoDB 5+, Mongoose 7+  
- **Install Dependencies:**
  ```bash
  npm install mongoose lodash dotenv
  ```

### Overview
The **ApiFeatures** class processes incoming query parameters and builds an aggregation pipeline step by step. It supports:
- Advanced filtering, sorting, and field selection
- Pagination with default values (defaults to page 1 and limit 10 if not provided)
- Population of related documents including support for nested population
- Automatic application of conditions such as `isActive: true` if the field exists (for non-admin users)
- Input sanitization, numeric validation, and security enforcement (via `securityConfig`)

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
  Executes the aggregation pipeline using Mongoose and returns an object containing a success flag, total count, and result data.
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

### Full Examples

#### Example 1: Basic Query
```javascript
import { ApiFeatures } from "./api-features.js";
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
    populate: {
      path: "subCategory",
      select: "title"
    }
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
  Uses `$project` to include only permitted fields.
- **Pagination:**  
  Applies `$skip` and `$limit` with default values (page 1, limit 10) if not provided; max limits are based on user role.
- **Populate:**  
  Uses `$lookup` and `$unwind` to join related documents. Accepts string, object, and array inputs (supports nested population).
- **Security:**  
  Enforces allowed operators, input sanitization, numeric validation, removal of dangerous operators, and role-based restrictions via `securityConfig`.
- **Ordering of Manual Filters:**  
  Manual filters must be added using `addManualFilters()` **before** calling `filter()` to ensure they are correctly merged.

This class is a one-stop solution for integrating powerful, secure, and customizable query functionalities into any Node.js/MongoDB project.  
این کلاس یک راهکار جامع برای ادغام قابلیت‌های قدرتمند، امن و قابل سفارشی‌سازی در هر پروژه Node.js/MongoDB ارائه می‌دهد.

---

## فارسی

### نصب و راه‌اندازی
- **پیش‌نیازها:** Node.js 16+، MongoDB 5+، Mongoose 7+  
- **نصب کتابخانه‌ها:**
  ```bash
  npm install mongoose lodash dotenv
  ```

### معرفی
کلاس **ApiFeatures** پارامترهای ورودی را پردازش کرده و به صورت مرحله به مرحله یک Pipeline Aggregation می‌سازد. این کلاس از فیلترینگ پیشرفته، مرتب‌سازی، انتخاب فیلد، صفحه‌بندی و پرکردن اسناد مرتبط پشتیبانی می‌کند. همچنین شروطی نظیر افزودن خودکار شرط `isActive: true` در صورت وجود فیلد (برای کاربران غیرadmin) و استفاده از مقادیر پیش‌فرض صفحه‌بندی (صفحه 1 و محدودیت 10 در صورت عدم ارسال) را اعمال می‌کند.

### متدهای کلاس API Features

#### filter() / فیلتر
- **توضیح:**  
  پارامترهای کوئری را تجزیه کرده، آن‌ها را با فیلترهای دستی (در صورت استفاده) ترکیب می‌کند و سپس فیلترهای امنیتی را اعمال می‌کند. اگر فیلد `isActive` در اسکیما وجود داشته باشد و کاربر admin نباشد، شرط `isActive: true` نیز اضافه می‌شود.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?status=active&price[gte]=100
  const features = new ApiFeatures(Product, req.query);
  features.filter();
  // به Pipeline اضافه می‌کند: { $match: { status: "active", price: { $gte: 100 }, isActive: true } }
  ```

#### sort() / مرتب‌سازی
- **توضیح:**  
  رشته‌ای از فیلدهای مرتب‌سازی را دریافت کرده و به شیء `$sort` تبدیل می‌کند. اگر فیلد با "-" شروع شود، ترتیب نزولی است.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?sort=-price,createdAt
  const features = new ApiFeatures(Product, req.query);
  features.sort();
  // به Pipeline اضافه می‌کند: { $sort: { price: -1, createdAt: 1 } }
  ```

#### limitFields() / انتخاب فیلدها
- **توضیح:**  
  تنها فیلدهای مشخص شده را برمی‌گرداند و فیلدهای ممنوع نظیر `password` را حذف می‌کند. از `$project` استفاده می‌کند.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?fields=name,price,category,password
  const features = new ApiFeatures(Product, req.query);
  features.limitFields();
  // به Pipeline اضافه می‌کند: { $project: { name: 1, price: 1, category: 1 } }
  ```

#### paginate() / صفحه‌بندی
- **توضیح:**  
  شماره صفحه و تعداد آیتم‌ها را دریافت کرده و با استفاده از `$skip` و `$limit` صفحه‌بندی می‌کند. در صورت عدم ارسال `page` و `limit`، پیش‌فرض صفحه ۱ و تعداد ۱۰ آیتم اعمال می‌شود.
- **مثال استفاده:**
  ```javascript
  // URL: /api/products?page=2&limit=20
  const features = new ApiFeatures(Product, req.query, "user");
  features.paginate();
  // به Pipeline اضافه می‌کند: { $skip: 20 } و { $limit: 20 }
  ```

#### populate() / پرکردن (Populate)
- **توضیح:**  
  با استفاده از `$lookup` و `$unwind`، اسناد مرتبط را به سند اصلی متصل می‌کند. این متد ورودی‌های مختلفی را پشتیبانی می‌کند:
  - **ورودی رشته‌ای:** فهرستی از نام فیلدها به صورت جداشده با کاما.
  - **ورودی شیئی:** شیئی حاوی کلید `path` (الزامی) و اختیاری `select`.
  - **ورودی آرایه‌ای:** آرایه‌ای از رشته‌ها یا اشیاء برای پرکردن چندگانه یا تو در تو.
- **مثال‌های استفاده:**
  - **ورودی رشته‌ای ساده:**
    ```javascript
    // URL: /api/products?populate=category,brand
    const features = new ApiFeatures(Product, req.query);
    features.populate();
    // به Pipeline، مراحل $lookup و $unwind برای "category" و "brand" اضافه می‌شود.
    ```
  - **ورودی شیئی:**
    ```javascript
    const populateOptions = { path: "category", select: "name description" };
    const features = new ApiFeatures(Product, req.query);
    features.populate(populateOptions);
    // کلکسیون "category" پیوست شده و تنها فیلدهای "name" و "description" برمی‌گردد.
    ```
  - **ورودی آرایه‌ای:**
    ```javascript
    const populateArray = [
      "brand",  // ورودی ساده رشته‌ای
      { path: "category", select: "name description" },
      { path: "category", select: "name", populate: { path: "subCategory", select: "title" } }
    ];
    const features = new ApiFeatures(Product, req.query, "admin");
    features.populate(populateArray);
    // هر ورودی آرایه‌ای به درستی پردازش می‌شود.
    ```

#### addManualFilters() / فیلترهای دستی
- **توضیح:**  
  فیلترهای دستی اضافه شده را با فیلترهای استخراج‌شده از کوئری ترکیب می‌کند.  
  **توجه:** ابتدا متد `addManualFilters()` را فراخوانی کنید و سپس `filter()` را اجرا نمایید تا فیلترهای دستی در کوئری لحاظ شوند.
- **مثال استفاده:**
  ```javascript
  const manualFilter = { category: "electronics" };
  const features = new ApiFeatures(Product, { status: "active" });
  features.addManualFilters(manualFilter).filter();
  ```

#### execute() / اجرا
- **توضیح:**  
  Pipeline ساخته‌شده را با استفاده از aggregation mongoose اجرا می‌کند و به صورت همزمان pipeline‌های شمارش و داده را اجرا کرده و نتیجه شامل تعداد کل و داده‌های استخراج‌شده را برمی‌گرداند.
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
- **اپراتورهای فیلترینگ:**  
  اپراتورهایی مانند eq، ne، gt، gte، lt، lte، in، nin، regex، و exists مورد استفاده قرار می‌گیرند.
- **مرتب‌سازی، انتخاب فیلد، صفحه‌بندی:**  
  از `$sort`، `$project`، `$skip` و `$limit` استفاده می‌شود.
- **ورودی Populate:**  
  ورودی می‌تواند رشته‌ای (مثلاً "category,brand")، شیئی (مانند `{ path: "category", select: "name description" }`) یا آرایه‌ای از این موارد باشد.

---

### شرایط اضافی
- **شرط isActive:**  
  در صورت وجود فیلد `isActive` در اسکیما و نبود نقش admin، شرط `isActive: true` به کوئری اضافه می‌شود.
- **صفحه‌بندی پیش‌فرض:**  
  اگر پارامترهای `page` و `limit` ارسال نشوند، به صورت پیش‌فرض صفحه ۱ و تعداد ۱۰ آیتم اعمال می‌شود.
- **اعتبارسنجی عددی:**  
  مطمئن می‌شود که فیلدهایی نظیر `page` و `limit` تنها شامل اعداد هستند.
- **حذف اپراتورهای خطرناک:**  
  اپراتورهایی مانند `$where`، `$accumulator` و `$function` از ورودی حذف می‌شوند.
- **ترتیب استفاده از فیلترهای دستی:**  
  در صورت استفاده از `addManualFilters()`، ابتدا آن را فراخوانی کنید و سپس `filter()` را اجرا نمایید.

---

### تنظیمات امنیتی
تنظیمات امنیتی شامل محدودیت‌های اپراتور، حذف فیلدهای ممنوع و محدودیت‌های مبتنی بر نقش است:
```javascript
export const securityConfig = {
  allowedOperators: [
    "eq", "ne", "gt", "gte",
    "lt", "lte", "in", "nin",
    "regex", "exists", "size", "or", "and"
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
این تنظیمات به‌طور خودکار در متدهایی مانند filter، paginate و limitFields استفاده می‌شوند.

---

### مثال‌های کامل

#### مثال 1: کوئری پایه
```javascript
import { ApiFeatures } from "./api-features.js";
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
- **فیلترینگ:**  
  از `$match` برای ترکیب فیلترهای کوئری، فیلترهای دستی و شرط `isActive: true` (در صورت وجود) استفاده می‌شود.
- **مرتب‌سازی:**  
  ورودی‌های جداشده با کاما به یک شیء `$sort` تبدیل می‌شود.
- **انتخاب فیلد:**  
  از `$project` برای بازگرداندن تنها فیلدهای مجاز استفاده می‌شود.
- **صفحه‌بندی:**  
  از `$skip` و `$limit` استفاده می‌شود؛ در صورت عدم ارسال پارامتر، صفحه 1 و محدودیت 10 به صورت پیش‌فرض اعمال می‌گردد.
- **پرکردن:**  
  از `$lookup` و `$unwind` برای اتصال اسناد مرتبط استفاده می‌شود؛ ورودی‌های رشته‌ای، شیئی و آرایه‌ای (شامل پرکردن تو در تو) پشتیبانی می‌شود.
- **امنیت:**  
  اپراتورهای مجاز، پاکسازی ورودی، اعتبارسنجی عددی، حذف فیلدهای ممنوع و محدودیت‌های مبتنی بر نقش از طریق تنظیمات securityConfig اجرا می‌شود.
- **ترتیب استفاده از فیلترهای دستی:**  
  حتماً ابتدا `addManualFilters()` را فراخوانی کنید و سپس `filter()` را اجرا نمایید.

این کلاس یک راهکار جامع جهت ادغام قابلیت‌های پرس‌وجو قدرتمند و امن در هر پروژه Node.js/MongoDB می‌باشد.

---
```