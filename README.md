# ระบบคัดลอกรหัสเข้าสอบ ม.4 CEFR

หน้าเว็บสำหรับนักเรียนโรงเรียนเซนต์เทเรซา ใช้ค้นหา Username / Password สำหรับ Oxford English Testing โดยใช้ Google Sheet `เข้าระบบสอบ` เป็นฐานข้อมูล และ GitHub Pages เป็นหน้าเว็บ

## โครงสร้าง

- `index.html` หน้าเว็บค้นหารหัส
- `styles.css` รูปแบบหน้าเว็บ
- `app.js` การค้นหาและคัดลอก Username / Password
- `Code.gs` Google Apps Script สำหรับอ่านข้อมูลจาก Google Sheet เฉพาะเลขประจำตัวที่ค้นหา
- `.github/workflows/pages.yml` Deploy หน้าเว็บขึ้น GitHub Pages

## 1. ตั้งค่า Google Apps Script

1. เปิด Google Sheet `เข้าระบบสอบ`
2. ไปที่ **ส่วนขยาย (Extensions) → Apps Script**
3. ลบโค้ดเดิมใน `Code.gs` แล้วคัดลอกโค้ดจากไฟล์ `Code.gs` ใน repo นี้ไปวาง
4. กด **Deploy → New deployment**
5. เลือกประเภท **Web app**
6. ตั้งค่า
   - Execute as: **Me**
   - Who has access: **Anyone**
7. กด Deploy และอนุญาตสิทธิ์
8. คัดลอก URL ที่ลงท้ายด้วย `/exec`

## 2. เชื่อมหน้าเว็บกับ Apps Script

เปิดไฟล์ `app.js` แล้วแก้บรรทัดแรกจาก

```js
const API_URL = 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

เป็น URL ที่ได้จาก Google Apps Script เช่น

```js
const API_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec';
```

Commit การแก้ไขลง `main`

## 3. เปิด GitHub Pages

ไปที่ **Settings → Pages** ของ repository แล้วเลือก **Source: GitHub Actions**

จากนั้น workflow `Deploy GitHub Pages` จะเผยแพร่เว็บไซต์อัตโนมัติเมื่อมีการ Push เข้า `main`

URL ของเว็บไซต์จะอยู่ในรูปแบบ

`https://theerawa21.github.io/-.4-CEFR/`

## รูปแบบข้อมูลใน Google Sheet

ชีตฐานข้อมูลชื่อ `ข้อมูลรหัสสอบ` ใช้คอลัมน์ดังนี้

| คอลัมน์ | ข้อมูล |
|---|---|
| A | เลขประจำตัวนักเรียน |
| B | ชื่อ-นามสกุล |
| C | ชั้นเรียน |
| D | ลำดับที่ |
| E | Group |
| F | Username |
| G | Password |
| H | Org ID |
| I | เว็บไซต์เข้าสอบ |

## ความเป็นส่วนตัว

หน้าเว็บไม่โหลดรายชื่อนักเรียนและรหัสสอบทั้งหมดจาก Google Sheet ลงในเบราว์เซอร์ แต่ส่งคำขอค้นหาเฉพาะเลขประจำตัวนักเรียนที่กรอก และล้าง Username / Password ออกจากหน้าจออัตโนมัติหลัง 3 นาที

Google Sheet ควรเก็บสิทธิ์การเข้าถึงไว้เฉพาะผู้ดูแลระบบ ไม่ควร Publish ชีตฐานข้อมูลเป็นสาธารณะ
