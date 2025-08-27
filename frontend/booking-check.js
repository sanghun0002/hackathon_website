document.addEventListener('DOMContentLoaded', () => {
    const checkForm = document.getElementById('check-form');
    const resultContainer = document.getElementById('check-result-container');
    const resultDiv = document.getElementById('check-result');
    const submitButton = checkForm.querySelector('button[type="submit"]');

    checkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('check-name').value;
        const phone = document.getElementById('check-phone').value;

        if (!name || !phone) {
            alert('이름과 전화번호를 모두 입력해주세요.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = '조회 중...';
        resultContainer.style.display = 'none';

        // ===============================================================
        // ===== [수정된 부분] 잘못된 주소를 올바른 API 경로로 변경 =====
        // ===============================================================
        // 'https://o70albxd7n.onrender.com'는 실제 배포된 서버 주소입니다.
        // 뒤에 '/api/bookings/check' 경로와 '?name=...' 파라미터를 정확히 붙여줍니다.
        const serverUrl = 'https://o70albxd7n.onrender.com'; // 실제 서버 주소
        const fetchUrl = `${serverUrl}/api/bookings/check?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;
        // ===============================================================

        fetch(fetchUrl)
            .then(response => {
                if (response.status === 404) {
                    return [];
                }
                if (!response.ok) {
                    throw new Error('서버에서 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.');
                }
                return response.json();
            })
            .then(bookings => {
                resultContainer.style.display = 'block';
                if (bookings.length > 0) {
                    displayBookingsAsTable(bookings);
                } else {
                    resultDiv.innerHTML = `<p class="text-center text-gray-500 py-8">일치하는 예약 내역이 없습니다.</p>`;
                }
            })
            .catch(error => {
                console.error('예약 조회 중 오류 발생:', error);
                resultContainer.style.display = 'block';
                resultDiv.innerHTML = `<p class="text-center text-red-500 py-8">오류가 발생했습니다: ${error.message}</p>`;
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = '조회하기';
            });
    });

    // 이 함수는 가격을 표시하지 않으므로 수정할 필요 없습니다.
    function displayBookingsAsTable(bookings) {
        let tableHTML = `
            <table class="booking-table">
                <thead>
                    <tr>
                        <th>예약 날짜</th>
                        <th>계곡</th>
                        <th>구역</th>
                        <th>평상</th>
                        <th>예약 상태</th>
                    </tr>
                </thead>
                <tbody>
        `;

        bookings.forEach(booking => {
            tableHTML += `
                <tr>
                    <td>${booking.bookingDate}</td>
                    <td>${booking.valley}</td>
                    <td>${booking.section}</td>
                    <td>${booking.deckName}</td>
                    <td><span class="status-${booking.status === '결제 대기 중' ? 'completed' : 'pending'}">${booking.status}</span></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        resultDiv.innerHTML = tableHTML;
    }
});
