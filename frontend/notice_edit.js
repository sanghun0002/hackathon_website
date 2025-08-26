document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const noticeId = params.get('id');
    const form = document.getElementById('notice-edit-form');

    if (!noticeId) {
        alert('잘못된 접근입니다.');
        window.location.href = 'notice.html';
        return;
    }

    // 1. 기존 공지사항 데이터 불러와서 폼에 채우기
    try {
        const response = await fetch(`https://o70albxd7n.onrender.com/api/notices/${noticeId}`);
        if (!response.ok) {
            throw new Error('공지사항 정보를 불러오는 데 실패했습니다.');
        }
        const notice = await response.json();

        document.getElementById('title').value = notice.title;
        document.getElementById('department').value = notice.department;
        document.getElementById('content').value = notice.content;
        document.getElementById('is-sticky').checked = notice.isSticky;

    } catch (error) {
        alert(error.message);
        window.location.href = 'notice.html';
    }

    // 2. 폼 제출(수정) 이벤트 처리
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = prompt("관리자 비밀번호를 입력하세요:");
        if (password === null) return;

        const updatedData = {
            title: document.getElementById('title').value,
            department: document.getElementById('department').value,
            content: document.getElementById('content').value,
            isSticky: document.getElementById('is-sticky').checked,
            password: password
        };

        try {
            const updateResponse = await fetch(`https://o70albxd7n.onrender.com/api/notices/${noticeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.message || '수정에 실패했습니다.');
            }

            alert('공지사항이 성공적으로 수정되었습니다.');
            window.location.href = `notice_detail.html?id=${noticeId}`;

        } catch (error) {
            alert(error.message);
        }
    });
});
