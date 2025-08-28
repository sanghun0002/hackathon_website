// This script handles the display and filtering of completed booking history.
document.addEventListener('DOMContentLoaded', async () => {
    // --- Authentication Check ---
    const ADMIN_PASSWORD = '123456'; 
    const password = prompt("관리자 비밀번호를 입력하세요.");

    if (password !== ADMIN_PASSWORD) {
        document.body.innerHTML = '<div class="flex items-center justify-center min-h-screen text-center text-gray-500 font-bold">관리자만 접근할 수 있는 페이지입니다.</div>';
        alert("비밀번호가 올바르지 않습니다.");
        return;
    }
    
    // --- Get DOM elements ---
    const filterDate = document.getElementById('filter-date');
    const filterValley = document.getElementById('filter-valley');
    const filterSection = document.getElementById('filter-section');
    const searchName = document.getElementById('search-name');
    const searchBtn = document.getElementById('search-btn');
    const totalBookingsSpan = document.getElementById('total-bookings');
    const tableBody = document.getElementById('booking-table-body');
    const paginationControls = document.getElementById('pagination-controls');

    // Server URL
    const serverUrl = 'https://o70albxd7n.onrender.com';

    let allCompletedBookings = [];
    let filteredBookings = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // --- Fetch completed booking data with improved error handling ---
    const fetchAllCompletedBookings = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20초 타임아웃 설정

        try {
            const response = await fetch(`${serverUrl}/api/bookings/completed`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.length === 0) {
                console.info("데이터 로딩 성공: 서버에 저장된 완료 내역이 없습니다.");
            }
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error('Fetch timed out.');
                alert('서버 응답이 지연되고 있습니다. 잠시 후 새로고침하여 다시 시도해 주세요. Render 서버의 경우, 첫 요청에 시간이 걸릴 수 있습니다.');
            } else {
                console.error('Error fetching completed booking data:', error);
                alert('완료된 예약 데이터를 불러오는 데 실패했습니다. 서버 상태 및 로그를 확인해주세요.');
            }
            return [];
        }
    };

    // --- Dynamic Filter Options ---
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
            const sectionsInValley = [...new Set(allCompletedBookings.filter(b => b.valley === valley).map(b => b.section))].sort();
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

    // --- Filtering and Rendering Logic ---
    const applyFilters = () => {
        const date = filterDate.value;
        const valley = filterValley.value;
        const section = filterSection.value;
        const name = searchName.value.toLowerCase();

        filteredBookings = allCompletedBookings.filter(booking => {
            const matchesDate = !date || booking.bookingDate === date;
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
            const completedTime = booking.completedAt ? new Date(booking.completedAt).toLocaleString('ko-KR') : 'N/A';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.bookingDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.valley}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.section}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.deckName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="status-badge status-completed">${status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${completedTime}</td>
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
                renderPagination();
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
    
    // --- Initial setup ---
    const init = async () => {
        tableBody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-gray-500">완료 내역을 불러오는 중...</td></tr>';
        allCompletedBookings = await fetchAllCompletedBookings();
        populateValleyFilter(allCompletedBookings);
        applyFilters();
    };

    // --- Event Listeners ---
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
