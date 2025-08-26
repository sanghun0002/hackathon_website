document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');

    // --- 1. 예약 정보 불러오기 (가격 부분 삭제) ---
    const date = localStorage.getItem('selectedDate');
    const valley = localStorage.getItem('selectedValley');
    const section = localStorage.getItem('selectedSection');
    const deckString = localStorage.getItem('selectedDeck');
    // 삭제: const price = localStorage.getItem('selectedPrice');

    // 필수 정보 체크 (가격 부분 삭제)
    if (!date || !valley || !section || !deckString) {
        alert('예약 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.');
        window.location.href = 'booking.html';
        return;
    }

    const deck = JSON.parse(deckString);

    // --- 2. 불러온 정보를 화면에 표시 (가격 부분 삭제) ---
    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
        </div>
    `;

    // --- 3. 최종 정보 저장 (가격 부분 삭제) ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;

        const allBookings = JSON.parse(localStorage.getItem('finalBookings')) || [];

        // 새로운 예약 객체 생성 (가격 부분 삭제)
        const newBooking = {
            id: Date.now(),
            name: userName,
            phone: userPhone,
            date: date,
            valley: valley,
            section: section,
            deckName: deck.name,
            status: "예약 완료"
        };

        allBookings.push(newBooking);
        localStorage.setItem('finalBookings', JSON.stringify(allBookings));

        // 임시 데이터 삭제 (가격 부분 삭제)
        localStorage.removeItem('selectedDate');
        localStorage.removeItem('selectedValley');
        localStorage.removeItem('selectedSection');
        localStorage.removeItem('selectedDeck');
        // 삭제: localStorage.removeItem('selectedPrice');

        alert('예약이 성공적으로 완료되었습니다.');
        window.location.href = 'booking-complete.html';
    });
});
