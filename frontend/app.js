document.addEventListener('DOMContentLoaded', async () => {
    
    const API_BASE_URL = 'https://o70albxd7n.onrender.com';

    // ===================================
    // ===== 공지사항 미리보기 위젯 기능 =====
    // ===================================
    const noticeListWidget = document.getElementById('notice-list-widget');

    if (noticeListWidget) {
        try {
            // 1페이지 데이터만 가져오면 최신 10개(고정 포함)를 얻을 수 있습니다.
            const response = await fetch(`${API_BASE_URL}/api/notices?page=1`);
            if (!response.ok) throw new Error('데이터 로딩 실패');
            
            const data = await response.json();
            
            // [문제 해결] 이제 서버는 'notices' 배열 하나만 보냅니다.
            // 이 배열에 고정 공지가 이미 포함되어 있으므로 바로 사용합니다.
            const latestNotices = data.notices.slice(0, 5); // 5개만 잘라서 표시
            
            noticeListWidget.innerHTML = '';
            
            if (latestNotices.length === 0) {
                noticeListWidget.innerHTML = '<li>등록된 공지사항이 없습니다.</li>';
            } else {
                latestNotices.forEach(notice => {
                    const listItem = document.createElement('li');
                    
                    // [문제 해결] 날짜 필드명을 'date'에서 'created_at'으로 수정
                    const formattedDate = new Date(notice.created_at).toLocaleDateString();

                    listItem.innerHTML = `
                        <a href="notice_detail.html?id=${notice.id}">${notice.title}</a>
                        <span class="date">${formattedDate}</span>
                    `;
                    noticeListWidget.appendChild(listItem);
                });
            }
        } catch (error) {
            console.error('Error fetching notices for widget:', error);
            noticeListWidget.innerHTML = '<li>공지사항을 불러올 수 없습니다.</li>';
        }
    }

    // =======================================================
    // ===== 후기 슬라이더 기능 (Swiper.js 연동) =====
    // =======================================================
    const reviewSliderWrapper = document.getElementById('review-slider-wrapper');

    if (reviewSliderWrapper) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`);
            if (!response.ok) throw new Error('후기 데이터 로딩 실패');
            
            const data = await response.json();
            const latestReviews = data.reviews.slice(0, 7);
            
            reviewSliderWrapper.innerHTML = ''; 
            
            if (latestReviews.length === 0) {
                reviewSliderWrapper.innerHTML = `
                    <div class="swiper-slide">
                        <div class="review-slider-card">등록된 후기가 없습니다.</div>
                    </div>`;
            } else {
                const renderStars = (rating) => '⭐'.repeat(rating);
                latestReviews.forEach(review => {
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    
                    slide.innerHTML = `
                        <div class="review-slider-card">
                            <div>
                                <div class="rating">${renderStars(review.rating)}</div>
                                <a href="review_detail.html?id=${review.id}" class="title">${review.title}</a>
                                <p class="content">${review.content.substring(0, 80)}...</p>
                            </div>
                            <p class="author">- ${review.author}님</p>
                        </div>
                    `;
                    reviewSliderWrapper.appendChild(slide);
                });

                // 모든 슬라이드가 추가된 후 Swiper 초기화
                const swiper = new Swiper('.review-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    loop: latestReviews.length > 2,
                    breakpoints: {
                        768: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 3, spaceBetween: 30 }
                    },
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                });
            }
        } catch (error) {
            console.error('Error fetching reviews for slider:', error);
            reviewSliderWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="review-slider-card">후기를 불러올 수 없습니다.</div>
                </div>`;
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
