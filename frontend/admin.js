// This script handles all the administrative functions for the booking management page.
document.addEventListener('DOMContentLoaded', async () => {
    // --- Get DOM elements ---
    const filterDate = document.getElementById('filter-date');
    const filterRegion = document.getElementById('filter-region');
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
    
    // --- Mock Data (Replace this with real API call) ---
    // This function simulates fetching data from a server.
    const fetchAllBookings = async () => {
        // In a real application, you would make a fetch call here:
        // const response = await fetch('/api/admin/bookings');
        // const data = await response.json();
        // return data;

        // Mock data for demonstration
        return [
            { bookingDate: "2025-08-27", region: "경상북도", valley: "무흘 계곡", section: "제1곡 봉비암", deckName: "평상 1", name: "홍길동", phone: "010-1234-5678", status: "사용중" },
            { bookingDate: "2025-08-28", region: "경상북도", valley: "무흘 계곡", section: "제1곡 봉비암", deckName: "평상 2", name: "김철수", phone: "010-9876-5432", status: "대기" },
            { bookingDate: "2025-08-27", region: "경상북도", valley: "무흘 계곡", section: "제2곡 한강대", deckName: "평상 1", name: "이영희", phone: "010-1111-2222", status: "사용중" },
            { bookingDate: "2025-08-29", region: "경상북도", valley: "삼계리 계곡", section: "삼계리 1구역", deckName: "평상 3", name: "박민준", phone: "010-3333-4444", status: "대기" },
            { bookingDate: "2025-08-27", region: "경기도", valley: "송추 계곡", section: "1구역", deckName: "평상 2", name: "최은지", phone: "010-5555-6666", status: "대기" },
            { bookingDate: "2025-08-28", region: "경기도", valley: "송추 계곡", section: "1구역", deckName: "평상 1", name: "강현우", phone: "010-7777-8888", status: "사용중" },
            { bookingDate: "2025-08-29", region: "경기도", valley: "용추 계곡", section: "A구역", deckName: "평상 1", name: "서지민", phone: "010-9999-0000", status: "대기" },
            // Add more mock data for pagination testing
            { bookingDate: "2025-08-27", region: "경상북도", valley: "무흘 계곡", section: "제1곡 봉비암", deckName: "평상 3", name: "장민지", phone: "010-1234-1234", status: "대기" },
            { bookingDate: "2025-08-28", region: "경상북도", valley: "무흘 계곡", section: "제2곡 한강대", deckName: "평상 2", name: "오동민", phone: "010-5678-5678", status: "대기" },
            { bookingDate: "2025-08-29", region: "경상북도", valley: "삼계리 계곡", section: "삼계리 1구역", deckName: "평상 1", name: "김동건", phone: "010-1122-3344", status: "사용중" },
            { bookingDate: "2025-08-29", region: "경기도", valley: "어비 계곡", section: "B구역", deckName: "평상 1", name: "유재석", phone: "010-4455-6677", status: "대기" },
            { bookingDate: "2025-08-29", region: "경기도", valley: "어비 계곡", section: "B구역", deckName: "평상 2", name: "노홍철", phone: "010-8899-0011", status: "대기" },
            { bookingDate: "2025-08-29", region: "강원도", valley: "무릉 계곡", section: "1구역", deckName: "평상 4", name: "박명수", phone: "010-2233-4455", status: "대기" },
            { bookingDate: "2025-08-29", region: "강원도", valley: "흥정 계곡", section: "A구역", deckName: "평상 1", name: "정준하", phone: "010-6677-8899", status: "대기" }
        ];
    };

    // --- Dynamic Filter Options (Simulated) ---
    const getFilterOptions = (bookings) => {
        const regions = [...new Set(bookings.map(b => b.region))].sort();
        const valleys = [...new Set(bookings.map(b => b.valley))].sort();
        const sections = [...new Set(bookings.map(b => b.section))].sort();
        return { regions, valleys, sections };
    };

    const populateFilterOptions = (options) => {
        // Clear existing options
        filterRegion.innerHTML = '<option value="">전체</option>';
        options.regions.forEach(region => {
            const opt = document.createElement('option');
            opt.value = region;
            opt.textContent = region;
            filterRegion.appendChild(opt);
        });
        
        filterValley.innerHTML = '<option value="">전체</option>';
        filterSection.innerHTML = '<option value="">전체</option>';
        filterValley.disabled = true;
        filterSection.disabled = true;
    };

    const populateValleyOptions = (region) => {
        filterValley.innerHTML = '<option value="">전체</option>';
        if (region) {
            const valleysInRegion = [...new Set(allBookings.filter(b => b.region === region).map(b => b.valley))].sort();
            valleysInRegion.forEach(valley => {
                const opt = document.createElement('option');
                opt.value = valley;
                opt.textContent = valley;
                filterValley.appendChild(opt);
            });
            filterValley.disabled = false;
        } else {
            filterValley.disabled = true;
        }
        filterSection.disabled = true;
        filterSection.innerHTML = '<option value="">전체</option>';
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
        const region = filterRegion.value;
        const valley = filterValley.value;
        const section = filterSection.value;
        const name = searchName.value.toLowerCase();

        filteredBookings = allBookings.filter(booking => {
            const matchesDate = !date || booking.bookingDate === date;
            const matchesRegion = !region || booking.region === region;
            const matchesValley = !valley || booking.valley === valley;
            const matchesSection = !section || booking.section === section;
            const matchesName = !name || booking.name.toLowerCase().includes(name);
            return matchesDate && matchesRegion && matchesValley && matchesSection && matchesName;
        });
        
        totalBookingsSpan.textContent = filteredBookings.length;
        currentPage = 1; // Reset to first page on filter change
        renderTable();
        renderPagination();
    };

    const renderTable = () => {
        tableBody.innerHTML = ''; // Clear table
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const bookingsToRender = filteredBookings.slice(start, end);

        if (bookingsToRender.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="py-4 text-center text-gray-500">예약 내역이 없습니다.</td></tr>`;
            return;
        }

        bookingsToRender.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.bookingDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.region}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.valley}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.section}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.deckName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="status-badge status-${booking.status ? booking.status.replace(/\s/g, '').toLowerCase() : 'pending'}">${booking.status || '대기'}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const renderPagination = () => {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        if (totalPages <= 1) return;

        // Previous button
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

        // Page number buttons
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

        // Next button
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
        allBookings = await fetchAllBookings();
        const filterOptions = getFilterOptions(allBookings);
        populateFilterOptions(filterOptions);
        applyFilters();
    };

    // --- Event Listeners ---
    filterDate.addEventListener('change', applyFilters);
    filterRegion.addEventListener('change', () => {
        const selectedRegion = filterRegion.value;
        populateValleyOptions(selectedRegion);
        applyFilters();
    });
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