document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');

    // --- 1. 기존 예약 정보 불러오기 ---
    const date = localStorage.getItem('selectedDate');
    const valley = localStorage.getItem('selectedValley');
    const section = localStorage.getItem('selectedSection');
    const deckString = localStorage.getItem('selectedDeck');

    if (!date || !valley || !section || !deckString) {
        alert('예약 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.');
        window.location.href = 'booking.html';
        return;
    }

    const deck = JSON.parse(deckString);

    // --- 2. 화면에 요약 정보 표시 ---
    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
        </div>
    `;

    // --- 3. [수정됨] 폼 제출 시, 이름/전화번호를 localStorage에 저장하고 결제 페이지로 이동 ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;

        // 이름과 전화번호도 localStorage에 임시 저장
        localStorage.setItem('userName', userName);
        localStorage.setItem('userPhone', userPhone);

        // 서버 저장이 아닌, 결제 페이지로 이동
        window.location.href = 'booking-payment.html';
    });
});
