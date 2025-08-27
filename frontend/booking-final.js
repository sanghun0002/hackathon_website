document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');
    const submitButton = confirmForm.querySelector('button[type="submit"]');

    // --- 1. 예약 정보 불러오기 (가격 관련 코드 없음) ---
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

    // --- 2. 화면에 요약 정보 표시 (가격 관련 코드 없음) ---
    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
        </div>
    `;

    // --- 3. 백엔드로 데이터 전송 (가격 관련 코드 없음) ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = "예약 처리 중...";

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;

        // a. 백엔드로 전송할 객체 (가격 속성 없음)
        const newBooking = {
            name: userName,
            phone: userPhone,
            bookingDate: date,
            valley,
            section,
            deckName: deck.name,
            capacity: deck.capacity,
            status: "예약 완료"
        };

        const serverUrl = 'https://o70albxd7n.onrender.com';
        const fetchUrl = `${serverUrl}/api/bookings`;

        fetch(fetchUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || '서버 응답 오류') });
            }
            return response.json();
        })
        .then(data => {
            // b. 임시 데이터 삭제 (가격 관련 코드 없음)
            localStorage.removeItem('selectedDate');
            localStorage.removeItem('selectedValley');
            localStorage.removeItem('selectedSection');
            localStorage.removeItem('selectedDeck');

            alert('예약이 성공적으로 완료되었습니다.');
            window.location.href = 'booking-complete.html';
        })
        .catch(error => {
            console.error('예약 처리 중 오류 발생:', error);
            alert(`예약에 실패했습니다: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = "예약 완료하기";
        });
    });
});
