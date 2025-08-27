document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');
    const submitButton = confirmForm.querySelector('button[type="submit"]');

    // --- 1. 예약 정보 불러오기 ---
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
            <p class="font-bold text-lg mt-2 pt-2 border-t"><strong>결제 금액:</strong> ${deck.price.toLocaleString()}원</p>
        </div>
    `;

    // --- 3. 아임포트 초기화 ---
    const IMP = window.IMP;
    IMP.init('imp02243407'); // 가맹점 식별코드

    // --- 4. 결제 및 예약 저장 ---
    confirmForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userName = document.getElementById('user-name').value;
        const userPhone = document.getElementById('user-phone').value;
        const amount = deck.price;

        submitButton.disabled = true;
        submitButton.textContent = "결제 처리 중...";

        // 아임포트 결제 호출
        IMP.request_pay({
            pg: "kakaopay",
            pay_method: "card",
            merchant_uid: "order_" + new Date().getTime(),
            name: `${valley} ${section} ${deck.name}`,
            amount: amount,
            buyer_name: userName,
            buyer_tel: userPhone,
        }, function (rsp) {
            if (rsp.success) {
                // --- 결제 성공 시 서버에 예약 저장 ---
                const newBooking = {
                    name: userName,
                    phone: userPhone,
                    bookingDate: date,
                    valley,
                    section,
                    deckName: deck.name,
                    capacity: deck.capacity,
                    price: deck.price,
                    paymentId: rsp.imp_uid,
                    status: "예약 완료"
                };

                const serverUrl = 'https://o70albxd7n.onrender.com';
                fetch(`${serverUrl}/api/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBooking),
                })
                .then(res => {
                    if (!res.ok) return res.json().then(err => { throw new Error(err.message || '서버 저장 실패') });
                    return res.json();
                })
                .then(data => {
                    localStorage.removeItem('selectedDate');
                    localStorage.removeItem('selectedValley');
                    localStorage.removeItem('selectedSection');
                    localStorage.removeItem('selectedDeck');

                    confirmForm.classList.add('hidden');
                    document.getElementById('success-message').classList.remove('hidden');
                })
                .catch(err => {
                    console.error(err);
                    alert(`결제는 완료됐지만 예약 저장 중 오류 발생: ${err.message}`);
                    submitButton.disabled = false;
                    submitButton.textContent = "결제하기";
                });
            } else {
                alert("결제 실패: " + rsp.error_msg);
                submitButton.disabled = false;
                submitButton.textContent = "결제하기";
            }
        });
    });
});
