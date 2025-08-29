// ===============================================================
// ===== 라이브러리 및 초기 설정 =====
// ===============================================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { Pool } = require('pg');

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
        await client.query('CREATE TABLE IF NOT EXISTS notices (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, department VARCHAR(100), content TEXT NOT NULL, is_sticky BOOLEAN DEFAULT false, views INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());');
        await client.query('CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, author VARCHAR(100), rating INTEGER, content TEXT, password VARCHAR(255) NOT NULL, images TEXT[], views INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());');
        await client.query('CREATE TABLE IF NOT EXISTS bookings (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, phone VARCHAR(100) NOT NULL, booking_date DATE NOT NULL, valley VARCHAR(100), section VARCHAR(100), deck_name VARCHAR(100), capacity INTEGER, status VARCHAR(50) DEFAULT \'예약 완료\', created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ);');
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
// ===== 공지사항 및 후기 API (변경 없음, 생략) =====
// ===============================================================
// (코드는 이전과 동일)
app.get('/api/notices', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
        const totalResult = await pool.query('SELECT COUNT(*) FROM notices');
        const totalNotices = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalNotices / limit);
        const result = await pool.query(
            `SELECT *,
                CASE WHEN is_sticky = true THEN 1 ELSE 2 END AS order_priority
             FROM notices
             ORDER BY order_priority, created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json({
            notices: result.rows,
            currentPage: page,
            totalPages: totalPages,
            totalNotices: totalNotices
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
// ===== 챗봇(Chatbot) API (Gemini 버전) =====
// ===============================================================

// Google AI 라이브러리 불러오기
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini 클라이언트 설정 (API 키는 Render 환경변수에서 가져옵니다)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 챗봇의 역할을 정의하는 시스템 메시지 (Gemini에서는 역할 정의를 대화의 일부로 전달합니다)
const systemPrompt =`당신은 대한민국 계곡 평상 예약 사이트의 전문 상담원 '백숙이'입니다.  이상한 기호 붙이지 않고 정확하게 대답해주세요. 
모든 답변은 장황하지 않게, 최대한 핵심만 간결하게 끝내주세요. 사용자가 질문한 언어로 답해주세요. 
[중요 정보]
- 평상 가격: 1개당 1일 10,000원
- 평상 사용 방식 : 해당 웹사이트에서 예약 후 현장에서 이용 시작 및 반납 시 QR 인증 필요
- 웹사이트의 주요 기능 : 평상 예약하기, 주변 맛집, 놀거리, 숙박시설 찾기, 사용 후기 남기기, 길 찾기
- 환불 규정 : 예약일로부터 7일 이상 남은 경우:100% 환불, 예약일로부터 3일 ~ 6일 전: 50% 환불, 예약일로부터 2일 전 ~ 당일: 환불 불가, 환불 처리에는 영업일 기준 3일에서 최대 7일까지 소요될 수 있음
`;



// '/api/ask' 경로로 POST 요청이 오면 챗봇이 답변합니다.
app.post('/api/ask', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: '메시지가 없습니다.' });
    }

    try {
        // Gemini 모델을 선택합니다.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Gemini는 채팅 기록(history)을 바탕으로 대화합니다.
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }], // 시스템 역할을 첫 번째 유저 메시지로 전달
                },
                {
                    role: "model",
                    parts: [{ text: "네, 안녕하세요! 계곡 평상 예약 도우미 '백숙이'입니다. 무엇을 도와드릴까요?" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });
        
        // 사용자 메시지를 전송하고 답변을 기다립니다.
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const botReply = response.text();
        
        res.json({ reply: botReply });

    } catch (error) {
        console.error('Gemini API 오류:', error);
        res.status(500).json({ error: 'AI 응답을 생성하는 중 오류가 발생했습니다.' });
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
        const result = await pool.query("SELECT * FROM bookings WHERE status NOT IN ('반납 완료', '예약 취소') ORDER BY created_at DESC");
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
        const nameClean = name.replace(/\s|-/g, '');
        const phoneClean = phone.replace(/\s|-/g, '');
        
        const query = `
            UPDATE bookings 
            SET status = '사용 중' 
            WHERE 
                REPLACE(REPLACE(CONCAT(valley, section, deck_name), ' ', ''), '-', '') = $1 AND 
                REPLACE(name, ' ', '') = $2 AND 
                REPLACE(REPLACE(phone, ' ', ''), '-', '') = $3 AND 
                booking_date = $4 AND
                status = '예약 완료'
            RETURNING *;
        `;
        const result = await pool.query(query, [pyeongsangIdClean, name.replace(/\s|-/g, ''), phone.replace(/\s|-/g, ''), today]);

        if (result.rowCount > 0) {
            res.json({ status: 'success', message: '현장 인증이 정상적으로 처리되었습니다.' });
        } else {
            res.status(404).json({ status: 'failure', message: '정보가 일치하지 않거나 이미 처리된 예약입니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// GET: 평상 ID로 오늘 날짜의 예약 정보 조회 (return.js의 상태 확인용)
app.get('/api/bookings/by-pyeongsang/:pyeongsangId', async (req, res) => {
    const { pyeongsangId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    try {
        const query = `
            SELECT * FROM bookings 
            WHERE REPLACE(REPLACE(CONCAT(valley, section, deck_name), ' ', ''), '-', '') = $1 AND booking_date = $2 AND completed_at IS NULL
        `;
        const result = await pool.query(query, [pyeongsangId.replace(/\s|-/g, ''), today]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: '오늘 날짜로 된 해당 평상의 예약이 없습니다.' });
        }
        res.json(result.rows[0]);
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
        // [수정] SQL 쿼리에 status = '사용 중' 조건을 추가
        const query = `
            UPDATE bookings 
            SET status = '반납 완료', completed_at = NOW()
            WHERE
                REPLACE(REPLACE(CONCAT(valley, section, deck_name), ' ', ''), '-', '') = $1 AND 
                REPLACE(REPLACE(name, ' ', ''), '-', '') = $2 AND 
                REPLACE(REPLACE(phone, ' ', ''), '-', '') = $3 AND 
                booking_date = $4 AND
                status = '사용 중'
            RETURNING *;
        `;
        const result = await pool.query(query, [pyeongsangIdClean, name.replace(/\s|-/g, ''), phone.replace(/\s|-/g, ''), today]);

        if (result.rowCount > 0) {
            res.status(200).json({ status: 'success', message: '반납 처리가 완료되었습니다.' });
        } else {
            // [수정] 실패 메시지를 더 명확하게 변경
            res.status(404).json({ message: '정보가 일치하지 않거나 반납할 수 없는 상태의 예약입니다.' });
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
    console.log('✅ v2: 챗봇 기능이 포함된 서버가 시작되었습니다.');
    setupDatabase();
});
