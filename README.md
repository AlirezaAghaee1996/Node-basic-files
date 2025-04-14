```markdown
# Advanced API Features & Security Config for MongoDB  
# کلاس پیشرفته API Features و تنظیمات امنیتی برای MongoDB

A robust, feature-rich, and secure solution to build, customize, and optimize your Node.js APIs powered by MongoDB.  
یک راهکار قدرتمند، جامع و امن برای ساخت، شخصی‌سازی و بهینه‌سازی APIهای Node.js مبتنی بر MongoDB.

---

## Table of Contents / فهرست مطالب
- [Installation & Setup / نصب و راه‌اندازی](#installation--setup--نصب-و-راه‌اندازی)
- [Overview / معرفی](#overview--معرفی)
- [API Features Class Methods / متدهای کلاس API Features](#api-features-class-methods--متدهای-کلاس-api-features)
  - [filter() / فیلتر](#filter--فیلتر)
  - [sort() / مرتب‌سازی](#sort--مرتب‌سازی)
  - [limitFields() / انتخاب فیلدها](#limitfields--انتخاب-فیلدها)
  - [paginate() / صفحه‌بندی](#paginate--صفحه‌بندی)
  - [populate() / پرکردن (Populate)](#populate--پرکردن-populate)
  - [addManualFilters() / فیلترهای دستی](#addmanualfilters--فیلترهای-دستی)
  - [execute() / اجرا](#execute--اجرا)
- [Input Types and Supported Operators / انواع ورودی و اپراتورهای پشتیبانی شده](#input-types-and-supported-operators--انواع-ورودی-و-اپراتورهای-پشتیبانی-شده)
  - [Filtering Operators / اپراتورهای فیلترینگ](#filtering-operators--اپراتورهای-فیلترینگ)
  - [Sorting, Projection, Pagination / مرتب‌سازی، انتخاب فیلد و صفحه‌بندی](#sorting-projection-pagination--مرتب‌سازی-انتخاب-فیلد-و-صفحه‌بندی)
  - [Populate Input Variations / انواع ورودی برای Populate](#populate-input-variations--انواع-ورودی-برای-populate)
- [Security Configuration / تنظیمات امنیتی](#security-configuration--تنظیمات-امنیتی)
- [Full Examples / مثال‌های کامل](#full-examples--مثال‌های-کامل)
- [Summary / جمع‌بندی](#summary--جمع‌بندی)

---

## Installation & Setup / نصب و راه‌اندازی

### Prerequisites / پیش‌نیازها
- Node.js 16+
- MongoDB 5+
- Mongoose 7+

### Install Dependencies / نصب کتابخانه‌ها
```bash
npm install mongoose lodash dotenv
```

---

## Overview / معرفی

The **ApiFeatures** class is designed to process incoming query parameters and build an aggregation pipeline step by step. It supports advanced filtering, sorting, field selection, pagination, and population of related documents. Security measures such as sanitization, forbidden field removal, and role-based access control are built-in.  
کلاس **ApiFeatures** جهت پردازش پارامترهای کوئری دریافتی و ساخت مرحله به مرحله‌ی Pipeline Aggregation طراحی شده است. این کلاس از فیلترینگ پیشرفته، مرتب‌سازی، انتخاب فیلد، صفحه‌بندی و پرکردن اسناد مرتبط پشتیبانی می‌کند. همچنین اقدامات امنیتی مانند پاکسازی ورودی، حذف فیلدهای ممنوع و کنترل دسترسی مبتنی بر نقش نیز در آن لحاظ شده است.

---

## API Features Class Methods / متدهای کلاس API Features

### filter() / فیلتر
- **Description / توضیح:**  
  Processes query filters by parsing incoming query parameters, merging them with manually added filters, and then applying security filters. It adds a `$match` stage to both the main pipeline and the count pipeline.  
  این متد، پارامترهای ورودی فیلتر را تجزیه می‌کند، آن‌ها را با فیلترهای دستی ترکیب نموده و سپس با اعمال تنظیمات امنیتی، مرحله `$match` را به pipeline اصلی و pipeline شمارش اضافه می‌کند.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?status=active&price[gte]=100
  const features = new ApiFeatures(Product, req.query);
  features.filter();
  // Adds: { $match: { status: "active", price: { $gte: 100 } } }
  ```

---

### sort() / مرتب‌سازی
- **Description / توضیح:**  
  Converts a comma-separated list of sorting fields into an object used by `$sort`. A preceding "-" indicates descending order.  
  رشته‌ای از فیلدهای مرتب‌سازی (با جداکننده کاما) به یک شیء جهت استفاده در `$sort` تبدیل می‌شود. پیشوند "-" ترتیب نزولی را مشخص می‌کند.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?sort=-price,createdAt
  const features = new ApiFeatures(Product, req.query);
  features.sort();
  // Adds: { $sort: { price: -1, createdAt: 1 } }
  ```

---

### limitFields() / انتخاب فیلدها
- **Description / توضیح:**  
  Selects only the allowed fields specified in the query, removing any fields listed as forbidden (e.g., "password"). Uses the `$project` operator.  
  تنها فیلدهای مجاز طبق پارامترهای ورودی انتخاب شده و فیلدهای ممنوع (مانند `password`) حذف می‌شوند. از اپراتور `$project` استفاده می‌کند.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?fields=name,price,category,password
  const features = new ApiFeatures(Product, req.query);
  features.limitFields();
  // Pipeline adds: { $project: { name: 1, price: 1, category: 1 } }
  ```

---

### paginate() / صفحه‌بندی
- **Description / توضیح:**  
  Applies pagination by calculating the number of documents to skip and setting a limit. The maximum limit is determined by the user's access level defined in the security config.  
  با محاسبه تعداد اسناد رد شده و محدود کردن تعداد اسناد در هر صفحه، صفحه‌بندی را اعمال می‌کند. محدودیت حداکثر بر اساس سطح دسترسی کاربر از تنظیمات امنیتی تعیین می‌شود.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?page=2&limit=20
  const features = new ApiFeatures(Product, req.query, "user");
  features.paginate();
  // Pipeline adds: { $skip: 20 } and { $limit: 20 } (or adjusted by role-based maxLimit)
  ```

---

### populate() / پرکردن (Populate)
- **Description / توضیح:**  
  Joins related documents from another collection using MongoDB's `$lookup` and `$unwind` operators. It supports different input types:
  - **String Input:** A comma-separated string of field names.
  - **Object Input:** An object with `path` and optional `select` properties.
  - **Array Input:** An array containing either strings or objects for multi-level or multiple populates.
  
  برای اتصال اسناد مرتبط از کلکسیون دیگر از اپراتورهای `$lookup` و `$unwind` استفاده می‌کند. انواع ورودی پشتیبانی می‌شوند:
  - **ورودی رشته‌ای:** رشته جداشده با کاما از نام فیلدها.
  - **ورودی شیئی:** شیئی با کلید `path` و اختیاری `select`.
  - **ورودی آرایه‌ای:** آرایه‌ای از رشته‌ها یا اشیاء برای پر کردن چندگانه یا تو در تو.

- **Usage Example / مثال استفاده:**
  
  **Simple String Input / ورودی رشته‌ای ساده:**
  ```javascript
  // URL: /api/products?populate=category,brand
  const features = new ApiFeatures(Product, req.query);
  features.populate();
  // Pipeline adds $lookup and $unwind stages for "category" and "brand"
  ```

  **Object Input / ورودی شیئی:**
  ```javascript
  const populateOptions = {
    path: "category",
    select: "name description"
  };
  const features = new ApiFeatures(Product, req.query);
  features.populate(populateOptions);
  // Joins the "category" collection and returns only "name" and "description" fields.
  ```

  **Array Input with Multiple and Nested Populate / ورودی آرایه‌ای با چند مورد و پرکردن تو در تو:**
  ```javascript
  const populateArray = [
    "brand",  // Simple string input
    {         // Object input with select
      path: "category",
      select: "name"
    },
    {         // Nested populate example (if supported)
      path: "category",
      select: "name",
      populate: { path: "subCategory", select: "title" }
    }
  ];
  const features = new ApiFeatures(Product, req.query, "admin");
  features.populate(populateArray);
  // Pipeline processes each populate option accordingly.
  ```

---

### addManualFilters() / فیلترهای دستی
- **Description / توضیح:**  
  Merges additional filters provided manually with the parsed query filters.  
  فیلترهای اضافی (دستی) را با فیلترهای استخراج شده از کوئری ترکیب می‌کند.

- **Usage Example / مثال استفاده:**
  ```javascript
  const manualFilter = { category: "electronics" };
  const features = new ApiFeatures(Product, { status: "active" });
  features.addManualFilters(manualFilter).filter();
  // Combines "active" status with the manual filter for electronics.
  ```

---

### execute() / اجرا
- **Description / توضیح:**  
  Executes the built aggregation pipeline using Mongoose's aggregation functions. It runs both a data pipeline and a count pipeline concurrently, returning the results and the total count.  
  pipeline ساخته‌شده را با استفاده از متدهای aggregation mongoose اجرا می‌کند. همزمان pipeline داده و شمارش را اجرا کرده و تعداد کل و داده‌های بازگشتی را برمی‌گرداند.

- **Usage Example / مثال استفاده:**
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
  // Returns: { success: true, count: <total>, data: [ ...documents ] }
  ```

---

## Input Types and Supported Operators / انواع ورودی و اپراتورهای پشتیبانی شده

### Filtering Operators / اپراتورهای فیلترینگ
The class supports common MongoDB operators by converting query parameters as follows:
کلاس از اپراتورهای رایج MongoDB پشتیبانی می‌کند و آن‌ها را از پارامترهای ورودی تبدیل می‌کند:

| Operator | Example Query            | Description / توضیح          |
|----------|--------------------------|-----------------------------|
| eq       | `?age=25`                | Equal to / برابر با         |
| ne       | `?status[ne]=inactive`   | Not equal to / نابرابر با    |
| gt       | `?price[gt]=100`         | Greater than / بزرگتر از     |
| gte      | `?stock[gte]=50`         | Greater than or equal to / بزرگتر یا مساوی |
| lt       | `?weight[lt]=500`        | Less than / کوچکتر از        |
| lte      | `?rating[lte]=3`         | Less than or equal to / کوچکتر یا مساوی |
| in       | `?colors[in]=red,blue`   | Exists in the list / موجود در لیست |
| nin      | `?size[nin]=xl`          | Not in the list / عدم موجودیت در لیست |
| regex    | `?name[regex]=^A`        | Regex search / جستجو با Regex |
| exists   | `?discount[exists]=true` | Field existence / وجود فیلد   |

### Sorting, Projection, Pagination / مرتب‌سازی، انتخاب فیلد و صفحه‌بندی
- **Sorting:** Uses `$sort` and supports descending order with "-"  
  **مرتب‌سازی:** استفاده از `$sort`؛ پیشوند "-" ترتیب نزولی را نشان می‌دهد.
- **Projection:** Uses `$project` to include only allowed fields  
  **انتخاب فیلد:** استفاده از `$project` برای بازگردانی تنها فیلدهای مجاز.
- **Pagination:** Uses `$skip` and `$limit` based on user input and role-defined limits  
  **صفحه‌بندی:** استفاده از `$skip` و `$limit` بر اساس ورودی کاربر و محدودیت‌های تعریف شده در سطوح دسترسی.

### Populate Input Variations / انواع ورودی برای Populate
The populate method accepts:
- **String:**  
  A comma-separated list of field names.  
  **رشته‌ای:** فهرست جداشده با کاما از نام فیلدها.
- **Object:**  
  An object with properties:  
  - `path` (required): The reference field name.  
  - `select` (optional): A space-separated list of fields to include.  
  **شیئی:** شیئی با کلیدهای:  
    - `path` (الزامی): نام فیلد مرجع.
    - `select` (اختیاری): فهرستی از فیلدهای انتخاب شده (با فاصله جدا شده).
- **Array:**  
  An array containing strings or objects (for multiple or nested populates).  
  **آرایه‌ای:** آرایه‌ای از رشته‌ها یا اشیاء جهت پر کردن چندگانه یا تو در تو.

---

## Security Configuration / تنظیمات امنیتی

The security configuration enforces:
تنظیمات امنیتی موارد زیر را اجرا می‌کند:
- **Allowed Operators:**  
  e.g., `"eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "regex", "exists", "size", "or", "and"`  
  **اپراتورهای مجاز:** همانند `"eq", "ne", ..."`
- **Forbidden Fields:**  
  Fields such as `"password"` are automatically removed.  
  **فیلدهای ممنوع:** فیلدهایی مانند `password` حذف می‌شوند.
- **Access Levels / سطوح دسترسی:**  
  Role-based settings control maximum limits and allowed population.
  ```javascript
  export const securityConfig = {
    allowedOperators: [
      "eq", "ne", "gt", "gte", "lt", "lte", "in", "nin", "regex", "exists", "size", "or", "and"
    ],
    forbiddenFields: ["password"],
    accessLevels: {
      guest: {
        maxLimit: 50,
        allowedPopulate: ["*"]
      },
      user: {
        maxLimit: 100,
        allowedPopulate: ["*"]
      },
      admin: {
        maxLimit: 1000,
        allowedPopulate: ["*"]
      },
      superAdmin: {
        maxLimit: 1000,
        allowedPopulate: ["*"]
      }
    }
  };
  ```
  These settings are applied internally to protect against NoSQL injection, ensure type conversion, and enforce role-based restrictions.  
  این تنظیمات به‌طور داخلی برای جلوگیری از حملات NoSQL Injection، تبدیل نوع ورودی و اعمال محدودیت‌های مبتنی بر نقش اجرا می‌شوند.

---

## Full Examples / مثال‌های کامل

### Example 1: Basic Query / مثال ۱: کوئری پایه
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

### Example 2: Query with Manual Filters / مثال ۲: کوئری با فیلترهای دستی
```javascript
const query = { status: "active" };
const manualFilter = { category: "electronics" };
const features = new ApiFeatures(Product, query, "user");
const result = await features
  .addManualFilters(manualFilter)
  .filter()
  .execute();

console.log(result);
```

### Example 3: Advanced Nested Populate Using Array Input / مثال ۳: پرکردن تو در تو با ورودی آرایه‌ای
```javascript
const populateArray = [
  "brand",  // Simple string input for populate
  {         // Object input with select projection
    path: "category",
    select: "name description"
  },
  {         // Nested populate: category with its subCategory (if supported)
    path: "category",
    select: "name",
    populate: {
      path: "subCategory",
      select: "title"
    }
  }
];
const features = new ApiFeatures(Product, { populate: "randomField" }, "admin");
const result = await features
  .populate(populateArray)
  .execute();

console.log(result);
```

### Example 4: Full Advanced Query Example / مثال ۴: کوئری پیشرفته کامل
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

## Summary / جمع‌بندی

- **Filtering / فیلترینگ:**  
  Uses `$match` to apply secure, advanced filters derived from query parameters and manual filters.
  **استفاده از `$match` برای اعمال فیلترهای پیشرفته و امن.**

- **Sorting / مرتب‌سازی:**  
  Converts a comma-separated string into a `$sort` object.  
  **تبدیل رشته به شیء `$sort` جهت تعیین ترتیب.**

- **Field Selection / انتخاب فیلد:**  
  Uses `$project` to return only allowed fields while removing forbidden ones.
  **استفاده از `$project` برای بازگرداندن تنها فیلدهای مجاز.**

- **Pagination / صفحه‌بندی:**  
  Applies `$skip` and `$limit` based on query parameters and role-based restrictions.
  **استفاده از `$skip` و `$limit` بر اساس ورودی کاربر و محدودیت‌های نقش.**

- **Populate / پرکردن:**  
  Joins related documents using `$lookup` and `$unwind`. Supports multiple input types (string, object, array) including nested population.
  **اتصال اسناد مرتبط با استفاده از `$lookup` و `$unwind`؛ پشتیبانی از ورودی‌های رشته‌ای، شیئی و آرایه‌ای (شامل پرکردن تو در تو).**

- **Security / امنیت:**  
  Enforces operator restrictions, input sanitization, and role-based access using a dedicated security configuration.
  **اجرای محدودیت‌های اپراتور، پاکسازی ورودی و کنترل دسترسی مبتنی بر نقش از طریق تنظیمات امنیتی اختصاصی.**

This advanced API Features class is designed to be your one-stop solution for integrating powerful and secure query capabilities into any Node.js/MongoDB project.  
این کلاس API Features، راهکار یکپارچه‌ای برای پیاده‌سازی قابلیت‌های پیشرفته و امن در هر پروژه Node.js/MongoDB به شما ارائه می‌دهد.
```