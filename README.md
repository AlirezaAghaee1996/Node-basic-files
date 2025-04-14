
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
- [Input Types & Supported Operators / انواع ورودی و اپراتورهای پشتیبانی‌شده](#input-types--supported-operators--انواع-ورودی-و-اپراتورهای-پشتیبانی‌شده)
- [Additional Conditions / شرایط اضافی](#additional-conditions--شرایط-اضافی)
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


## Overview / معرفی

The **ApiFeatures** class processes incoming query parameters and builds an aggregation pipeline step by step. It supports advanced filtering, sorting, field selection, pagination, and population of related documents. It also enforces conditions—such as automatically applying an `isActive: true` filter if the schema supports it (and the user is not an admin), using default pagination values (page 1 and limit 10 if not provided), and more.  
کلاس **ApiFeatures** پارامترهای ورودی را پردازش کرده و به‌صورت مرحله‌ای Pipeline Aggregation را می‌سازد. این کلاس از فیلترینگ پیشرفته، مرتب‌سازی، انتخاب فیلد، صفحه‌بندی و پرکردن اسناد مرتبط پشتیبانی می‌کند. همچنین شرایطی مانند اعمال خودکار شرط `isActive: true` در صورت وجود آن (و نبود نقش admin)، استفاده از مقادیر پیش‌فرض صفحه (صفحه ۱ و محدودیت ۱۰ در صورت عدم ارسال) و سایر شرایط را اجرا می‌کند.

---

## API Features Class Methods / متدهای کلاس API Features

### filter() / فیلتر
- **Description / توضیح:**  
  Parses the query parameters, merges them with any manually added filters, and applies security filters. Notably, if the model schema includes an `isActive` field and the current user role is not "admin," it adds a condition to return only active documents.  
  این متد پارامترهای کوئری را تجزیه کرده، فیلترهای دستی را ترکیب می‌کند و سپس فیلترهای امنیتی را اعمال می‌کند. نکته مهم اینکه اگر اسکیما دارای فیلد `isActive` باشد و نقش کاربری "admin" نباشد، شرط `isActive: true` به کوئری اضافه می‌شود.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?status=active&price[gte]=100
  const features = new ApiFeatures(Product, req.query);
  features.filter();
  // Pipeline adds: { $match: { status: "active", price: { $gte: 100 }, isActive: true } }
  ```

---

### sort() / مرتب‌سازی
- **Description / توضیح:**  
  Converts a comma-separated list of sorting fields into a `$sort` object. A preceding "-" indicates descending order.  
  رشته‌ای از فیلدهای مرتب‌سازی را به شیء `$sort` تبدیل می‌کند. اگر فیلد با "-" شروع شود، ترتیب نزولی در نظر گرفته می‌شود.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?sort=-price,createdAt
  const features = new ApiFeatures(Product, req.query);
  features.sort();
  // Pipeline adds: { $sort: { price: -1, createdAt: 1 } }
  ```

---

### limitFields() / انتخاب فیلدها
- **Description / توضیح:**  
  Uses `$project` to include only the fields specified in the query while automatically removing forbidden fields (e.g., "password").  
  از `$project` برای نمایش تنها فیلدهای انتخاب‌شده استفاده می‌کند و فیلدهای ممنوعی مانند `password` را حذف می‌کند.

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
  Applies pagination by determining the page number and limit. If the `page` or `limit` parameters are not provided, defaults to page 1 and limit 10. The maximum limit is determined by the user's access level from the security configuration.  
  با تعیین شماره صفحه و تعداد آیتم‌ها، صفحه‌بندی را اعمال می‌کند. در صورت عدم ارسال `page` یا `limit`، به طور پیش‌فرض صفحه ۱ و محدودیت ۱۰ آیتم اعمال می‌شود. محدودیت حداکثر بر اساس سطح دسترسی کاربر تعیین می‌شود.

- **Usage Example / مثال استفاده:**
  ```javascript
  // URL: /api/products?page=2&limit=20
  const features = new ApiFeatures(Product, req.query, "user");
  features.paginate();
  // Pipeline adds: { $skip: 20 } and { $limit: 20 } (or adjusted by user role)
  ```

---

### populate() / پرکردن (Populate)
- **Description / توضیح:**  
  Joins related documents using MongoDB’s `$lookup` and `$unwind` operators. Supports various input types:
  - **String Input:** A comma-separated string of field names.
  - **Object Input:** An object with `path` (mandatory) and `select` (optional) properties.
  - **Array Input:** An array containing strings or objects for multiple or nested populate operations.
  
  از `$lookup` و `$unwind` برای اتصال اسناد مرتبط استفاده می‌کند. ورودی‌های پشتیبانی شده شامل:
  - **ورودی رشته‌ای:** رشته‌ای جداشده با کاما از نام فیلدها.
  - **ورودی شیئی:** شیئی با کلیدهای `path` (الزامی) و `select` (اختیاری).
  - **ورودی آرایه‌ای:** آرایه‌ای از رشته‌ها یا اشیاء جهت پرکردن چندگانه یا تو در تو.

- **Usage Examples / مثال‌های استفاده:**

  **Simple String Input / ورودی رشته‌ای:**
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
  // Joins the "category" collection and returns only "name" and "description"
  ```

  **Array Input / ورودی آرایه‌ای:**
  ```javascript
  const populateArray = [
    "brand",  // Simple string
    {         // Object with select projection
      path: "category",
      select: "name description"
    },
    {         // Nested populate: "category" with nested "subCategory"
      path: "category",
      select: "name",
      populate: {
        path: "subCategory",
        select: "title"
      }
    }
  ];
  const features = new ApiFeatures(Product, req.query, "admin");
  features.populate(populateArray);
  // Pipeline processes each populate option accordingly.
  ```

---

### addManualFilters() / فیلترهای دستی
- **Description / توضیح:**  
  Merges additional filters provided manually with filters parsed from the query parameters. **Note:** If using this method, it is recommended to call `addManualFilters()` **before** calling `filter()` so that manual filters are included in the processed query.  
  فیلترهای اضافی دستی را با فیلترهای استخراج‌شده از کوئری ترکیب می‌کند. **توجه:** در صورتی که از این متد استفاده می‌کنید، توصیه می‌شود که `addManualFilters()` قبل از فراخوانی `filter()` صدا زده شود تا فیلترهای دستی در کوئری اعمال شوند.

- **Usage Example / مثال استفاده:**
  ```javascript
  const manualFilter = { category: "electronics" };
  const features = new ApiFeatures(Product, { status: "active" });
  features.addManualFilters(manualFilter).filter();
  // Combines "active" status with manual filter for electronics.
  ```

---

### execute() / اجرا
- **Description / توضیح:**  
  Executes the aggregation pipeline built by previous methods using Mongoose's aggregation features. It concurrently runs both a count pipeline and a data pipeline and returns the total count along with the result data.  
  Pipeline ساخته‌شده را با استفاده از aggregation mongoose اجرا کرده و همزمان pipeline‌های شمارش و داده را اجرا می‌کند؛ سپس تعداد کل و داده‌های خروجی را برمی‌گرداند.

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

## Input Types & Supported Operators / انواع ورودی و اپراتورهای پشتیبانی‌شده

### Filtering Operators / اپراتورهای فیلترینگ
The class transforms query parameters into MongoDB operators as follows:  
این کلاس پارامترهای ورودی را به اپراتورهای MongoDB تبدیل می‌کند:

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
- **Sorting:** Uses `$sort` to order results.  
  **مرتب‌سازی:** استفاده از `$sort` برای ترتیب نتایج.
- **Projection:** Uses `$project` to include only allowed fields.  
  **انتخاب فیلد:** استفاده از `$project` برای بازگرداندن فقط فیلدهای مجاز.
- **Pagination:** Uses `$skip` and `$limit`; defaults to page 1 and limit 10 if not provided.  
  **صفحه‌بندی:** استفاده از `$skip` و `$limit`؛ در صورت عدم ارسال پارامتر، صفحه ۱ و محدودیت ۱۰ به‌طور پیش‌فرض اعمال می‌شود.

### Populate Input Variations / انواع ورودی برای Populate
- **String:** A comma-separated list (e.g., `"category,brand"`).  
  **رشته‌ای:** لیستی از نام فیلدها که با کاما جدا شده‌اند.
- **Object:** An object with keys `path` (required) and `select` (optional).  
  **شیئی:** شیئی با کلید `path` (الزامی) و `select` (اختیاری).
- **Array:** An array containing strings or objects for multiple or nested populate setups.  
  **آرایه‌ای:** آرایه‌ای از رشته‌ها یا اشیاء برای پیکربندی پرکردن چندگانه یا تو در تو.

---

## Additional Conditions / شرایط اضافی

- **isActive Condition:**  
  If the model schema includes an `isActive` field and the current user role is not "admin," the `filter()` method automatically adds `isActive: true` to the query.  
  **شرط isActive:** اگر در اسکیما فیلد `isActive` وجود داشته باشد و نقش کاربری "admin" نباشد، متد `filter()` به‌طور خودکار شرط `isActive: true` را به کوئری اضافه می‌کند.

- **Default Pagination:**  
  If `page` or `limit` are not specified in the query, defaults are applied—page 1 and limit 10 items. These defaults can be overridden based on the user's role settings in the security configuration.  
  **صفحه‌بندی پیش‌فرض:** در صورت عدم ارسال مقادیر `page` یا `limit`، به طور پیش‌فرض صفحه ۱ و تعداد ۱۰ آیتم اعمال می‌شود. این مقدار پیش‌فرض بر اساس تنظیمات سطوح دسترسی قابل تغییر است.

- **Numeric Validation:**  
  The constructor ensures that `page` and `limit` (and similar numeric fields) contain only numeric values.  
  **اعتبارسنجی عددی:** سازنده اطمینان حاصل می‌کند که مقادیر `page` و `limit` تنها شامل اعداد باشند.

- **Removal of Dangerous Operators:**  
  The `#initialSanitization()` method removes operators such as `$where`, `$accumulator`, and `$function` from queries to prevent injection attacks.  
  **حذف اپراتورهای خطرناک:** متد `#initialSanitization()` اپراتورهایی مانند `$where`، `$accumulator` و `$function` را از ورودی حذف می‌کند تا از حملات تزریقی جلوگیری شود.

- **Ordering of Manual Filters:**  
  When using manual filters via `addManualFilters()`, it is recommended that this method be called before calling `filter()` so that the manual filters are included properly in the query.  
  **ترتیب استفاده از فیلترهای دستی:** در صورت استفاده از `addManualFilters()`، توصیه می‌شود این متد قبل از فراخوانی `filter()` صدا زده شود تا فیلترهای دستی به درستی در کوئری وارد شوند.

---

## Security Configuration / تنظیمات امنیتی

The security configuration enforces restrictions on operators, forbidden fields, and role-based limits.  
تنظیمات امنیتی محدودیت‌های اپراتور، حذف فیلدهای ممنوع و محدودیت‌های مبتنی بر نقش را اعمال می‌کند.

```javascript
export const securityConfig = {
  allowedOperators: [
    "eq", "ne", "gt", "gte",
    "lt", "lte", "in", "nin",
    "regex", "exists", "size", "or", "and"
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

These settings are automatically used in methods like `filter()`, `paginate()`, and `limitFields()` to protect queries.  
این تنظیمات به طور خودکار در متدهایی مانند `filter()`، `paginate()` و `limitFields()` برای حفاظت از کوئری‌ها استفاده می‌شوند.

---

## Full Examples / مثال‌های کامل

### Example 1: Basic Query  
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

### Example 2: Query with Manual Filters (Call addManualFilters Before filter)  
```javascript
const query = { status: "active" };
const manualFilter = { category: "electronics" };
const features = new ApiFeatures(Product, query, "user");
features.addManualFilters(manualFilter).filter();
const result = await features.execute();
console.log(result);
```

### Example 3: Advanced Nested Populate with Array Input  
```javascript
const populateArray = [
  "brand",  // Simple string input
  {         // Object input with projection
    path: "category",
    select: "name description"
  },
  {         // Nested populate: populate "category" and then its "subCategory"
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

### Example 4: Full Advanced Query Example  
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
  Uses `$match` to combine query filters, manual filters, and the security condition `isActive: true` (if applicable).  
  **اعمال `$match` برای ترکیب فیلترهای کوئری، فیلترهای دستی و شرط isActive (در صورت وجود).**

- **Sorting / مرتب‌سازی:**  
  Parses a comma-separated string into a `$sort` object.  
  **تبدیل رشته ورودی به شیء `$sort` جهت مرتب‌سازی.**

- **Field Selection / انتخاب فیلد:**  
  Uses `$project` to return only permitted fields while removing forbidden ones.  
  **استفاده از `$project` برای بازگرداندن تنها فیلدهای مجاز.**

- **Pagination / صفحه‌بندی:**  
  Applies `$skip` and `$limit`, defaulting to page 1 and limit 10 if not provided, with role-based restrictions.  
  **استفاده از `$skip` و `$limit`؛ در صورت عدم ارسال پارامتر، صفحه ۱ و محدودیت ۱۰ به طور پیش‌فرض اعمال می‌شود.**

- **Populate / پرکردن:**  
  Joins related documents using `$lookup` and `$unwind`. Supports string, object, and array inputs (including nested population).  
  **استفاده از `$lookup` و `$unwind` برای اتصال اسناد مرتبط؛ پشتیبانی از ورودی‌های رشته‌ای، شیئی و آرایه‌ای شامل پرکردن تو در تو.**

- **Security / امنیت:**  
  Enforces allowed operators, input sanitization, numeric validation, forbidden field removal, and role-based access rules via `securityConfig`.  
  **اجرای اپراتورهای مجاز، پاکسازی ورودی، اعتبارسنجی عددی، حذف فیلدهای ممنوع و قوانین دسترسی مبتنی بر نقش از طریق securityConfig.**

- **Ordering Manual Filters / ترتیب استفاده از فیلترهای دستی:**  
  When using manual filters, call `addManualFilters()` before `filter()` to ensure they are properly included in the query.  
  **در صورت استفاده از فیلترهای دستی، ابتدا `addManualFilters()` را فراخوانی کرده و سپس `filter()` را اجرا کنید.**

This class is designed as a one-stop solution for integrating powerful and secure query functionalities into any Node.js/MongoDB project.  
این کلاس به عنوان یک راهکار یکپارچه برای پیاده‌سازی قابلیت‌های قدرتمند و امن در هر پروژه Node.js/MongoDB به کار می‌رود.
```