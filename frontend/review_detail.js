document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get('id');

    if (!reviewId) {
        alert('잘못된 접근입니다.');
        return window.location.href = 'review.html';
    }
    
    function displayReview(review) {
        document.getElementById('detail-title').textContent = review.title;
        document.getElementById('detail-author').textContent = review.author;
        document.getElementById('detail-date').textContent = review.date;
        document.getElementById('detail-views').textContent = review.views;
        document.getElementById('detail-rating').textContent = `평점: ${'⭐'.repeat(review.rating)}`;
        document.getElementById('detail-content').innerHTML = `<p>${(review.content || '').replace(/\n/g, '<br>')}</p>`;

        const sliderWrapper = document.querySelector('.slider-wrapper');
        const imagesContainer = document.getElementById('detail-images-container');
        
        sliderWrapper.innerHTML = ''; // 이미지 래퍼 초기화
        
        if (review.images && review.images.length > 0) {
            imagesContainer.style.display = 'block';
            review.images.forEach(imageUrl => {
                const parts = imageUrl.split('/upload/');
                const transformedUrl = `${parts[0]}/upload/w_400,h_300,c_fill/${parts[1]}`;
                const slideDiv = document.createElement('div');
                slideDiv.className = 'slide';
                slideDiv.innerHTML = `<img src="${transformedUrl}" alt="후기 이미지">`;
                sliderWrapper.appendChild(slideDiv);
            });
        } else {
            imagesContainer.style.display = 'none';
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`);
        if (!response.ok) throw new Error('후기를 불러오는 데 실패했습니다.');
        const currentReview = await response.json();
        displayReview(currentReview);

        // 수정 버튼에 비밀번호 입력 창 띄우고 인증 후 이동
        const editBtn = document.getElementById('edit-btn');
        editBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const password = prompt('수정하려면 비밀번호를 입력하세요');
            if (!password) {
                alert('비밀번호를 입력해야 수정할 수 있습니다.');
                return;
            }
            try {
                const verifyResponse = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/verify-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                if (verifyResponse.ok) {
                    window.location.href = `review_edit.html?id=${reviewId}`;
                } else {
                    alert('비밀번호가 올바르지 않습니다.');
                }
            } catch {
                alert('비밀번호 인증 중 오류가 발생했습니다.');
            }
        });

        // 삭제 버튼 클릭 이벤트 - 비밀번호 입력 후 인증 및 삭제
        const deleteBtn = document.getElementById('delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const password = prompt('삭제하려면 비밀번호를 입력하세요');
            if (!password) {
                alert('비밀번호를 입력해야 삭제할 수 있습니다.');
                return;
            }
            if (!confirm('정말로 이 후기를 삭제하시겠습니까?')) {
                return;
            }
            try {
                // 비밀번호 인증 API 호출
                const verifyResponse = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/verify-password`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ password })
                });

                if (!verifyResponse.ok) {
                    alert('비밀번호가 올바르지 않습니다.');
                    return;
                }

                // 인증 성공 시 삭제 요청
                const deleteResponse = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (!deleteResponse.ok) throw new Error('삭제에 실패했습니다.');

                alert('후기가 삭제되었습니다.');
                window.location.href = 'review.html';
            } catch (err) {
                alert(err.message);
            }
        });

    } catch (error) {
        alert(error.message);
        window.location.href = 'review.html';
    }
});
