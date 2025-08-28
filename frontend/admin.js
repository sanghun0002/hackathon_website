// This script handles all the administrative functions for the booking management page.
document.addEventListener('DOMContentLoaded', async () => {
    // --- Authentication Check ---
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    if (!isAdminLoggedIn) {
        alert("관리자만 접근할 수 있는 페이지입니다. 로그인 페이지로 이동합니다.");
        window.location.href = 'admin-login.html'; // Redirect to the new login page
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

    let allBookings = []; // All booking data from the server
    let filteredBookings = []; // Filtered data for display
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // --- Fetch booking data from the backend API ---
    const fetchAllBookings = async () => {
        try {
            const response = await fetch(`${serverUrl}/api/bookings`);
            if (!response.ok) {
                throw new Error('Failed to fetch booking data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching booking data:', error);
            alert('예약 데이터를 불러오는 데 실패했습니다.');
            return [];
        }
    };

    // --- Dynamic Filter Options ---
    const getFilterOptions = (bookings) => {
        const regions = [...new Set(bookings.map(b => b.region))].sort();
        const valleys = [...new Set(bookings.map(b => b.valley))].sort();
        const sections = [...new Set(bookings.map(b => b.section))].sort();
        return { regions, valleys, sections };
    };

    const populateFilterOptions = (options) => {
        // ... (필터링 코드 유지)
    };

    const populateValleyOptions = (region) => {
        // ... (필터링 코드 유지)
    };
    
    const populateSectionOptions = (valley) => {
        // ... (필터링 코드 유지)
    };

    // --- Filtering and Rendering Logic ---
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
        currentPage = 1;
        renderTable();
        renderPagination();
    };

    const getStatusClass = (status) => {
        if (status === '예약 완료' || status === '예약 및 결제 완료') {
            return 'status-completed';
        }
        if (status === '사용 중') {
            return 'status-using';
        }
        return 'status-pending';
    };

    const renderTable = () => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToRender = filteredBookings.slice(start, end);

        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-gray-500">조건에 맞는 예약 내역이 없습니다.</td></tr>`;
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

        // ... (페이지네이션 코드 유지)
    };

    // --- 초기 설정 ---
    const init = async () => {
        tableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-500">예약 목록을 불러오는 중...</td></tr>';
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
