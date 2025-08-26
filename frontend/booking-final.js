document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');

    // --- 1. 페이지 로드 시, 이전 단계에서 저장된 예약 정보 불러오기 ---
    const date = localStorage.getItem('selectedDate');
    const valley = localStorage.getItem('selectedValley');
    const section = localStorage.getItem('selectedSection');
    const deckString = localStorage.getItem('selectedDeck');
    const price = localStorage.getItem('selectedPrice');

    // 필수 정보가 하나라도 없으면 오류 처리 후 첫 페이지로 이동
    if (!date || !valley || !section || !deckString || !price) {
        alert('예약 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.');
        window.location.href = 'booking.html';
        return; // 코드 실행 중단
    }

    const deck = JSON.parse(deckString); // JSON 문자열을 객체로 변환

    // --- 2. 불러온 정보를 화면에 요약하여 표시 ---
    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
            <p class="text-lg font-bold mt-4"><strong>가격:</strong> ${Number(price).toLocaleString()}원</p>
        </div>
    `;

    // --- 3. '예약 완료하기' 버튼 클릭 시 최종 정보 저장 ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 방지

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;

        // a. 기존에 저장된 전체 예약 목록을 불러옵니다. (없으면 빈 배열로 시작)
        const allBookings = JSON.parse(localStorage.getItem('finalBookings')) || [];

        // b. 이번 예약을 위한 새로운 객체를 생성합니다.
        const newBooking = {
            id: Date.now(), // 각 예약을 구별하기 위한 고유 ID
            name: userName,
            phone: userPhone,
            date: date,
            valley: valley,
            section: section,
            deckName: deck.name,
            price: price,
            status: "예약 완료" // 예약 상태 추가
        };

        // c. 새로운 예약을 기존 목록에 추가합니다.
        allBookings.push(newBooking);

        // d. 추가된 최신 목록을 다시 localStorage에 저장합니다.
        localStorage.setItem('finalBookings', JSON.stringify(allBookings));

        // e. 예약 과정에서 사용했던 임시 데이터들을 삭제합니다.
        localStorage.removeItem('selectedDate');
        localStorage.removeItem('selectedValley');
        localStorage.removeItem('selectedSection');
        localStorage.removeItem('selectedDeck');
        localStorage.removeItem('selectedPrice');

        // f. 모든 과정이 끝났으므로 예약 완료 페이지로 이동합니다.
        alert('예약이 성공적으로 완료되었습니다.');
        window.location.href = 'booking-complete.html'; // 예약 완료 페이지
    });
});
