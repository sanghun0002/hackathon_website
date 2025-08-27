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

    // =======================================================
    // ===== [신규] 후기 슬라이더 기능 (Swiper.js 연동) =====
    // =======================================================
    const reviewSliderWrapper = document.getElementById('review-slider-wrapper');

    if (reviewSliderWrapper) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews`);
            if (!response.ok) throw new Error('후기 데이터 로딩 실패');
            
            const data = await response.json();
            const latestReviews = data.reviews.slice(0, 7); // 슬라이더용으로 7개 정도 가져오기
            
            reviewSliderWrapper.innerHTML = ''; // 로딩 메시지 비우기
            
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
                    
                    // 카드 내용 생성
                    slide.innerHTML = `
                        <div class="review-slider-card">
                            <div>
                                <div class="rating">${renderStars(review.rating)}</div>
                                <h4 class="title">${review.title}</h4>
                                <p class="content">${review.content.substring(0, 100)}...</p>
                            </div>
                            <p class="author">- ${review.author}님</p>
                        </div>
                    `;
                    reviewSliderWrapper.appendChild(slide);
                });

                // 모든 슬라이드가 추가된 후 Swiper 초기화
                const swiper = new Swiper('.review-swiper', {
                    // 옵션
                    slidesPerView: 1, // 한 번에 1개의 슬라이드 보이기
                    spaceBetween: 30, // 슬라이드 사이 여백
                    loop: true, // 무한 루프
                    
                    // 화면 크기에 따른 반응형 설정
                    breakpoints: {
                        // 768px 이상일 때
                        768: {
                          slidesPerView: 2,
                          spaceBetween: 20
                        },
                        // 1024px 이상일 때
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 30
                        }
                    },
                    
                    // 네비게이션 버튼
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

    // (기존 사이드 메뉴, 히어로 슬라이더 기능은 변경 없이 그대로 유지됩니다)
    // ...
});
