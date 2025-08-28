// ===============================================================
// ===== 라이브러리 및 초기 설정 =====
// ===============================================================
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Pool } = require('pg'); // [DB 추가] PostgreSQL 라이브러리
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = '0000';

app.use(cors());
app.use(express.json());

// ===============================================================
// ===== 데이터베이스 연결 설정 =====
// ===============================================================
// [DB 변경] 데이터베이스 연결 풀(Pool) 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render 환경 변수에 설정된 DB 주소
  ssl: {
    rejectUnauthorized: false
  }
});

// [DB 추가] 서버 시작 시 데이터베이스 테이블 자동 생성 함수
const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    // 공지사항 테이블
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
    // 후기 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100),
        rating INTEGER,
        content TEXT,
        password VARCHAR(100) NOT NULL,
        images TEXT[], -- 이미지 URL 배열
        views INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // 예약 테이블
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
        status VARCHAR(50) DEFAULT '예약 완료', -- '예약 완료', '사용 중', '반납 완료'
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


// Cloudinary 설정 (변경 없음)
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
// ===== 공지사항(Notice) API (DB 연동) =====
// ===============================================================

// GET: 모든 공지사항 조회
app.get('/api/notices', async (req, res) => {
    try {
        const stickyResult = await pool.query('SELECT * FROM notices WHERE is_sticky = true ORDER BY id DESC');
        const normalResult = await pool.query('SELECT * FROM notices WHERE is_sticky = false ORDER BY id DESC');
        
        // 페이지네이션 로직은 프론트엔드에서 처리하거나, 여기서 SQL LIMIT, OFFSET으로 구현할 수 있습니다.
        // 여기서는 단순화하여 전체 목록을 보냅니다.
        res.json({
            notices: normalResult.rows,
            stickyNotices: stickyResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// POST: 새 공지사항 작성
app.post('/api/notices', async (req, res) => {
    const { title, department, isSticky, content, password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO notices (title, department, is_sticky, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, department, isSticky || false, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// GET: 특정 공지사항 조회 및 조회수 증가
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
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// PUT: 특정 공지사항 수정
app.put('/api/notices/:id', async (req, res) => {
    const { id } = req.params;
    const { title, department, isSticky, content, password } = req.body;
     if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });
    }
    try {
        const result = await pool.query(
            'UPDATE notices SET title = $1, department = $2, is_sticky = $3, content = $4 WHERE id = $5 RETURNING *',
            [title, department, isSticky, content, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// DELETE: 특정 공지사항 삭제
app.delete('/api/notices/:id', async (req, res) => {
     const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ message: '비밀번호가 올바르지 않습니다.' });
    }
    try {
        await pool.query('DELETE FROM notices WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ===============================================================
// ===== 후기(Review) API (DB 연동) =====
// ===============================================================

// GET: 모든 후기 조회
app.get('/api/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, author, rating, content, images, views, created_at FROM reviews ORDER BY id DESC');
        res.json({ reviews: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// POST: 새 후기 작성
app.post('/api/reviews', upload.array('images', 5), async (req, res) => {
    const { title, author, rating, content, password } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];
    try {
        const result = await pool.query(
            'INSERT INTO reviews (title, author, rating, content, password, images) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, author, parseInt(rating, 10), content, password, images]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// DELETE: 특정 후기 삭제
app.delete('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    try {
        const result = await pool.query('SELECT password FROM reviews WHERE id = $1', [id]);
        if (result.rows.length === 0) {
             return res.status(404).json({ message: '삭제할 후기를 찾을 수 없습니다.' });
        }
        if (result.rows[0].password !== password) {
             return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
        }
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ===============================================================
// ===== 예약(Booking) API (DB 연동) =====
// ===============================================================

// POST: 새 예약 생성
app.post('/api/bookings', async (req, res) => {
    const { name, phone, bookingDate, valley, section, deckName, capacity, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO bookings (name, phone, booking_date, valley, section, deck_name, capacity, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, phone, bookingDate, valley, section, deckName, capacity, status || '예약 완료']
        );
        res.status(201).json({ message: '예약이 성공적으로 완료되었습니다.', booking: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// GET: 모든 '활성' 예약 목록 조회 (관리자용)
app.get('/api/bookings', async (req, res) => {
    try {
        // [DB 변경] '반납 완료'가 아닌 예약만 조회
        const result = await pool.query("SELECT * FROM bookings WHERE status != '반납 완료' ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// GET: 모든 '완료된' 예약 목록 조회
app.get('/api/bookings/completed', async (req, res) => {
    try {
        // [DB 변경] '반납 완료' 상태인 예약만 조회
        const result = await pool.query("SELECT * FROM bookings WHERE status = '반납 완료' ORDER BY completed_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// DELETE: 예약 취소 (ID로)
app.delete('/api/bookings/cancel/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // [DB 변경] 삭제 전 '사용 중' 상태가 아닌지 확인
        const bookingCheck = await pool.query("SELECT status FROM bookings WHERE id = $1", [id]);
        if(bookingCheck.rows.length === 0) {
            return res.status(404).json({ message: '취소할 예약 정보를 찾을 수 없습니다.' });
        }
        if(bookingCheck.rows[0].status === '사용 중') {
            return res.status(400).json({ message: '이미 사용 중인 예약은 취소할 수 없습니다.' });
        }
        await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
        res.status(200).json({ message: '예약이 성공적으로 취소되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// [DB 변경] DELETE: 예약 반납 처리 -> UPDATE로 로직 변경
app.delete('/api/bookings/:pyeongsangId', async (req, res) => {
    // 이 로직은 이제 QR 인증 후 '반납'을 처리하는 로직으로 변경됩니다.
    // 기존 pyeongsangId 식별 방식 대신, 실제 예약 ID를 사용하는 것이 더 안정적입니다.
    // 프론트엔드에서 예약 ID를 넘겨주는 방식으로 수정이 필요할 수 있습니다.
    // 여기서는 기존 로직을 최대한 유지하여 ID로 반납 처리합니다.
    const { id } = req.body; // body에서 예약 id를 받는다고 가정

    try {
        const result = await pool.query(
            "UPDATE bookings SET status = '반납 완료', completed_at = NOW() WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: '반납할 예약 정보를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '반납 처리가 완료되었습니다.' });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// ===============================================================
// ===== 서버 실행 =====
// ===============================================================
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    // [DB 추가] 서버 시작 시 DB 셋업 함수 호출
    setupDatabase();
});
