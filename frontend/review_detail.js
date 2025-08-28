document.addEventListener('DOMContentLoaded', () => {
    // API 서버 주소와 URL에서 게시물 ID 가져오기
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get('id');

    // --- DOM 요소 가져오기 ---
    // 보기 모드 요소
    const viewMode = document.getElementById('view-mode');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailDate = document.getElementById('detail-date');
    const detailViews = document.getElementById('detail-views');
    const detailRating = document.getElementById('detail-rating');
    const detailImagesContainer = document.getElementById('detail-images-container');
    const imageSliderWrapper = detailImagesContainer.querySelector('.slider-wrapper');
    const detailContent = document.getElementById('detail-content');

    // 수정 모드 요소
    const editMode = document.getElementById('edit-mode');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-title');
    const editContent = document.getElementById('edit-content');
    
    // 버튼 요소
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    let currentReviewData = null; // 현재 후기 데이터를 저장할 변수

    // 별점을 별 아이콘으로 변환하는 함수
    const renderStars = (rating) => '⭐'.repeat(rating);

    // --- 데이터 로딩 및 표시 ---
    const fetchReviewDetails = async () => {
        if (!reviewId) {
            alert('잘못된 접근입니다.');
            window.location.href = 'review.html';
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`);
            if (!response.ok) throw new Error('후기를 불러오는 데 실패했습니다.');
            
            const review = await response.json();
            currentReviewData = review; // 데이터 저장

            // 보기 모드에 데이터 채우기
            detailTitle.textContent = review.title;
            detailAuthor.textContent = `작성자: ${review.author}`;
            detailDate.textContent = `작성일: ${review.date}`;
            detailViews.textContent = review.views;
            detailRating.innerHTML = renderStars(review.rating);
            detailContent.innerHTML = review.content.replace(/\n/g, '<br>');

            // 이미지가 있으면 이미지 슬라이더 표시
            if (review.images && review.images.length > 0) {
                imageSliderWrapper.innerHTML = review.images.map(imgUrl => `
                    <div class="slide"><img src="${imgUrl}" alt="후기 이미지"></div>
                `).join('');
                detailImagesContainer.style.display = 'block';
            }

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    // --- 모드 전환 함수 ---
    const switchToEditMode = () => {
        if (!currentReviewData) return;

        // 기존 데이터로 수정 폼 채우기
        editTitle.value = currentReviewData.title;
        editContent.value = currentReviewData.content;
        // 기존 별점에 해당하는 라디오 버튼을 체크 상태로 만듦
        const ratingInput = document.querySelector(`#edit-mode input[name="rating"][value="${currentReviewData.rating}"]`);
        if (ratingInput) {
            ratingInput.checked = true;
        }

        // 화면 전환
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
    };

    const switchToViewMode = () => {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    };

    // --- 이벤트 리스너 ---
    // '수정' 버튼 클릭
    editBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const password = prompt('게시물 비밀번호를 입력하세요.');
        if (password === null) return; // 사용자가 취소한 경우

        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/verify`,
