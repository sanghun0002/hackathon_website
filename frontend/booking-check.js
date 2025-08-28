document.addEventListener('DOMContentLoaded', () => {
    const checkForm = document.getElementById('check-form');
    const resultContainer = document.getElementById('check-result-container');
    const resultDiv = document.getElementById('check-result');
    const submitButton = checkForm.querySelector('button[type="submit"]');
    const serverUrl = 'https://o70albxd7n.onrender.com'; // 실제 서버 주소

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

        const fetchUrl = `${serverUrl}/api/bookings/check?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;

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

    
    function displayBookingsAsTable(bookings) {
        let tableHTML = `
            <table class="booking-table w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th class="px-6 py-3">예약 날짜</th>
                        <th class="px-6 py-3">계곡</th>
                        <th class="px-6 py-3">구역</th>
                        <th class="px-6 py-3">평상</th>
                        <th class="px-6 py-3">길찾기</th>
                        <th class="px-6 py-3">예약 상태</th>
                        <th class="px-6 py-3">예약 취소</th> 
                    </tr>
                </thead>
                <tbody>
        `;

        bookings.forEach(booking => {
    const bookingId = booking._id || booking.id;

    // ⭐ [추가] 예약 상태에 따라 취소 버튼의 HTML을 다르게 생성합니다.
    let cancelButtonHTML = '';
    if (booking.status === '사용 중') {
        // 상태가 '사용 중'이면: 비활성화된 '취소 불가' 버튼을 만듭니다.
        cancelButtonHTML = `
            <button class="text-sm bg-gray-400 text-white py-1 px-3 rounded cursor-not-allowed" disabled>
                취소 불가
            </button>
        `;
    } else {
        // 그 외의 상태이면: 원래의 '취소' 버튼을 만듭니다.
        cancelButtonHTML = `
            <button 
                class="cancel-btn text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded" 
                data-id="${bookingId}">
                취소
            </button>
        `;
    }

    
    tableHTML += `
        <tr class="bg-white border-b">
            <td class="px-6 py-4">${booking.bookingDate}</td>
            <td class="px-6 py-4">${booking.valley}</td>
            <td class="px-6 py-4">${booking.section}</td>
            <td class="px-6 py-4">${booking.deckName}</td>
            <td class="px-6 py-4">
                <a href="loadsearch.html" class="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded">
                    길찾기
                </a>
            </td>
            <td class="px-6 py-4">${booking.status}</td>
            <td class="px-6 py-4">
                ${cancelButtonHTML}
            </td>
        </tr>
    `;
});

        tableHTML += `</tbody></table>`;

        resultDiv.innerHTML = tableHTML;

        
        attachCancelButtonListeners();
    }

    
  
function attachCancelButtonListeners() {
    const cancelButtons = document.querySelectorAll('.cancel-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;

           
            const confirmationMessage = `정말로 이 예약을 취소하시겠습니까?\n\n` +
                `취소 시 아래의 환불 정책이 적용되오니, 반드시 확인해 주시기 바랍니다.\n\n` +
                `[환불 규정 안내]\n` +
                `• 예약일로부터 7일 이상 남은 경우: 100% 환불\n` +
                `• 예약일로부터 3일 ~ 6일 전: 50% 환불\n` +
                `• 예약일로부터 2일 전 ~ 당일: 환불 불가\n\n` +
                `※ 환불 처리에는 영업일 기준 3일에서 최대 7일까지 소요될 수 있습니다.`;

            if (confirm(confirmationMessage)) {
                cancelBooking(bookingId);
            }
        });
    });
}

  
    async function cancelBooking(bookingId) {
        try {
            const response = await fetch(`${serverUrl}/api/bookings/cancel/${bookingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '예약 취소에 실패했습니다.');
            }

            alert('예약이 성공적으로 취소되었습니다.');
            // 취소 성공 후, 다시 조회 폼을 클릭하여 결과를 새로고침하게 유도
            submitButton.click(); 

        } catch (error) {
            console.error('예약 취소 중 오류 발생:', error);
            alert(`오류가 발생했습니다: ${error.message}`);
        }
    }
});
