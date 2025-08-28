document.addEventListener('DOMContentLoaded', async () => {
    // --- 기본 설정 ---
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get('id');

    // ID가 없으면 페이지 접근 차단
    if (!reviewId) {
        alert('잘못된 접근입니다.');
        window.location.href = 'review.html';
        return;
    }

    // --- 함수: 후기 데이터를 화면에 표시 ---
    function displayReview(review) {
        document.getElementById('detail-title').textContent = review.title;
        document.getElementById('detail-author').textContent = review.author;

        // [문제 해결] 서버 데이터 필드명인 'created_at'으로 수정하고, 사용자 친화적인 날짜 형식으로 변경
        document.getElementById('detail-date').textContent = new Date(review.created_at).toLocaleDateString();
        
        document.getElementById('detail-views').textContent = review.views;
        document.getElementById('detail-rating').textContent = '⭐'.repeat(review.rating || 0);
        document.getElementById('detail-content').innerHTML = `<p>${(review.content || '').replace(/\n/g, '<br>')}</p>`;

        const sliderWrapper = document.querySelector('.slider-wrapper');
        const imagesContainer = document.getElementById('detail-images-container');
        
        sliderWrapper.innerHTML = ''; // 슬라이더 초기화
        
        if (review.images && review.images.length > 0) {
            imagesContainer.style.display = 'block';
            review.images.forEach(imageUrl => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide';
                slideDiv.innerHTML = `<img src="${imageUrl}" alt="후기 이미지" loading="lazy">`;
                sliderWrapper.appendChild(slideDiv);
            });
        } else {
            imagesContainer.style.display = 'none';
        }
    }

    // --- 메인 로직: 데이터 가져오기 및 이벤트 연결 ---
    try {
        // 1. 후기 데이터 가져오기
        const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`);
        if (!response.ok) throw new Error('후기를 불러오는 데 실패했습니다.');
        
        const currentReview = await response.json();
        displayReview(currentReview);

        // 2. 수정 버튼 이벤트 리스너
        const editBtn = document.getElementById('edit-btn');
        editBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const password = prompt('수정을 위해 비밀번호를 입력하세요.');
            if (!password) return;

            try {
                const verifyResponse = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });
                if (!verifyResponse.ok) throw new Error('비밀번호가 일치하지 않습니다.');
                
                alert('인증되었습니다. 수정 페이지로 이동합니다.');
                window.location.href = `review_edit.html?id=${reviewId}`;
            } catch (err) {
                alert(err.message);
            }
        });

        // 3. 삭제 버튼 이벤트 리스너
        const deleteBtn = document.getElementById('delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const password = prompt('삭제를 위해 비밀번호를 입력하세요.');
            if (!password) return;
            
            if (confirm('정말로 이 후기를 삭제하시겠습니까?')) {
                try {
                    const deleteResponse = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: password })
                    });

                    if (!deleteResponse.ok) {
                         const errorData = await deleteResponse.json();
                         throw new Error(errorData.message || '삭제에 실패했습니다.');
                    }
                    
                    alert('후기가 삭제되었습니다.');
                    window.location.href = 'review.html';
                } catch (err) {
                    alert(err.message);
                }
            }
        });

    } catch (error) {
        console.error(error); // 콘솔에 에러 로그를 남겨 디버깅에 용이하게 함
        document.getElementById('view-mode').innerHTML = `<p style="text-align: center; color: red;">${error.message}</p>`;
    }
});
