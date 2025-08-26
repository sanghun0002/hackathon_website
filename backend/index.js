// index.js (수정)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ... (Cloudinary 설정은 기존과 동일) ...
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
// ===== 데이터베이스 영역 (임시 인메모리) =====
// ===============================================================

// ... (공지사항 데이터는 기존과 동일) ...
let notices = [
    { id: 3, title: "우천시 예약 취소 정책", department: "운영팀", date: "2025-08-03", views: 78, isSticky: true, content: "기상청 예보 기준, 방문 예정일의 강수 확률이 70% 이상일 경우 위약금 없이 예약을 취소할 수 있습니다. 취소는 방문 하루 전까지 가능합니다." },
    { id: 2, title: "보증금 현장 인증 시스템 도입", department: "개발팀", date: "2025-08-10", views: 120, isSticky: true, content: "이제 QR코드를 통해 보증금을 현장에서 즉시 인증하고 반환받을 수 있습니다. 퇴실 시 비치된 QR코드를 스캔해주세요." },
    { id: 1, title: "여름 성수기 예약 안내", department: "운영팀", date: "2025-08-11", views: 256, isSticky: false, content: "7월에서 8월 사이 여름 성수기 기간 동안 예약이 폭주할 수 있으니 미리 예약해주시기 바랍니다. 원활한 운영을 위해 보증금 제도가 함께 시행됩니다." },
];
let nextNoticeId = 4;


// ▼▼▼ 후기 데이터에 password 필드 추가 ▼▼▼
let reviews = [
    { id: 1, title: "계곡 바로 앞이라 너무 좋았어요!", author: "김철수", rating: 5, date: "2025-08-15", views: 45, content: "물놀이하고 바로 들어와서 쉴 수 있어서 최고였습니다.", images: [], password: "1111" },
    { id: 2, title: "가족들과 좋은 시간 보냈습니다.", author: "이영희", rating: 4, date: "2025-08-12", views: 88, content: "부모님 모시고 갔는데 다들 만족하셨어요.", images: [], password: "2222" },
];
let nextReviewId = 3;


// ===============================================================
// ===== 공지사항(Notice) API (기존과 동일) =====
// ===============================================================
// ... app.get('/api/notices'), app.post, app.get, app.put, app.delete ...
// (공지사항 관련 코드는 생략 - 기존 코드와 동일합니다)
app.get('/api/notices', (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const noticesPerPage = 10;
    const stickyNotices = notices.filter(n => n.isSticky).sort((a, b) => b.id - a.id);
    const normalNotices = notices.filter(n => !n.isSticky).sort((a, b) => b.id - a.id);
    
    const normalNoticesOnFirstPage = Math.max(0, noticesPerPage - stickyNotices.length);
    const remainingNotices = normalNotices.length - normalNoticesOnFirstPage;
    const totalPages = remainingNotices > 0 ? 1 + Math.ceil(remainingNotices / noticesPerPage) : 1;
    let paginatedNotices;
    if (page === 1) {
        paginatedNotices = normalNotices.slice(0, normalNoticesOnFirstPage);
    } else {
        const startIndex = normalNoticesOnFirstPage + (page - 2) * noticesPerPage;
        const endIndex = startIndex + noticesPerPage;
        paginatedNotices = normalNotices.slice(startIndex, endIndex);
    }

    res.json({
        notices: paginatedNotices,
        stickyNotices: stickyNotices,
        totalPages: totalPages,
        currentPage: page,
        totalNormalNotices: normalNotices.length,
        normalNoticesOnFirstPage: normalNoticesOnFirstPage
    });
});

app.post('/api/notices', (req, res) => {
    const { title, department, isSticky, content } = req.body;
    if (!title || !department || !content) {
        return res.status(400).json({ message: '제목, 작성부서, 내용은 필수입니다.' });
    }
    const newNotice = {
        id: nextNoticeId++,
        title, department,
        date: new Date().toISOString().split('T')[0],
        views: 0,
        isSticky: isSticky || false,
        content: content
    };
    notices.unshift(newNotice);
    res.status(201).json(newNotice);
});

app.get('/api/notices/:id', (req, res) => {
    const notice = notices.find(n => n.id === parseInt(req.params.id));
    if (notice) {
        notice.views++;
        res.json(notice);
    } else {
        res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
});

app.put('/api/notices/:id', (req, res) => {
    const noticeIndex = notices.findIndex(n => n.id === parseInt(req.params.id));
    if (noticeIndex !== -1) {
        const { title, department, isSticky, content } = req.body;
        notices[noticeIndex] = { ...notices[noticeIndex], title, department, isSticky, content };
        res.json(notices[noticeIndex]);
    } else {
        res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
});

app.delete('/api/notices/:id', (req, res) => {
    const noticeIndex = notices.findIndex(n => n.id === parseInt(req.params.id));
    if (noticeIndex !== -1) {
        notices.splice(noticeIndex, 1);
        res.status(200).json({ message: '삭제 완료' });
    } else {
        res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }
});

// ===============================================================
// ===== 후기(Review) API (수정됨) =====
// ===============================================================

// GET: 모든 후기 목록 조회 (보안을 위해 password 필드 제외)
app.get('/api/reviews', (req, res) => {
    const sortedReviews = [...reviews].sort((a, b) => b.id - a.id);
    const safeReviews = sortedReviews.map(({ password, ...review }) => review);
    res.json({ reviews: safeReviews });
});

// POST: 새 후기 작성 (password 필드 추가)
app.post('/api/reviews', upload.array('images', 5), (req, res) => {
    const { title, author, rating, content, password } = req.body; // password 추가
    if (!password) {
        return res.status(400).json({ message: '비밀번호는 필수입니다.' });
    }
    const images = req.files ? req.files.map(file => file.path) : [];

    const newReview = {
        id: nextReviewId++,
        title, author,
        rating: parseInt(rating, 10),
        date: new Date().toISOString().split('T')[0],
        views: 0,
        content,
        images,
        password // password 저장
    };
    reviews.unshift(newReview);
    res.status(201).json(newReview);
});

// GET: 특정 ID의 후기 상세 조회 (보안을 위해 password 필드 제외)
app.get('/api/reviews/:id', (req, res) => {
    const review = reviews.find(r => r.id === parseInt(req.params.id));
    if (review) {
        review.views++;
        const { password, ...safeReview } = review;
        res.json(safeReview);
    } else {
        res.status(404).json({ message: '후기를 찾을 수 없습니다.' });
    }
});

// PUT: 특정 ID의 후기 수정 (기존과 동일, 비밀번호 확인은 프론트에서 verify API로 선처리)
app.put('/api/reviews/:id', upload.array('newImages', 5), (req, res) => {
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(req.params.id));
    if (reviewIndex === -1) return res.status(404).json({ message: '수정할 후기를 찾을 수 없습니다.' });

    const { title, author, rating, content, imagesToDelete } = req.body;
    let currentImages = reviews[reviewIndex].images;
    if (imagesToDelete) {
        const deleteList = JSON.parse(imagesToDelete);
        currentImages = currentImages.filter(url => !deleteList.includes(url));
    }
    if (req.files) {
        const newImageUrls = req.files.map(file => file.path);
        currentImages = [...currentImages, ...newImageUrls];
    }
    reviews[reviewIndex] = { ...reviews[reviewIndex], title, author, rating: parseInt(rating), content, images: currentImages };
    res.json(reviews[reviewIndex]);
});

// ▼▼▼ DELETE: 특정 ID의 후기 삭제 (비밀번호 확인 로직 추가) ▼▼▼
app.delete('/api/reviews/:id', (req, res) => {
    const { password } = req.body;
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(req.params.id));

    if (reviewIndex === -1) {
        return res.status(404).json({ message: '삭제할 후기를 찾을 수 없습니다.' });
    }
    if (reviews[reviewIndex].password !== password) {
        return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    
    reviews.splice(reviewIndex, 1);
    res.status(200).json({ message: '삭제 완료' });
});

// ▼▼▼ [신규] 수정 전 비밀번호 확인 API ▼▼▼
app.post('/api/reviews/:id/verify', (req, res) => {
    const { password } = req.body;
    const review = reviews.find(r => r.id === parseInt(req.params.id));
    if (!review) {
        return res.status(404).json({ message: '후기를 찾을 수 없습니다.' });
    }
    if (review.password === password) {
        res.status(200).json({ success: true, message: '인증 성공' });
    } else {
        res.status(403).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
});


// ===============================================================
// ===== 서버 실행 (기존과 동일) =====
// ===============================================================
app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
