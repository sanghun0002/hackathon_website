// ===============================================================
// ===== 라이브러리 및 초기 설정 =====
// ===============================================================
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = '0000';

app.use(cors());
app.use(express.json());

// ===============================================================
// ===== 데이터베이스 연결 및 테이블 생성 =====
// ===============================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const setupDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS notices (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                content TEXT NOT NULL,
                is_sticky BOOLEAN DEFAULT false,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(100),
                rating INTEGER,
                content TEXT,
                password VARCHAR(255) NOT NULL,
                images TEXT[],
                views INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(100) NOT NULL,
                booking_date DATE NOT NULL,
                valley VARCHAR(100),
                section VARCHAR(100),
                deck_name VARCHAR(100),
                capacity INTEGER,
                status VARCHAR(50) DEFAULT '예약 완료',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                completed_at TIMESTAMPTZ
            );
        `);
        console.log('✅ 데이터베이스 테이블이 성공적으로 준비되었습니다.');
    } catch (err) {
        console.error('❌ 데이터베이스 테이블 생성 실패:', err);
    } finally {
        client.release();
    }
};

// ===============================================================
// ===== 이미지 업로드 (Cloudinary) 설정 =====
// ===============================================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'reviews',
        format: async (req, file) => 'jpg',
        public_id: (req, file) => Date.now().toString() + '-' + file.originalname,
        transformation: [{ width: 1024, height: 1024, crop: "limit" }]
    },
});

const upload = multer({ storage: storage });

// ===============================================================
// ===== 공지사항(Notice) API =====
// ===============================================================
app.get('/api/notices', async (req, res) => {
    try {
        const stickyResult = await pool.query('SELECT * FROM notices WHERE is_sticky = true ORDER BY created_at DESC');
        const normalResult = await pool.query('SELECT * FROM notices WHERE is_sticky = false ORDER BY created_at DESC');
        
        res.json({
            notices: normalResult.rows,
            stickyNotices: stickyResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.post('/api/notices', async (req, res) => {
    const { title, department, isSticky, content, password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });
    if (!title || !department || !content) return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });

    try {
        const result = await pool.query(
            'INSERT INTO notices (title, department, is_sticky, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, department, isSticky || false, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/notices/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE notices SET views = views + 1 WHERE id = $1', [id]);
        const result = await pool.query('SELECT * FROM notices WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.put('/api/notices/:id', async (req, res) => {
    const { id } = req.params;
    const { title, department, isSticky, content, password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });

    try {
        const result = await pool.query(
            'UPDATE notices SET title = $1, department = $2, is_sticky = $3, content = $4 WHERE id = $5 RETURNING *',
            [title, department, isSticky, content, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });
    
    try {
        const result = await pool.query('DELETE FROM notices WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ===============================================================
// ===== 후기(Review) API =====
// ===============================================================
app.get('/api/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, author, rating, content, images, views, created_at FROM reviews ORDER BY created_at DESC');
        res.json({ reviews: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.post('/api/reviews', upload.array('images', 5), async (req, res) => {
    const { title, author, rating, content, password } = req.body;
    if (!password) return res.status(400).json({ message: '비밀번호는 필수입니다.' });
    const images = req.files ? req.files.map(file => file.path) : [];

    try {
        const result = await pool.query(
            'INSERT INTO reviews (title, author, rating, content, password, images) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, author, parseInt(rating, 10), content, password, images]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE reviews SET views = views + 1 WHERE id = $1', [id]);
        const result = await pool.query('SELECT id, title, author, rating, content, images, views, created_at FROM reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '후기를 찾을 수 없습니다.' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.put('/api/reviews/:id', upload.array('newImages', 5), async (req, res) => {
    const { id } = req.params;
    const { title, author, rating, content, imagesToDelete, password } = req.body;
    
    try {
        const reviewResult = await pool.query('SELECT password, images FROM reviews WHERE id = $1', [id]);
        if (reviewResult.rows.length === 0) return res.status(404).json({ message: '수정할 후기를 찾을 수 없습니다.' });
        if (reviewResult.rows[0].password !== password) return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });

        let currentImages = reviewResult.rows[0].images || [];
        if (imagesToDelete) {
            const deleteList = JSON.parse(imagesToDelete);
            currentImages = currentImages.filter(url => !deleteList.includes(url));
        }
        if (req.files) {
            const newImageUrls = req.files.map(file => file.path);
            currentImages = [...currentImages, ...newImageUrls];
        }

        const updateResult = await pool.query(
            'UPDATE reviews SET title = $1, author = $2, rating = $3, content = $4, images = $5 WHERE id = $6 RETURNING *',
            [title, author, parseInt(rating), content, currentImages, id]
        );
        res.json(updateResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const result = await pool.query('SELECT password FROM reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '삭제할 후기를 찾을 수 없습니다.' });
        if (result.rows[0].password !== password) return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
        
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.post('/api/reviews/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const result = await pool.query('SELECT password FROM reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '후기를 찾을 수 없습니다.' });
        
        if (result.rows[0].password === password) {
            res.status(200).json({ success: true, message: '인증 성공' });
        } else {
            res.status(403).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ===============================================================
// ===== 예약(Booking) API =====
// ===============================================================
app.post('/api/bookings', async (req, res) => {
    const { name, phone, bookingDate, valley, section, deckName, capacity } = req.body;
    if (!name || !phone || !bookingDate || !valley || !section || !deckName) {
        return res.status(400).json({ message: '필수 예약 정보가 누락되었습니다.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO bookings (name, phone, booking_date, valley, section, deck_name, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, phone, bookingDate, valley, section, deckName, capacity]
        );
        res.status(201).json({ message: '예약이 성공적으로 완료되었습니다.', booking: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM bookings WHERE status != '반납 완료' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/bookings/check', async (req, res) => {
    const { name, phone } = req.query;
    if (!name || !phone) return res.status(400).json({ message: '이름과 전화번호를 모두 입력해주세요.' });
    try {
        const result = await pool.query("SELECT * FROM bookings WHERE name = $1 AND phone = $2 AND status != '반납 완료'", [name, phone]);
        if (result.rows.length > 0) {
            res.json(result.rows);
        } else {
            res.status(404).json({ message: '일치하는 예약 정보를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.delete('/api/bookings/cancel/:id', async (req, res) => {
    const { id } = req.params;
    try {
         const result = await pool.query(
            "UPDATE bookings SET status = '예약 취소' WHERE id = $1", 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: '취소할 예약 정보를 찾을 수 없습니다.' });
        }

        res.status(200).json({ message: '예약이 성공적으로 취소되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/bookings/status', async (req, res) => {
    const { date, section } = req.query;
    if (!date || !section) return res.status(400).json({ message: '날짜와 구역 정보가 필요합니다.' });
    try {
        const result = await pool.query(
            "SELECT deck_name FROM bookings WHERE booking_date = $1 AND section = $2 AND status IN ('예약 완료', '사용 중')",
            [date, section]
        );
        const bookedDecks = result.rows.map(row => row.deck_name);
        res.json(bookedDecks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.post('/api/bookings/verify-on-site', async (req, res) => {
    const { pyeongsangId, name, phone } = req.body;
    const today = new Date().toISOString().split('T')[0];
    try {
        const pyeongsangIdClean = pyeongsangId.replace(/\s|-/g, '');
        const query = `
            UPDATE bookings 
            SET status = '사용 중' 
            WHERE 
                REPLACE(CONCAT(valley, section, deck_name), ' ', '') = $1 AND 
                REPLACE(name, ' ', '') = $2 AND 
                REPLACE(phone, ' ', '') = $3 AND 
                booking_date = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [pyeongsangIdClean, name.replace(/\s|-/g, ''), phone.replace(/\s|-/g, ''), today]);

        if (result.rowCount > 0) {
            res.json({ status: 'success', message: '현장 인증이 정상적으로 처리되었습니다.' });
        } else {
            res.status(404).json({ status: 'failure', message: '예약자 정보가 올바르지 않습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.put('/api/bookings/return/:pyeongsangId', async (req, res) => {
    const { pyeongsangId } = req.params;
    const { name, phone } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const pyeongsangIdClean = pyeongsangId.replace(/\s|-/g, '');
        const query = `
            UPDATE bookings 
            SET status = '반납 완료', completed_at = NOW()
            WHERE
                REPLACE(CONCAT(valley, section, deck_name), ' ', '') = $1 AND 
                REPLACE(name, ' ', '') = $2 AND 
                REPLACE(phone, ' ', '') = $3 AND 
                booking_date = $4
            RETURNING *;
        `;
        const result = await pool.query(query, [pyeongsangIdClean, name.replace(/\s|-/g, ''), phone.replace(/\s|-/g, ''), today]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: '반납 처리가 완료되었습니다.' });
        } else {
            res.status(404).json({ message: '오늘 날짜로 된 일치하는 예약 정보를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

app.get('/api/bookings/completed', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM bookings WHERE status IN ('반납 완료', '예약 취소') ORDER BY COALESCE(completed_at, created_at) DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ===============================================================
// ===== 서버 실행 =====
// ===============================================================
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    setupDatabase();
});
