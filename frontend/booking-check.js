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
                        <th class="px-6 py-3">예약 상태</th>
                        <th class="px-6 py-3">취소</th> 
                    </tr>
                </thead>
                <tbody>
        `;

        bookings.forEach(booking => {
            
            const bookingId = booking._id || booking.id; 
            tableHTML += `
                <tr class="bg-white border-b">
                    <td class="px-6 py-4">${booking.bookingDate}</td>
                    <td class="px-6 py-4">${booking.valley}</td>
                    <td class="px-6 py-4">${booking.section}</td>
                    <td class="px-6 py-4">${booking.deckName}</td>
                    <td class="px-6 py-4">${booking.status}</td>
                    <td class="px-6 py-4">
                        <button 
                            class="cancel-btn text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded" 
                            data-id="${bookingId}">
                            예약 취소
                        </button>
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
                if (confirm('정말로 이 예약을 취소하시겠습니까?')) {
                    cancelBooking(bookingId);
                }
            });
        });
    }

  
    async function cancelBooking(bookingId) {
        try {
            const response = await fetch(`${serverUrl}/api/bookings/${bookingId}`, {
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
