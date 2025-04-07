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
  const menus = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const sanitizedRow = Object.keys(row).reduce((acc, key) => {
        const cleanKey = key.replace(/^['"]+|['"]+$/g, '');  
        acc[cleanKey] = row[key];
        return acc;
      }, {});

      let menuID = sanitizedRow.Menu_ID ? sanitizedRow.Menu_ID : `M${String(menuCounter).padStart(3, '0')}`;
      
      
      if (!sanitizedRow.Menu_ID) {
        menuCounter++; 
      }

      
      if (!menuID) {
        console.error('❌ Missing Menu_ID in row:', sanitizedRow);
        return;
      }

      
      menus.push([
        menuID, 
        sanitizedRow.Menu_name,
        sanitizedRow.Menu_ingredient,
        sanitizedRow.Ingredient_split,
        sanitizedRow.Menu_process,
        sanitizedRow.Menu_TYPEID
      ]);
    })
    .on('end', () => {
      if (menus.length === 0) {
        console.error('❌ No valid data to insert.');
        return res.status(400).send('No valid data to insert.');
      }

      const query = 
        'INSERT INTO menus (' +
        'Menu_ID, Menu_name, Menu_ingredient,' +
        'Ingredient_split, Menu_process, Menu_TYPEID, ' +
        ') VALUES ?'; 

      db.query(query, [menus], (err, result) => {
        if (err) {
          console.error('❌ Insert Error:', err);
          return res.status(500).send('Error inserting data');
        }
        res.send(`✅ Imported ${result.affectedRows} rows successfully`);
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
        console.log(result);
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
