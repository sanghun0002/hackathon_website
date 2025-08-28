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

    // --- 서버 URL 및 상태 변수 ---
    const serverUrl = 'https://o70albxd7n.onrender.com';
    let allBookings = [];
    let filteredBookings = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // --- 완료 및 취소된 예약 데이터 가져오기 ---
    const fetchAllClosedBookings = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/bookings/completed`);
            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            alert('데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.');
            return [];
        }
    };

    // --- 필터 옵션 동적 생성 ---
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
            // [수정] 날짜 필터링이 정상적으로 동작하도록 시간 값을 제외하고 비교
            const matchesDate = !date || (booking.booking_date && booking.booking_date.split('T')[0] === date);
            const matchesValley = !valley || booking.valley === valley;
            const matchesSection = !section || booking.section === section;
            const matchesName = !name || booking.name.toLowerCase().includes(name);
            return matchesDate && matchesValley && matchesSection && matchesName;
        });
        
        totalBookingsSpan.textContent = filteredBookings.length;
        currentPage = 1;
        renderTable();
        renderPagination();
    };

    const renderTable = () => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToRender = filteredBookings.slice(start, end);

        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-gray-500">조건에 맞는 내역이 없습니다.</td></tr>`;
            return;
        }

        bookingsToRender.forEach(booking => {
            const row = document.createElement('tr');
            const status = booking.status || '알 수 없음';
            
            // [수정] 처리 일시가 'N/A'로 나오지 않도록 한국 시간 형식으로 변환
            const processTime = booking.completed_at 
                ? new Date(booking.completed_at).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                : (booking.created_at ? new Date(booking.created_at).toLocaleString('ko-KR') : 'N/A'); // 취소된 경우 created_at을 사용
            
            let statusBadgeClass = 'bg-gray-100 text-gray-800';
            if (status === '반납 완료') {
                statusBadgeClass = 'bg-blue-100 text-blue-800';
            } else if (status === '예약 취소') {
                statusBadgeClass = 'bg-red-100 text-red-800';
            }
            
            // [수정] 예약 날짜가 시간 없이 깔끔하게 나오도록 수정
            const displayDate = booking.booking_date ? booking.booking_date.split('T')[0] : '';

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${displayDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.valley}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.section}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.deck_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${processTime}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    const renderPagination = () => {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        if (totalPages <= 1) return;

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

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `px-3 py-1 mx-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-200 ${i === currentPage ? 'bg-blue-500 text-white' : ''}`;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationControls.appendChild(pageBtn);
        }

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
    
    // --- 초기화 함수 ---
    const init = async () => {
        tableBody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-gray-500">완료/취소 내역을 불러오는 중...</td></tr>';
        allBookings = await fetchAllClosedBookings();
        populateValleyFilter(allBookings);
        applyFilters();
    };

    // --- 이벤트 리스너 설정 ---
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
