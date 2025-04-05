import express from 'express';
import multer from 'multer';
import mysql from 'mysql2';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// สำหรับให้ __dirname ใช้ได้ใน ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = 4000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});
// Connect MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // แก้ไขตามรหัสผ่านของคุณ
  database: 'csv_import_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// Multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


let menuCounter = 1;  // ตัวนับเริ่มต้นที่ 1

app.post('/upload-csv', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const menus = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // ลบ single quotes หรือ double quotes รอบๆ ชื่อฟิลด์
      const sanitizedRow = Object.keys(row).reduce((acc, key) => {
        const cleanKey = key.replace(/^['"]+|['"]+$/g, '');  // ลบ single quotes หรือ double quotes รอบๆ key
        acc[cleanKey] = row[key];
        return acc;
      }, {});

      // สร้าง Menu_ID ใหม่ ถ้าไม่มีใน row
      let menuID = sanitizedRow.Menu_ID ? sanitizedRow.Menu_ID : `M${String(menuCounter).padStart(3, '0')}`;
      
      // ถ้าใช้ตัวนับในกรณีไม่มี Menu_ID จาก CSV
      if (!sanitizedRow.Menu_ID) {
        menuCounter++;  // เพิ่มตัวนับขึ้นทุกครั้ง
      }

      // ตรวจสอบว่า Menu_ID มีค่าไหม ถ้าไม่มีให้แสดง error
      if (!menuID) {
        console.error('❌ Missing Menu_ID in row:', sanitizedRow);
        return;
      }

      // เพิ่มข้อมูลเข้า menus array
      menus.push([
        menuID, // ใช้ Menu_ID ใหม่หรือตามค่าเดิมจาก CSV
        sanitizedRow.Menu_name,
        sanitizedRow.Menu_ingredient,
        sanitizedRow.Ingredient_split,
        sanitizedRow.Menu_process,
        sanitizedRow.Menu_TYPEID
      ]);
    })
    .on('end', () => {
      // ตรวจสอบว่ามีข้อมูลใน menus หรือไม่
      if (menus.length === 0) {
        console.error('❌ No valid data to insert.');
        return res.status(400).send('No valid data to insert.');
      }

      const query = 
        'INSERT INTO menus (' +
        'Menu_ID, Menu_name, Menu_ingredient,' +
        'Ingredient_split, Menu_process, Menu_TYPEID, ' +
        ') VALUES ?'; // ชื่อฟิลด์ไม่ต้องใส่ single quotes

      db.query(query, [menus], (err, result) => {
        if (err) {
          console.error('❌ Insert Error:', err);
          return res.status(500).send('Error inserting data');
        }
        res.send(`✅ Imported ${result.affectedRows} rows successfully`);
      });
    });
});


// Get users API
app.get('/users', (req, res) => {
  db.query('SELECT * FROM menus', (err, results) => {
    if (err) {
      console.error('❌ Fetch Error:', err);
      return res.status(500).send('Error fetching data');
    }
    const menuNames = results.map(row => row.Menu_name);

    res.json(results);
  });
});

app.get('/menus', (req, res) => {
    db.query('SELECT * FROM menus', (err, results) => {
      if (err) {
        console.error('❌ Fetch Error:', err);
        return res.status(500).send('Error fetching data');
      }
      res.json(results);
    });
  });

app.get('/menu/:id', (req, res) => {
    const menuId = req.params.id;
    console.log(menuId);
    db.query('SELECT * FROM menus WHERE Menu_ID = ?', [menuId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send('Not found');
      }
      res.json(results[0]);
    });
  });
  



app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
