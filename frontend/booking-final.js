document.addEventListener('DOMContentLoaded', () => {
    const summaryDiv = document.getElementById('final-booking-summary');
    const confirmForm = document.getElementById('confirm-form');
    const serverUrl = 'https://o70albxd7n.onrender.com';

    // [수정] localStorage 대신 URL 파라미터에서 정보를 읽어옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const valley = urlParams.get('valley');
    const section = urlParams.get('section');
    const deckString = urlParams.get('deck');

    if (!date || !valley || !section || !deckString) {
        alert('예약 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.');
        window.location.href = 'booking.html';
        return;
    }

    // deck 정보는 URL 인코딩 되어 있으므로 decode 후 JSON 파싱
    const deck = JSON.parse(decodeURIComponent(deckString));

    summaryDiv.innerHTML = `
        <h2 class="text-xl font-semibold mb-4 border-b pb-2">예약하실 내역</h2>
        <div class="space-y-2">
            <p><strong>날짜:</strong> ${date}</p>
            <p><strong>계곡:</strong> ${valley}</p>
            <p><strong>구역:</strong> ${section}</p>
            <p><strong>평상:</strong> ${deck.name} (수용인원: ${deck.capacity}인)</p>
        </div>
    `;

    // [수정] 폼 제출 시, 백엔드 서버로 예약 정보를 전송합니다.
    confirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('user-name').value;
        const phone = document.getElementById('user-phone').value;
        const submitBtn = confirmForm.querySelector('button[type="submit"]');

        if (!name || !phone) {
            alert('예약자 이름과 전화번호를 모두 입력해주세요.');
            return;
        }

        const bookingData = {
            name,
            phone,
            bookingDate: date,
            valley,
            section,
            deckName: deck.name,
            capacity: deck.capacity,
            status: '예약 완료'
        };
        
        submitBtn.disabled = true;
        submitBtn.textContent = '예약 처리 중...';

        try {
            const response = await fetch(`${serverUrl}/api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '예약에 실패했습니다.');
            }
            
            alert('예약이 성공적으로 완료되었습니다! 예약 확인 페이지로 이동합니다.');
            window.location.href = 'booking-check.html';

        } catch (error) {
            console.error('예약 처리 중 오류 발생:', error);
            alert(`오류가 발생했습니다: ${error.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = '예약 확정 및 결제';
        }
    });
});
