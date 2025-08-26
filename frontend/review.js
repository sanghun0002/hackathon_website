document.addEventListener('DOMContentLoaded', function() {
    // 실제 운영 서버 주소로 적용했습니다.
    const API_BASE_URL = 'https://image-analyzer-wduj.onrender.com'/*'https://o70albxd7n.onrender.com'*/;

    const boardBody = document.getElementById('review-board-body');
    
    async function loadReviews() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`);
            if (!response.ok) throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            const data = await response.json();
            renderTable(data.reviews);
        } catch (error) {
            console.error("로딩 오류:", error);
            boardBody.innerHTML = `<tr><td colspan="6">후기 로딩 중 오류가 발생했습니다.</td></tr>`;
        }
    }

    function renderTable(reviews) {
        boardBody.innerHTML = '';
        reviews.forEach((review, index) => {
            const row = createRow(review, reviews.length - index);
            boardBody.appendChild(row);
        });
    }
    
    function renderStars(rating) { return '⭐'.repeat(rating); }

    function createRow(review, number) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${number}</td>
            <td><a href="review_detail.html?id=${review.id}">${review.title}</a></td>
            <td>${review.author}</td>
            <td>${renderStars(review.rating)}</td>
            <td>${review.date}</td>
            <td>${review.views}</td>
        `;
        return tr;
    }

    loadReviews();
});s
