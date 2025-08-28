document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get('id');

    // --- DOM 요소 ---
    const viewMode = document.getElementById('view-mode');
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailDate = document.getElementById('detail-date');
    const detailViews = document.getElementById('detail-views');
    const detailRating = document.getElementById('detail-rating');
    const detailImagesContainer = document.getElementById('detail-images-container');
    const imageSliderWrapper = detailImagesContainer.querySelector('.slider-wrapper');
    const detailContent = document.getElementById('detail-content');

    const editMode = document.getElementById('edit-mode');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-title');
    const editContent = document.getElementById('edit-content');
    
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    let currentReviewData = null;

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
            currentReviewData = review;

            detailTitle.textContent = review.title;
            detailAuthor.textContent = `작성자: ${review.author}`;
            detailDate.textContent = `작성일: ${review.date}`;
            detailViews.textContent = review.views;
            detailRating.innerHTML = renderStars(review.rating);
            detailContent.innerHTML = review.content.replace(/\n/g, '<br>');

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

        editTitle.value = currentReviewData.title;
        editContent.value = currentReviewData.content;
        
        // ▼▼▼ [수정된 부분 1] ▼▼▼
        // 기존 별점 값에 해당하는 라디오 버튼을 찾아서 'checked' 상태로 만듭니다.
        const ratingInput = document.querySelector(`#edit-mode input[name="rating"][value="${currentReviewData.rating}"]`);
        if (ratingInput) {
            ratingInput.checked = true;
        }

        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
    };

    const switchToViewMode = () => {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    };

    // --- 이벤트 리스너 ---
    editBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const password = prompt('게시물 비밀번호를 입력하세요.');
        if (password === null) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                switchToEditMode();
            } else {
                alert(result.message || '비밀번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('인증 중 오류가 발생했습니다.');
        }
    });

    deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const password = prompt('삭제하려면 게시물 비밀번호를 입력하세요.');
        if (password === null) return;

        if (confirm('정말로 이 후기를 삭제하시겠습니까?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
