document.addEventListener('DOMContentLoaded', () => {
    // 실제 운영 서버 주소로 적용했습니다.
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';

    const form = document.getElementById('review-form');
    const imageInput = document.getElementById('images');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        if (!ratingInput) {
            return alert('평점을 선택해주세요.');
        }

        const passwordInput = document.getElementById('password');
        if (!passwordInput.value) {
            return alert('비밀번호를 입력해주세요.');
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('author', document.getElementById('author').value);
        formData.append('rating', ratingInput.value);
        formData.append('content', document.getElementById('content').value);
        formData.append('password', passwordInput.value);  // 비밀번호 포함

        for (const file of imageInput.files) {
            formData.append('images', file);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('등록에 실패했습니다.');
            alert('후기가 등록되었습니다.');
            window.location.href = 'review.html';
        } catch (error) {
            alert(`후기 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    });
});
