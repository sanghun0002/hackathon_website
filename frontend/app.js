document.addEventListener('DOMContentLoaded', async () => {
    
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';

    // ===================================
    // ===== 공지사항 미리보기 위젯 기능 =====
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
    // ===== [추가] 후기 미리보기 위젯 기능 =====
    // ===================================
    const reviewListWidget = document.getElementById('review-list-widget');

    if (reviewListWidget) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`);
            if (!response.ok) throw new Error('후기 데이터 로딩 실패');
            
            const data = await response.json();
            const latestReviews = data.reviews.slice(0, 5); // 최신 5개 후기만 선택
            
            reviewListWidget.innerHTML = ''; // 기존 내용 비우기
            
            if (latestReviews.length === 0) {
                reviewListWidget.innerHTML = '<li>등록된 후기가 없습니다.</li>';
            } else {
                const renderStars = (rating) => '⭐'.repeat(rating); // 별점 표시 함수
                latestReviews.forEach(review => {
                    const listItem = document.createElement('li');
                    // 후기 목록 항목 스타일링 (제목, 작성자, 별점)
                    listItem.innerHTML = `
                        <a href="review_detail.html?id=${review.id}">${review.title}</a>
                        <div class="review-meta">
                            <span class="author">${review.author}</span>
                            <span class="rating">${renderStars(review.rating)}</span>
                        </div>
                    `;
                    reviewListWidget.appendChild(listItem);
                });
            }
        } catch (error) {
            console.error('Error fetching reviews for widget:', error);
            reviewListWidget.innerHTML = '<li>후기를 불러올 수 없습니다.</li>';
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
            if (index < 0) index = slideCount - 1;
            else if (index >= slideCount) index = 0;
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
