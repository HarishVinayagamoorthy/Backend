// const express = require('express');
// const cors = require('cors');
// const mysql = require('mysql');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "crud"
// });

// // GET request for fetching all students
// app.get("/", (req, res) => {
//     const sql = "SELECT * FROM student";
//     db.query(sql, (err, data) => {
//         if (err) return res.json("Error");
//         return res.json(data);
//     });
// });

// // POST request for creating a student
// app.post('/create', (req, res) => {
//     const sql = "INSERT INTO student (`Name`,`Email`) VALUES (?)";
//     const values = [
//         req.body.name,
//         req.body.email
//     ];
//     db.query(sql, [values], (err, data) => {
//         if (err) return res.json("Error");
//         return res.json(data);
//     });
// });

// // PUT request for updating a student
// app.put('/update/:id', (req, res) => {
//     const sql = "UPDATE student SET `Name` = ?, `Email` = ? WHERE id = ?";
//     const values = [
//         req.body.name,
//         req.body.email
//     ];
//     db.query(sql, [...values, req.params.id], (err, data) => {
//         if (err) return res.json("Error");
//         return res.json(data);
//     });
// });




// app.delete('/student/:id', (req, res) => {
//     const sql = "DELETE  FROM student  WHERE ID = ?";
//  const id = req.params.id
//     db.query(sql,[id] , (err, data) => {
//         if (err) return res.json("Error");
//         return res.json(data);
//     });
// });

// app.listen(8081, () => {
//     console.log('listening on port 8081');
// });








const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage engine for image uploads
const storage = multer.diskStorage({
    destination: './uploads/', // Folder where images will be stored
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// Initialize multer for single file upload (image field)
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
}).single('image'); // Handle file with 'image' as field name

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "crud"
});

// GET request for fetching all students
app.get("/", (req, res) => {
    const sql = "SELECT * FROM student";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error");
        return res.json(data);
    });
});

// POST request for creating a student with image and date of birth
app.post('/create', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error uploading image" });
        }

        const sql = "INSERT INTO student (`Name`, `Email`, `ImagePath`, `DateOfBirth`) VALUES (?, ?, ?, ?)";
        const values = [
            req.body.name,
            req.body.email,
            req.file ? `/uploads/${req.file.filename}` : null, // Image path
            req.body.dateOfBirth // Date of birth from frontend
        ];

        db.query(sql, values, (err, data) => {
            if (err) return res.status(500).json("Error inserting student");
            return res.json(data);
        });
    });
});

// PUT request for updating a student with image and date of birth
app.put('/update/:id', (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).json({ message: "Error uploading image" });

        const sql = "UPDATE student SET `Name` = ?, `Email` = ?, `ImagePath` = ?, `DateOfBirth` = ? WHERE ID = ?";
        const values = [
            req.body.name,
            req.body.email,
            req.file ? `/uploads/${req.file.filename}` : req.body.existingImagePath, // Keep old image if not uploaded
            req.body.dateOfBirth,
            req.params.id
        ];

        db.query(sql, values, (err, data) => {
            if (err) return res.status(500).json("Error updating student");
            return res.json(data);
        });
    });
});

// DELETE request for deleting a student
app.delete('/student/:id', (req, res) => {
    const sql = "DELETE FROM student WHERE ID = ?";
    const id = req.params.id;
    db.query(sql, [id], (err, data) => {
        if (err) return res.json("Error");
        return res.json(data);
    });
});

app.listen(8081, () => {
    console.log('listening on port 8081');
});
