document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const noticeId = params.get('id');

    if (!noticeId) {
        alert('잘못된 접근입니다.');
        window.location.href = 'notice.html';
        return;
    }

    try {
        const response = await fetch(`https://o70albxd7n.onrender.com/api/notices/${noticeId}`);
        if (!response.ok) {
            throw new Error('공지사항을 불러오는 데 실패했습니다.');
        }
        const notice = await response.json();

        document.getElementById('detail-title').textContent = notice.title;
        document.getElementById('detail-department').textContent = notice.department;
        document.getElementById('detail-date').textContent = notice.date;
        document.getElementById('detail-views').textContent = notice.views;
        document.getElementById('detail-content').innerHTML = `<p>${notice.content.replace(/\n/g, '<br>')}</p>`;

        // [수정] 수정 버튼 이벤트 리스너
        const editBtn = document.getElementById('edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const password = prompt("관리자 비밀번호를 입력하세요:");
            if (password === "0000") {
                window.location.href = `notice_edit.html?id=${noticeId}`;
            } else if (password !== null) { // '취소'가 아닐 때만 경고
                alert("비밀번호가 올바르지 않습니다.");
            }
        });

        // [수정] 삭제 버튼 이벤트 리스너
        const deleteBtn = document.getElementById('delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const password = prompt("관리자 비밀번호를 입력하세요:");
            if (password === null) return;

            if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
                try {
                    const deleteResponse = await fetch(`https://o70albxd7n.onrender.com/api/notices/${noticeId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password }) // password 추가
                    });

                    if (!deleteResponse.ok) {
                        const errorData = await deleteResponse.json();
                        throw new Error(errorData.message || '삭제에 실패했습니다.');
                    }
                    
                    alert('공지사항이 삭제되었습니다.');
                    window.location.href = 'notice.html';
                } catch (err) {
                    alert(err.message);
                }
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        window.location.href = 'notice.html';
    }
});
