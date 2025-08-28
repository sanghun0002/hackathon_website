document.addEventListener('DOMContentLoaded', function() {
    const boardBody = document.getElementById('board-body');
    const paginationContainer = document.getElementById('pagination');
    
    // 서버 URL을 변수로 관리하여 변경 용이성을 높입니다.
    const serverUrl = 'https://o70albxd7n.onrender.com';

    // 현재 페이지 번호를 추적하는 변수
    let currentPage = 1;

    async function loadNotices(page = 1) {
        currentPage = page; // 현재 페이지 업데이트
        try {
            // 백엔드에서 페이지네이션을 구현하지 않았으므로, 페이지 쿼리는 제거합니다.
            const response = await fetch(`${serverUrl}/api/notices`);
            if (!response.ok) throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            
            const data = await response.json();
            renderTable(data);
            // 페이지네이션은 프론트엔드에서 자체적으로 구현하거나, 백엔드 구현 후 연동합니다.
            // 현재 백엔드 구조에서는 페이지네이션을 프론트에서 구현하기 복잡하므로 우선 목록 표시부터 해결합니다.
            
        } catch (error) {
            console.error("로딩 오류:", error);
            boardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">공지사항 로딩 중 오류가 발생했습니다.</td></tr>`;
        }
    }

    function renderTable(data) {
        boardBody.innerHTML = ''; // 기존 목록 초기화
        const { notices, stickyNotices } = data;

        // 고정 공지 렌더링
        stickyNotices.forEach(notice => {
            const row = createRow(notice, '공지');
            row.classList.add('sticky', 'font-bold', 'bg-yellow-50'); // 스타일 추가
            boardBody.appendChild(row);
        });

        // 일반 공지 렌더링 (전체 목록을 가져오므로 번호는 역순으로 매깁니다)
        const totalNotices = notices.length;
        notices.forEach((notice, index) => {
            const noticeNumber = totalNotices - index;
            const row = createRow(notice, noticeNumber);
            boardBody.appendChild(row);
        });

        if (stickyNotices.length === 0 && notices.length === 0) {
            boardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">등록된 공지사항이 없습니다.</td></tr>`;
        }
    }
    
    function createRow(notice, number) {
        const tr = document.createElement('tr');
        
        // --- ✨ [수정된 부분] ✨ ---
        // 1. notice.date 대신 notice.created_at을 사용합니다.
        // 2. new Date()와 toISOString()을 사용해 날짜 형식(YYYY-MM-DD)으로 변환합니다.
        const formattedDate = new Date(notice.created_at).toISOString().split('T')[0];

        tr.innerHTML = `
            <td>${number}</td>
            <td class="class-cell"><a href="notice_detail.html?id=${notice.id}">${notice.title}</a></td>
            <td class="class-dept">${notice.department}</td>
            <td class="class-date">${formattedDate}</td>
            <td class="class-views">${notice.views}</td>
        `;
        return tr;
    }

    // 페이지 로드 시 첫 목록을 불러옵니다.
    loadNotices(1);
});
