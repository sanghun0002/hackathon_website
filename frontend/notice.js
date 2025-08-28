document.addEventListener('DOMContentLoaded', function() {
    const boardBody = document.getElementById('board-body');
    const paginationContainer = document.getElementById('pagination');
    const serverUrl = 'https://o70albxd7n.onrender.com';

    /**
     * 페이지 로드 및 페이지 번호 클릭 시 공지사항을 불러오는 함수
     */
    async function loadNotices(page = 1) {
        try {
            const response = await fetch(`${serverUrl}/api/notices?page=${page}`);
            if (!response.ok) throw new Error('서버에서 데이터를 가져오지 못했습니다.');
            
            const data = await response.json();
            renderTable(data); // 테이블 렌더링
            renderPagination(data); // 페이지네이션 렌더링
            
        } catch (error) {
            console.error("로딩 오류:", error);
            boardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">공지사항 로딩 중 오류가 발생했습니다.</td></tr>`;
        }
    }

    /**
     * 받아온 데이터로 테이블 내용을 채우는 함수 (수정됨)
     */
    function renderTable(data) {
        boardBody.innerHTML = ''; // 기존 목록 초기화

        // 서버에서 오는 데이터 구조에 맞게 수정
        const { notices, currentPage, totalNotices } = data;
        const itemsPerPage = 10;
        
        // 페이지의 시작 번호를 계산 (전체 개수 - 이전 페이지들의 게시글 수)
        const startNumber = totalNotices - ((currentPage - 1) * itemsPerPage);

        // 이제 고정/일반 구분 없이 받은 notices 배열을 바로 렌더링합니다.
        notices.forEach((notice, index) => {
            // is_sticky 값에 따라 번호를 '공지' 또는 계산된 숫자로 표시
            const noticeNumber = notice.is_sticky ? '공지' : startNumber - index;
            const row = createRow(notice, noticeNumber);

            // is_sticky가 true이면 고정 공지 스타일 적용
            if (notice.is_sticky) {
                row.classList.add('sticky', 'font-bold', 'bg-yellow-50');
            }
            boardBody.appendChild(row);
        });

        if (notices.length === 0) {
            boardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">등록된 공지사항이 없습니다.</td></tr>`;
        }
    }

    /**
     * 받아온 페이지 정보로 하단 페이지 번호를 만드는 함수 (변경 없음)
     */
    function renderPagination(data) {
        paginationContainer.innerHTML = '';
        const { totalPages, currentPage } = data;

        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLink.classList.add('active');
            }
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (i !== currentPage) {
                    loadNotices(i);
                }
            });
            paginationContainer.appendChild(pageLink);
        }
    }
    
    /**
     * 테이블의 한 줄(row)을 만드는 함수 (날짜 형식만 개선)
     */
    function createRow(notice, number) {
        const tr = document.createElement('tr');
        // 사용자 친화적인 날짜 형식으로 변경
        const formattedDate = new Date(notice.created_at).toLocaleDateString();

        tr.innerHTML = `
            <td>${number}</td>
            <td class="class-cell"><a href="notice_detail.html?id=${notice.id}">${notice.title}</a></td>
            <td class="class-dept">${notice.department}</td>
            <td class="class-date">${formattedDate}</td>
            <td class="class-views">${notice.views}</td>
        `;
        return tr;
    }

    // 페이지가 처음 열릴 때 1페이지를 불러옵니다.
    loadNotices(1);
});
