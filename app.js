// Used AI for all bcrypt portions
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'videogameshop'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

// Display all games
app.get('/games', (req, res) => {
    const sql = 'SELECT * FROM games';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json(results);
    });
});

// User registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.status(201).send('User registered');
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(400).send('User not found');

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send('Invalid password');

        res.status(200).send('Login successful');
    });
});

// Purchase game
app.post('/purchase', (req, res) => {
    const { user_id, game_id } = req.body;

    const sql = 'INSERT INTO orders (user_id, game_id) VALUES (?, ?)';
    db.query(sql, [user_id, game_id], (err, result) => {
        if (err) return res.status(500).send('Server error');
        res.status(201).send('Purchase successful');
    });
});