require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 1433;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // For Azure, false for local dev usually depending on setup
        trustServerCertificate: true // Important for local dev
    }
};

// Connect to DB Utility
async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

// Routes
// 1. User Registration
app.post('/api/register', async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    try {
        const pool = await connectDB();

        // Check if user or email already exists
        const checkUser = await pool.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE Username = @username OR Email = @email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Usuário ou e-mail já cadastrado' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Name, Username, Email, PasswordHash) 
                VALUES (@name, @username, @email, @password)
            `);

        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }

    try {
        const pool = await connectDB();

        // Find user
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        const user = result.recordset[0];

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha incorreta' });
        }

        // Success - typically you would sign a JWT here
        res.json({
            message: 'Login realizado com sucesso',
            user: {
                id: user.Id,
                name: user.Name,
                username: user.Username,
                email: user.Email
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Fallback to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
