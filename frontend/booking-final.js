document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');
    const submitButton = confirmForm.querySelector('button[type="submit"]');

    // --- 1. 페이지 로드 시, 이전 단계에서 저장된 예약 정보 불러오기 ---
    const date = localStorage.getItem('selectedDate');
    const valley = localStorage.getItem('selectedValley');
    const section = localStorage.getItem('selectedSection');
    const deckString = localStorage.getItem('selectedDeck');
    // 가격 정보도 가져오도록 booking-step4.js가 수정되었다고 가정합니다.
    const price = localStorage.getItem('selectedPrice') || '가격 정보 없음'; 

    // 필수 정보가 하나라도 없으면 오류 처리 후 첫 페이지로 이동
    if (!date || !valley || !section || !deckString) {
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

    // --- 3. '예약 완료하기' 버튼 클릭 시 백엔드로 데이터 전송 ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 방지
        submitButton.disabled = true; // 중복 클릭 방지
        submitButton.textContent = "예약 처리 중...";

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;

        // a. 백엔드로 전송할 최종 예약 객체를 생성합니다.
        const newBooking = {
            name: userName,
            phone: userPhone,
            bookingDate: date,
            valley,
            section,
            deckName: deck.name,
            capacity: deck.capacity,
            price: Number(price),
            status: "예약 완료" // 초기 상태
        };

        // b. fetch API를 사용하여 백엔드로 데이터를 전송합니다.
        //    서버 주소는 실제 운영 환경에 맞게 변경해야 합니다. (예: 'https://your-domain.com/api/bookings')
        fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBooking),
        })
        .then(response => {
            if (!response.ok) {
                // 서버에서 4xx, 5xx 등 에러 응답을 보냈을 경우
                return response.json().then(err => { throw new Error(err.message || '서버 응답에 문제가 발생했습니다.') });
            }
            return response.json(); // 성공 응답을 JSON으로 파싱
        })
        .then(data => {
            // c. 성공적으로 서버에 저장된 후
            console.log('서버로부터 받은 응답:', data);
            
            // d. 예약 과정에서 사용했던 임시 데이터들을 삭제합니다.
            localStorage.removeItem('selectedDate');
            localStorage.removeItem('selectedValley');
            localStorage.removeItem('selectedSection');
            localStorage.removeItem('selectedDeck');
            localStorage.removeItem('selectedPrice');

            // e. 모든 과정이 끝났으므로 예약 완료 페이지로 이동합니다.
            alert('예약이 성공적으로 완료되었습니다.');
            window.location.href = 'booking-complete.html'; // 예약 완료 페이지
        })
        .catch(error => {
            // f. 네트워크 오류나 서버 에러 발생 시
            console.error('예약 처리 중 오류 발생:', error);
            alert(`예약에 실패했습니다: ${error.message}`);
            submitButton.disabled = false; // 버튼 다시 활성화
            submitButton.textContent = "예약 완료하기";
        });
    });
});
