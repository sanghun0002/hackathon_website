// This script handles all the administrative functions for the booking management page.
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
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    // Server URL
    const serverUrl = 'https://o70albxd7n.onrender.com';

    let allBookings = [];
    let filteredBookings = [];
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
            alert('예약 데이터를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.');
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
        const lowerCaseStatus = status ? status.toLowerCase() : 'pending';
        if (lowerCaseStatus.includes('완료')) {
            return 'completed';
        }
        if (lowerCaseStatus.includes('사용중')) {
            return 'using';
        }
        return 'pending';
    };

    const renderTable = () => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToRender = filteredBookings.slice(start, end);

        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-gray-500">조건에 맞는 예약 내역이 없습니다.</td></tr>`;
            return;
        }

        bookingsToRender.forEach(booking => {
            const row = document.createElement('tr');
            const status = booking.status || '대기';
            const statusClass = getStatusClass(status);

            // [수정] data-id에 booking.id만 할당합니다.
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input type="checkbox" class="booking-checkbox" data-id="${booking.id}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.bookingDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.valley}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.section}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.deckName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="status-badge status-${statusClass}">${status}</span>
                </td>
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

    const deleteBookings = async (ids) => {
        if (ids.length === 0) {
            alert('삭제할 예약 내역을 선택해주세요.');
            return;
        }

        if (!confirm(`${ids.length}개의 예약 내역을 정말로 삭제하시겠습니까?`)) {
            return;
        }

        const password = prompt("삭제를 위해 관리자 비밀번호를 다시 입력하세요.");
        if (password !== ADMIN_PASSWORD) {
            alert("비밀번호가 올바르지 않아 삭제할 수 없습니다.");
            return;
        }
        
        const deletePromises = ids.map(id => {
            // [수정] 백엔드 API는 id를 받으므로, id만 전달합니다.
            return fetch(`${serverUrl}/api/bookings/cancel/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
        });

        try {
            const responses = await Promise.all(deletePromises);
            const successfulDeletions = responses.filter(r => r.ok).length;
            
            if (successfulDeletions > 0) {
                alert(`${successfulDeletions}개의 예약 내역을 삭제했습니다.`);
                await init();
            } else {
                alert('예약 내역 삭제에 실패했습니다. 서버 로그를 확인해주세요.');
            }
        } catch (error) {
            console.error('예약 삭제 중 오류 발생:', error);
            alert('예약 삭제에 실패했습니다.');
        }
    };
    
    // --- Initial setup ---
    const init = async () => {
        tableBody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-gray-500">예약 목록을 불러오는 중...</td></tr>';
        allBookings = await fetchAllBookings();
        populateValleyFilter(allBookings);
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
    deleteSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.booking-checkbox:checked');
        const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);

        if (idsToDelete.length === 0) {
            alert('삭제할 예약 내역을 선택해주세요.');
            return;
        }
        
        deleteBookings(idsToDelete);
    });
    
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.booking-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    init();
});
