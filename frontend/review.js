document.addEventListener('DOMContentLoaded', function() {
    // 실제 운영 서버 주소
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';

    const boardBody = document.getElementById('review-board-body');
    const paginationContainer = document.getElementById('pagination');

    let allReviews = []; // 모든 후기 데이터를 저장할 배열
    let currentPage = 1; // 현재 페이지 번호
    const reviewsPerPage = 10; // 페이지 당 보여줄 후기 개수

    /**
     * 서버에서 모든 후기 데이터를 비동기적으로 불러옵니다.
     */
    async function loadReviews() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`);
            if (!response.ok) {
                throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            }
            const data = await response.json();
            allReviews = data.reviews; // 모든 후기를 전역 배열에 저장
            
            // 데이터 로딩 후 첫 페이지를 표시하고 페이지네이션 버튼 생성
            displayPage(currentPage);
            setupPagination();

        } catch (error) {
            console.error("로딩 오류:", error);
            boardBody.innerHTML = `<tr><td colspan="6">후기 로딩 중 오류가 발생했습니다.</td></tr>`;
        }
    }

    /**
     * 특정 페이지에 해당하는 후기들을 테이블에 표시합니다.
     * @param {number} page - 표시할 페이지 번호
     */
    function displayPage(page) {
        currentPage = page;
        boardBody.innerHTML = ''; // 기존 목록 초기화

        const startIndex = (page - 1) * reviewsPerPage;
        const endIndex = startIndex + reviewsPerPage;
        const paginatedReviews = allReviews.slice(startIndex, endIndex);

        paginatedReviews.forEach((review, index) => {
            // 전체 게시글 번호를 내림차순으로 계산
            const reviewNumber = allReviews.length - startIndex - index;
            const row = createRow(review, reviewNumber);
            boardBody.appendChild(row);
        });

        updatePaginationButtons();
    }

    /**
     * 전체 후기 수에 맞춰 페이지네이션 버튼들을 생성합니다.
     */
    function setupPagination() {
        paginationContainer.innerHTML = ''; // 기존 페이지네이션 초기화
        const pageCount = Math.ceil(allReviews.length / reviewsPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.innerText = i;
            btn.classList.add('page-link'); // CSS 스타일링을 위한 클래스
            
            btn.addEventListener('click', () => {
                displayPage(i); // 버튼 클릭 시 해당 페이지 표시
            });

            paginationContainer.appendChild(btn);
        }
    }
    
    /**
     * 현재 활성화된 페이지 버튼에 'active' 클래스를 추가하고 나머지는 제거합니다.
     */
    function updatePaginationButtons() {
        const buttons = paginationContainer.querySelectorAll('.page-link');
        buttons.forEach(button => {
            if (parseInt(button.innerText) === currentPage) {
                button.classList.add('active'); // 현재 페이지 버튼 활성화
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * 평점(숫자)을 별(⭐) 아이콘으로 변환합니다.
     * @param {number} rating - 평점
     * @returns {string} 별 아이콘 문자열
     */
    function renderStars(rating) {
        return '⭐'.repeat(rating);
    }

    /**
     * 후기 데이터로 테이블의 한 행(<tr>)을 생성합니다.
     * @param {object} review - 후기 데이터 객체
     * @param {number} number - 표시할 게시글 번호
     * @returns {HTMLElement} 생성된 <tr> 요소
     */
    function createRow(review, number) {
        const tr = document.createElement('tr');

        // --- [문제 해결] ---
        // 1. DB에서 오는 날짜 필드 이름인 'created_at'을 사용합니다.
        // 2. new Date()로 날짜 객체를 만들고 toLocaleDateString()으로 'YYYY. MM. DD.' 형식으로 변환합니다.
        const formattedDate = new Date(review.created_at).toLocaleDateString();

        tr.innerHTML = `
            <td>${number}</td>
            <td><a href="review_detail.html?id=${review.id}">${review.title}</a></td>
            <td>${review.author}</td>
            <td>${renderStars(review.rating)}</td>
            <td>${formattedDate}</td>
            <td>${review.views}</td>
        `;
        return tr;
    }

    // 페이지가 로드되면 후기 데이터를 불러옵니다.
    loadReviews();
});
