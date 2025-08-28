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
        document.getElementById('detail-date').textContent = new Date(review.date).toISOString().split('T')[0];
        document.getElementById('detail-views').textContent = review.views;
        const ratingInputs = document.querySelectorAll('input[name="rating"]');
        ratingInputs.forEach(input => {
            input.checked = (parseInt(input.value) === review.rating);
        });
        
        // 별점은 읽기 전용으로 (보기 페이지니까)
        ratingInputs.forEach(input => input.disabled = true);

        document.getElementById('detail-content').innerHTML = `<p>${(review.content || '').replace(/\n/g, '<br>')}</p>`;

        const sliderWrapper = document.querySelector('.slider-wrapper');
        const imagesContainer = document.getElementById('detail-images-container');
        
        sliderWrapper.innerHTML = '';
        
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

    try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`);
        if (!response.ok) throw new Error('후기를 불러오는 데 실패했습니다.');
        const currentReview = await response.json();
        displayReview(currentReview);

        // 수정 버튼 클릭 이벤트
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

        // 삭제 버튼 클릭 이벤트
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
        document.getElementById('view-mode').innerHTML = `<p class="text-center text-red-500">${error.message}</p>`;
    }
});
