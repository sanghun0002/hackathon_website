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

        // 버튼 비활성화 및 로딩 상태 표시
        submitButton.disabled = true;
        submitButton.textContent = '조회 중...';
        resultContainer.style.display = 'none'; // 이전 결과 숨기기

        // 백엔드 API에 GET 요청 보내기
        // 서버 주소는 실제 운영 환경에 맞게 변경해야 합니다.
        fetch(`http://localhost:3000/api/bookings/check?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`)
            .then(response => {
                if (response.status === 404) {
                    // 404 Not Found는 예약이 없는 경우로 간주
                    return []; // 빈 배열 반환
                }
                if (!response.ok) {
                    // 그 외 서버 에러
                    throw new Error('서버에서 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.');
                }
                return response.json();
            })
            .then(bookings => {
                resultContainer.style.display = 'block'; // 결과 컨테이너 표시
                if (bookings.length > 0) {
                    // 예약 정보가 있으면 표로 만들어 표시
                    displayBookingsAsTable(bookings);
                } else {
                    // 예약 정보가 없으면 메시지 표시
                    resultDiv.innerHTML = `<p class="text-center text-gray-500 py-8">일치하는 예약 내역이 없습니다.</p>`;
                }
            })
            .catch(error => {
                console.error('예약 조회 중 오류 발생:', error);
                resultContainer.style.display = 'block';
                resultDiv.innerHTML = `<p class="text-center text-red-500 py-8">오류가 발생했습니다: ${error.message}</p>`;
            })
            .finally(() => {
                // 버튼 다시 활성화
                submitButton.disabled = false;
                submitButton.textContent = '조회하기';
            });
    });

    function displayBookingsAsTable(bookings) {
        let tableHTML = `
            <table class="booking-table">
                <thead>
                    <tr>
                        <th>예약 날짜</th>
                        <th>계곡</th>
                        <th>구역</th>
                        <th>평상</th>
                        <th>가격</th>
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
                    <td>${booking.price ? Number(booking.price).toLocaleString() + '원' : '-'}</td>
                    <td><span class="status-${booking.status === '예약 완료' ? 'completed' : 'pending'}">${booking.status}</span></td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;
        resultDiv.innerHTML = tableHTML;
    }
});
