document.getElementById('notice-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const password = prompt("관리자 비밀번호를 입력하세요:");
    if (password === null) { // 사용자가 '취소'를 누른 경우
        return;
    }

    const title = document.getElementById('title').value;
    const department = document.getElementById('department').value;
    const isSticky = document.getElementById('is-sticky').checked;
    const content = document.getElementById('content').value;

    try {
        const response = await fetch('https://o70albxd7n.onrender.com/api/notices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, department, isSticky, content, password }) // password 추가
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '서버 응답 오류');
        }

        alert('공지사항이 등록되었습니다.');
        window.location.href = 'notice.html';

    } catch (error) {
        console.error("등록 오류:", error);
        alert(`공지사항 등록 중 오류가 발생했습니다: ${error.message}`);
    }
});
