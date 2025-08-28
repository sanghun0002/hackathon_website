document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');

    // URL 파라미터에서 이전 단계 정보들을 읽어옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const valley = urlParams.get('valley');
    const section = urlParams.get('section');
    const deckString = urlParams.get('deck');

    // 필수 정보가 하나라도 없으면 오류 처리
    if (!date || !valley || !section || !deckString) {
        alert('예약 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.');
        window.location.href = 'booking.html';
        return;
    }

    // ✅ [수정된 부분] 불필요한 decodeURIComponent()를 제거했습니다.
    const deck = JSON.parse(deckString);

    // 화면에 요약 정보 표시
    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
        </div>
    `;

    // 폼 제출 시, 결제 페이지로 모든 정보를 URL에 담아 전달합니다.
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;

        if (!name || !phone) {
            alert('예약자 이름과 전화번호를 모두 입력해주세요.');
            return;
        }
        
        // 다음 페이지로 전달할 모든 정보를 URL 파라미터로 만듭니다.
        const nextUrlParams = new URLSearchParams({
            date: date,
            valley: valley,
            section: section,
            deck: deckString, // deck 정보는 이미 인코딩 되어 있으므로 그대로 사용
            name: name,
            phone: phone
        });

        // 결제 페이지로 이동
        window.location.href = `booking-payment.html?${nextUrlParams.toString()}`;
    });
});
