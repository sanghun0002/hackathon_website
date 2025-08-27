// 이 스크립트는 예약 관리 페이지의 모든 관리 기능을 처리합니다.
document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM 요소 가져오기 ---
    const filterDate = document.getElementById('filter-date');
    const filterValley = document.getElementById('filter-valley');
    const filterSection = document.getElementById('filter-section');
    const searchName = document.getElementById('search-name');
    const searchBtn = document.getElementById('search-btn');
    const totalBookingsSpan = document.getElementById('total-bookings');
    const tableBody = document.getElementById('booking-table-body');
    const paginationControls = document.getElementById('pagination-controls');

    // 서버 URL
    const serverUrl = 'https://o70albxd7n.onrender.com';

    let allBookings = []; // 서버에서 가져온 모든 예약 데이터
    let filteredBookings = []; // 필터링된 후 화면에 표시될 데이터
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // --- 서버에서 모든 예약 데이터 가져오기 ---
    const fetchAllBookings = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/bookings`);
            if (!response.ok) {
                throw new Error('예약 데이터를 가져오는 데 실패했습니다.');
            }
            return await response.json();
        } catch (error) {
            console.error('예약 데이터 가져오기 오류:', error);
            alert('예약 데이터를 불러오는 데 실패했습니다.');
            return []; // 오류 발생 시 빈 배열 반환
        }
    };

    // --- 필터 옵션 채우기 ---
    const populateValleyFilter = (bookings) => {
        filterValley.innerHTML = '<option value="">전체</option>';
        const valleys = [...new Set(bookings.map(b => b.valley))].sort();
        valleys.forEach(valley => {
            const opt = document.createElement('option');
            opt.value = valley;
            opt.textContent = valley;
            filterValley.appendChild(opt);
        });
    };
    
    const populateSectionOptions = (valley) => {
        filterSection.innerHTML = '<option value="">전체</option>';
        if (valley) {
            const sectionsInValley = [...new Set(allBookings.filter(b => b.valley === valley).map(b => b.section))].sort();
            sectionsInValley.forEach(section => {
                const opt = document.createElement('option');
                opt.value = section;
                opt.textContent = section;
                filterSection.appendChild(opt);
            });
            filterSection.disabled = false;
        } else {
            filterSection.disabled = true;
        }
    };

    // --- 필터링 및 렌더링 로직 ---
    const applyFilters = () => {
        const date = filterDate.value;
        const valley = filterValley.value;
        const section = filterSection.value;
        const name = searchName.value.toLowerCase();

        filteredBookings = allBookings.filter(booking => {
            const matchesDate = !date || booking.bookingDate === date;
            const matchesValley = !valley || booking.valley === valley;
            const matchesSection = !section || booking.section === section;
            const matchesName = !name || booking.name.toLowerCase().includes(name);
            return matchesDate && matchesValley && matchesSection && matchesName;
        });
        
        totalBookingsSpan.textContent = filteredBookings.length;
        currentPage = 1; // 필터 변경 시 첫 페이지로 리셋
        renderTable();
        renderPagination();
    };

    // 상태에 따라 CSS 클래스 이름을 반환하는 함수
    const getStatusClass = (status) => {
        if (status === '예약 및 결제 완료') {
            return 'status-completed';
        }
        if (status === '사용중') {
            return 'status-cancelled';
        }
        return 'status-pending'; // '대기' 또는 그 외의 경우
    };

    const renderTable = () => {
        tableBody.innerHTML = ''; // 테이블 비우기
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToRender = filteredBookings.slice(start, end);

        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-gray-500">예약 내역이 없습니다.</td></tr>`;
            return;
        }

        bookingsToRender.forEach(booking => {
            const row = document.createElement('tr');
            const status = booking.status || '대기';
            const statusClass = getStatusClass(status);

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.bookingDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.valley}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.section}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.deckName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="${statusClass}">${status}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const renderPagination = () => {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        if (totalPages <= 1) return;

        // 이전 버튼
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← 이전';
        prevBtn.disabled = currentPage === 1;
        prevBtn.className = 'px-3 py-1 mx-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            renderTable();
            renderPagination();
        });
        paginationControls.appendChild(prevBtn);

        // 페이지 번호 버튼
        const pageNumbers = Math.min(totalPages, 5);
        let startPage = Math.max(1, currentPage - Math.floor(pageNumbers / 2));
        let endPage = Math.min(totalPages, startPage + pageNumbers - 1);
        if (endPage - startPage + 1 < pageNumbers) {
            startPage = Math.max(1, endPage - pageNumbers + 1);
        }
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `px-3 py-1 mx-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-200 ${i === currentPage ? 'bg-blue-500 text-white' : ''}`;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
                renderPagination();
            });
            paginationControls.appendChild(pageBtn);
        }

        // 다음 버튼
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '다음 →';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.className = 'px-3 py-1 mx-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderTable();
            renderPagination();
        });
        paginationControls.appendChild(nextBtn);
    };

    // --- 초기 설정 ---
    const init = async () => {
        allBookings = await fetchAllBookings();
        populateValleyFilter(allBookings);
        applyFilters();
    };

    // --- 이벤트 리스너 ---
    filterDate.addEventListener('change', applyFilters);
    filterValley.addEventListener('change', () => {
        const selectedValley = filterValley.value;
        populateSectionOptions(selectedValley);
        applyFilters();
    });
    filterSection.addEventListener('change', applyFilters);
    searchBtn.addEventListener('click', applyFilters);
    searchName.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    init();
});
