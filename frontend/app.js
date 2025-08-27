document.addEventListener('DOMContentLoaded', async () => {
    
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';

    // ===================================
    // ===== 상단 우측 공지사항 위젯 기능 =====
    // ===================================
    const noticeListWidget = document.getElementById('notice-list-widget');

    if (noticeListWidget) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notices`);
            if (!response.ok) throw new Error('데이터 로딩 실패');
            
            const data = await response.json();
            const allNotices = [...data.stickyNotices, ...data.notices];
            const latestNotices = allNotices.slice(0, 5);
            
            noticeListWidget.innerHTML = '';
            
            if (latestNotices.length === 0) {
                noticeListWidget.innerHTML = '<li>등록된 공지사항이 없습니다.</li>';
            } else {
                latestNotices.forEach(notice => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <a href="notice_detail.html?id=${notice.id}">${notice.title}</a>
                        <span class="date">${notice.date}</span>
                    `;
                    noticeListWidget.appendChild(listItem);
                });
            }

        } catch (error) {
            console.error('Error fetching notices for widget:', error);
            noticeListWidget.innerHTML = '<li>공지사항을 불러올 수 없습니다.</li>';
        }
    }

    // ===================================
    // ===== [추가] 하단 공지사항 섹션 기능 =====
    // ===================================
    const noticeListBottom = document.getElementById('notice-list-bottom');

    if (noticeListBottom) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/notices`);
            if (!response.ok) throw new Error('데이터 로딩 실패');
            
            const data = await response.json();
            const allNotices = [...data.stickyNotices, ...data.notices];
            const latestNotices = allNotices.slice(0, 5); // 하단에도 최신 5개 표시
            
            noticeListBottom.innerHTML = '';
            
            if (latestNotices.length === 0) {
                noticeListBottom.innerHTML = '<li>등록된 공지사항이 없습니다.</li>';
            } else {
                latestNotices.forEach(notice => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <a href="notice_detail.html?id=${notice.id}">${notice.title}</a>
                        <span class="date">${notice.date}</span>
                    `;
                    noticeListBottom.appendChild(listItem);
                });
            }

        } catch (error) {
            console.error('Error fetching notices for bottom section:', error);
            noticeListBottom.innerHTML = '<li>공지사항을 불러올 수 없습니다.</li>';
        }
    }

    // ===================================
    // ===== 사이드 메뉴 기능 =====
    // ===================================
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
        const toggleIcon = sidebar.querySelector('.sidebar-toggle i');
    
        sidebar.addEventListener('mouseenter', () => {
            toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left');
        });
    
        sidebar.addEventListener('mouseleave', () => {
            toggleIcon.classList.replace('fa-chevron-left', 'fa-chevron-right');
        });
    }

    // ===================================
    // ===== 히어로 섹션 슬라이더 기능 =====
    // ===================================
    const sliderWrapper = document.querySelector('.slider-wrapper');

    if (sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        let currentIndex = 0;
        const slideCount = slides.length;

        function goToSlide(index) {
            if (index < 0) {
                index = slideCount - 1;
            } else if (index >= slideCount) {
                index = 0;
            }
            sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
        }

        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

        setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
    }
});
