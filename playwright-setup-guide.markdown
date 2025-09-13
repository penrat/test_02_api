# การเริ่มต้นสร้าง Project Playwright: คู่มือทีละขั้นตอน

Playwright เป็นเฟรมเวิร์กสำหรับการทดสอบเว็บและ API ที่พัฒนาโดย Microsoft ซึ่งรองรับการทดสอบ cross-browser (Chromium, Firefox, WebKit) และ cross-platform ได้ดีมาก โดยเฉพาะสำหรับ end-to-end (E2E) testing แต่ในบริบทนี้จะเน้นการใช้งานสำหรับ API testing ด้วย request context เอกสารนี้จะอธิบายตั้งแต่การเริ่มต้นสร้าง project Playwright ใหม่ จนถึงการเชื่อมโยงกับโค้ดทดสอบ API โดยอ้างอิงจากเอกสารอย่างเป็นทางการของ Playwright (เวอร์ชันล่าสุด ณ วันที่ 9 กันยายน 2025)

## ข้อกำหนดเบื้องต้น

- **Node.js**: ต้องติดตั้ง Node.js รุ่น 20.x, 22.x หรือ 24.x (แนะนำเวอร์ชันล่าสุด) สามารถดาวน์โหลดได้จาก [nodejs.org](https://nodejs.org)
- **ระบบปฏิบัติการ**: Windows 10+ หรือ Server 2016+, WSL, macOS 14 (Ventura)+, Debian 12/13, Ubuntu 22.04/24.04 (รองรับ x86-64 หรือ arm64)
- **เครื่องมืออื่น ๆ**: npm (มาพร้อม Node.js) หรือ yarn/pnpm ถ้าต้องการ

ตรวจสอบเวอร์ชัน Node.js ด้วยคำสั่ง:

```bash
node --version
```

## ขั้นตอนที่ 1: สร้าง Project ใหม่และติดตั้ง Playwright

1. **สร้างโฟลเดอร์ project ใหม่**:
   - เปิด terminal แล้วรัน:

     ```bash
     mkdir my-playwright-project
     cd my-playwright-project
     ```

   - สร้าง package.json ถ้ายังไม่มี:

     ```bash
     npm init -y
     ```

2. **ติดตั้ง Playwright**:
   - รันคำสั่งนี้เพื่อเริ่มต้น project Playwright (จะติดตั้ง `@playwright/test` และสร้างโครงสร้างไฟล์อัตโนมัติ):

     ```bash
     npm init playwright@latest
     ```

   - ตอบคำถามใน interactive prompt:
     - **Language**: เลือก JavaScript (ถ้าต้องการใช้ JS) หรือ TypeScript (ค่าเริ่มต้น)
     - **Test directory**: พิมพ์ `tests` (หรือ `e2e` ถ้าโฟลเดอร์ tests มีอยู่แล้ว)
     - **Add GitHub Actions**: เลือก Yes ถ้าต้องการ CI/CD setup (แนะนำ)
     - **Install browsers**: เลือก Yes เพื่อดาวน์โหลด browser binaries (Chromium, Firefox, WebKit)

   - คำสั่งนี้จะ:
     - ติดตั้ง dependencies: `@playwright/test` (dev dependency)
     - สร้างไฟล์ `playwright.config.ts` (หรือ `.js` ถ้าเลือก JS)
     - สร้างโฟลเดอร์ `tests/` กับไฟล์ตัวอย่าง `example.spec.ts`
     - สร้าง `tests-examples/` สำหรับตัวอย่างเพิ่มเติม

   หาก project มีอยู่แล้ว สามารถรัน `npm init playwright@latest` ซ้ำได้โดยไม่เขียนทับไฟล์ test ที่มี

3. **ติดตั้ง dependencies เพิ่มเติม**:
   - สำหรับ API testing และ validation:
     ```bash
     npm install ajv
     ```

   - สร้างไฟล์ schema:
     - สร้างโฟลเดอร์ `schema/` แล้วสร้าง `user-schema.js` ด้วยเนื้อหา:

       ```javascript
       // schema/user-schema.js
       const userSchema = {
           type: "object",
           properties: {
               data: {
                   type: "object",
                   properties: {
                       id: { type: 'integer' },
                       email: { type: 'string' },
                       first_name: { type: 'string' },
                       last_name: { type: 'string' },
                       avatar: { type: 'string' }
                   },
                   required: ["id", "email", "first_name", "last_name", "avatar"],
               },
               support: {
                   type: "object",
                   properties: {
                       url: { type: 'string' },
                       text: { type: 'string' }
                   },
                   required: ["url", "text"],
               }
           },
           required: ["data", "support"],
       };

       module.exports = { userSchema };
       ```

## ขั้นตอนที่ 2: ตั้งค่าไฟล์ Configuration (playwright.config.js)

หลังติดตั้ง Playwright จะสร้าง `playwright.config.js` (ถ้าเลือก JS) โดยอัตโนมัติ ตัวอย่างเนื้อหาพื้นฐาน:

```javascript
// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* สำหรับ API testing สามารถเพิ่ม project แยกสำหรับ API โดยไม่ใช้ browser */
    {
      name: 'api',
      testMatch: /api-*.spec.js/,  // รันเฉพาะไฟล์ทดสอบ API
      use: {
        baseURL: 'https://reqres.in/api',  // Base URL สำหรับ ReqRes API
      },
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Folder for base state to load and screenshot on failure. */
  snapshotDir: './tests/snapshots',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

- **ปรับแต่งสำหรับ API Testing**: เพิ่ม project `api` เพื่อรันทดสอบ API โดยไม่เปิด browser (ใช้ request context) และตั้ง `baseURL` เป็น API endpoint หลัก เช่น `https://reqres.in/api`
- หากใช้ TypeScript เปลี่ยนเป็น `.ts` และ import แบบ ES modules

## ขั้นตอนที่ 3: เขียนและรันทดสอบครั้งแรก

1. **สร้างไฟล์ทดสอบตัวอย่าง**:
   - ในโฟลเดอร์ `tests/` สร้างไฟล์ `example-api.spec.js`:

     ```javascript
     const { test, expect } = require('@playwright/test');

     test('basic test', async ({ request }) => {
       const response = await request.get('/users/2');  // ใช้ baseURL จาก config
       expect(response.ok()).toBeTruthy();
       const body = await response.json();
       expect(body.data.id).toBe(2);
     });
     ```

   - นี่คือตัวอย่างพื้นฐานสำหรับ API GET จาก ReqRes.in

2. **รันทดสอบ**:
   - รันทั้งหมด:
     ```bash
     npx playwright test
     ```
     - โดยค่าเริ่มต้น: รันแบบ headless (ไม่เปิด browser), parallel ใน browsers ต่าง ๆ
     - สำหรับ API project: จะรันเฉพาะไฟล์ที่ match pattern

   - รันแบบ headed (เปิด browser สำหรับ UI test):
     ```bash
     npx playwright test --headed
     ```

   - รันเฉพาะ project API:
     ```bash
     npx playwright test --project=api
     ```

   - รันไฟล์เดียว:
     ```bash
     npx playwright test tests/example-api.spec.js
     ```

   - เปิด UI Mode สำหรับ debug (watch mode):
     ```bash
     npx playwright test --ui
     ```
     - ใน UI สามารถรัน, debug, ดู trace ได้แบบ real-time

3. **ดูผลลัพธ์**:
   - ผลจะแสดงใน terminal (passed/failed/skipped)
   - สร้างรายงาน HTML:
     ```bash
     npx playwright show-report
     ```
     - เปิดใน browser เพื่อดูกราฟ, trace, screenshots, videos
   - ถ้าทดสอบ fail: Playwright จะบันทึก trace ใน `test-results/traces/` สำหรับ debug ด้วย:
     ```bash
     npx playwright show-trace test-results/traces/...
     ```

## ขั้นตอนที่ 4: เชื่อมโยงกับโค้ดทดสอบ API

โค้ดทดสอบ API (GET, POST, PUT, PATCH, DELETE สำหรับ ReqRes.in) สามารถนำไปใส่ในไฟล์ `tests/api-users.spec.js` ได้:

- ลบ `test.skip()` เพื่อให้รันจริง
- ใช้ `request` จาก fixture (เช่น `async ({ request }) => { ... }`)
- เพิ่ม import `userSchema` และ `Ajv` ตามที่อธิบาย
- ใน config: ตั้ง `baseURL: 'https://reqres.in/api'` เพื่อให้ URL สั้นลง
- สำหรับ headers เช่น `x-api-key`: เพิ่มใน request options (แต่ ReqRes.in ไม่จำเป็น)

**ตัวอย่างปรับโค้ด GET**:

```javascript
const { test, expect } = require('@playwright/test');
const { userSchema } = require('../schema/user-schema');
const Ajv = require('ajv');
const ajv = new Ajv();

test('Found single user', async ({ request }) => {
  const response = await request.get('/users/2');
  expect(response.status()).toBe(200);

  const headers = response.headers();
  expect(headers['content-type']).toContain('application/json');
  expect(headers.server).toBe('cloudflare');

  const body = await response.json();
  const validate = ajv.compile(userSchema);
  const valid = validate(body);
  expect(valid).toBe(true);
});
```

## ขั้นตอนที่ 5: การ Debug และ Best Practices

- **Debug**: ใช้ `console.log()` หรือ `await response.text()` เพื่อ log response ถ้า fail ใช้ trace viewer
- **Environment Variables**: ใช้ `.env` สำหรับ secrets (เช่น API keys) แล้วอ่านด้วย `process.env`
- **CI/CD**: GitHub Actions workflow ถูกสร้างอัตโนมัติ รัน `npx playwright install --with-deps` ใน CI
- **อัปเดต Playwright**:
  ```bash
  npm install -D @playwright/test@latest
  npx playwright install --with-deps
  ```
  ตรวจเวอร์ชัน: `npx playwright --version`
- **เพิ่มเติมสำหรับ API Testing**:
  - Playwright รองรับ mock API, authentication, storage state
  - สำหรับ validation ใช้ `Ajv` หรือ libraries อื่น ๆ เช่น Joi

## สรุป

การเริ่มต้น Playwright ง่ายและรวดเร็วด้วย `npm init playwright@latest` ซึ่งสร้างทุกอย่างให้พร้อมรัน จากนั้นปรับ config และเพิ่มโค้ดทดสอบ API เข้าไป หากเจอปัญหา เช่น browser ไม่ดาวน์โหลด ให้รัน `npx playwright install` ดูเอกสารเพิ่มเติมที่ [playwright.dev/docs/api-testing](https://playwright.dev/docs/api-testing) สำหรับ API-specific features ถ้าต้องการ VS Code integration ติดตั้ง extension "Playwright Test for VSCode" เพื่อ autocomplete และ debug