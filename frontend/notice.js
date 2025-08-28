document.addEventListener('DOMContentLoaded', function() {
    const boardBody = document.getElementById('board-body');
    const paginationContainer = document.getElementById('pagination');
    const serverUrl = 'https://o70albxd7n.onrender.com';

    // 페이지 로드 및 페이지 번호 클릭 시 공지사항을 불러오는 함수
    async function loadNotices(page = 1) {
        try {
            // 백엔드에 현재 페이지 번호를 알려주고 데이터를 요청합니다.
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

    // 받아온 데이터로 테이블 내용을 채우는 함수
    function renderTable(data) {
        boardBody.innerHTML = ''; // 기존 목록 초기화
        const { notices, stickyNotices, currentPage, totalNormalNotices } = data;
        const itemsPerPage = 10;

        // 1페이지일 때만 고정 공지를 표시합니다.
        if (currentPage === 1) {
            stickyNotices.forEach(notice => {
                const row = createRow(notice, '공지');
                row.classList.add('sticky', 'font-bold', 'bg-yellow-50');
                boardBody.appendChild(row);
            });
        }

        // 일반 공지를 렌더링합니다.
        notices.forEach((notice, index) => {
            // 페이지 번호에 맞춰 정확한 게시글 번호를 계산합니다.
            const noticeNumber = totalNormalNotices - ((currentPage - 1) * itemsPerPage) - index;
            const row = createRow(notice, noticeNumber);
            boardBody.appendChild(row);
        });

        if (stickyNotices.length === 0 && notices.length === 0) {
            boardBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">등록된 공지사항이 없습니다.</td></tr>`;
        }
    }

    // 받아온 페이지 정보로 하단 페이지 번호를 만드는 함수
    function renderPagination(data) {
        paginationContainer.innerHTML = '';
        const { totalPages, currentPage } = data;

        if (totalPages <= 1) return; // 페이지가 1개 이하면 페이지 번호를 표시하지 않음

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLink.classList.add('active'); // 현재 페이지는 다른 스타일 적용
            }
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (i !== currentPage) {
                    loadNotices(i); // 다른 페이지 번호를 클릭하면 해당 페이지 데이터 로드
                }
            });
            paginationContainer.appendChild(pageLink);
        }
    }
    
    // 테이블의 한 줄(row)을 만드는 함수
    function createRow(notice, number) {
        const tr = document.createElement('tr');
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

    // 페이지가 처음 열릴 때 1페이지를 불러옵니다.
    loadNotices(1);
});
