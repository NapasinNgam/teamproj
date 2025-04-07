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
  password: 'root', 
  database: 'csv_import_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


let menuCounter = 1;  

app.post('/upload-csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const updates = []; // ✅ ต้องประกาศตรงนี้ก่อนใช้งาน
  
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const sanitizedRow = {};
        for (let rawKey in row) {
          const cleanKey = rawKey.replace(/^['"]+|['"]+$/g, '').trim();
          sanitizedRow[cleanKey] = row[rawKey];
        }
  
        // ✅ เก็บคู่ [img_link, Menu_ID] ถ้ามีทั้งสองค่า
        if (sanitizedRow.Menu_ID && sanitizedRow.img_link) {
          updates.push([sanitizedRow.img_link, sanitizedRow.Menu_ID]);
        }
      })
      .on('end', () => {
        if (updates.length === 0) {
          return res.status(400).send('No valid data to update.');
        }
  
        // ✅ อัปเดตทีละแถว
        let updateCount = 0;
        let errorCount = 0;
  
        updates.forEach(([img_link, Menu_ID]) => {
          const query = 'UPDATE menus SET img_link = ? WHERE Menu_ID = ?';
          db.query(query, [img_link, Menu_ID], (err, result) => {
            if (err) {
              console.error(`❌ Failed to update Menu_ID ${Menu_ID}:`, err);
              errorCount++;
            } else {
              updateCount += result.affectedRows;
            }
  
            // ✅ ส่ง response หลังทำครบทุกอัน
            if (updateCount + errorCount === updates.length) {
              res.send(`✅ Updated ${updateCount} rows, ❌ Failed: ${errorCount}`);
            }
          });
        });
      });
  });
  




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
    db.query('SELECT * FROM menus WHERE Menu_ID = ?', [menuId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send('Not found');
      }
      res.json(results[0]);
    });
  });

app.get('/addbookmark/:id', (req, res) => {
    const menuId = req.params.id;
    console.log("Get ID",menuId);

    db.query('SELECT * FROM bookmark WHERE Menu_ID = ?', [menuId], (err, result) => {
        if (err) {
            return res.status(500).send('Check error');
        } else if (result.length === 0) {
            db.query('INSERT INTO bookmark (Menu_ID) VALUES (?)', [menuId], (err) => {
                if (err) {
                    return res.status(500).send('Insert Error');
                }
                res.json("Insert Success");
            });
        } else {
            res.json("Already bookmarked");
        }
    });
});

app.get('/showbookmark', (req, res) => {
    db.query('SELECT * FROM bookmark, menus WHERE bookmark.Menu_ID = menus.Menu_ID', (err, result) => {
        if (err) {
            return res.status(500).send('Error');
        }
        res.json(result);
    });
});

app.get('/deletebookmark/:id', (req, res) => {
    const menuId = req.params.id;
    db.query('DELETE FROM bookmark WHERE Menu_ID = ?', [menuId] , (err, result) => {
        if (err) {
            return res.status(500).send('Error');
        } else {
            res.json("Delete Success");
        }
    });
});




app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
