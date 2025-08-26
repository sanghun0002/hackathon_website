document.addEventListener('DOMContentLoaded', () => {
    // URL에서 평상 ID 값을 읽어옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const pyeongsangId = urlParams.get('id');

    // HTML 요소 가져오기
    const pyeongsangIdDisplay = document.getElementById('pyeongsang-id-display');
    const authForm = document.getElementById('auth-form');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const resultMessage = document.getElementById('result-message');

    // --- 💻 백엔드 서버 주소를 여기에 설정 ---
    const backendUrl = 'https://image-analyzer-wduj.onrender.com/verify-booking';

    // 화면에 평상 ID 표시
    if (pyeongsangId) {
        pyeongsangIdDisplay.textContent = pyeongsangId;
    } else {
        pyeongsangIdDisplay.textContent = '오류: 평상 ID 없음';
        pyeongsangIdDisplay.style.color = 'red';
    }

    // '인증하기' 버튼 클릭 시 폼 제출 이벤트 처리
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        resultMessage.textContent = '예약 정보를 확인 중입니다...';

        const name = nameInput.value;
        const phone = phoneInput.value;

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 백엔드로 평상 ID, 이름, 전화번호를 모두 보냅니다.
                body: JSON.stringify({ pyeongsangId, name, phone }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                resultMessage.textContent = `✅ ${data.message}`;
                resultMessage.style.color = 'green';
                authForm.style.display = 'none'; // 성공 후 폼 숨기기
            } else {
                resultMessage.textContent = `❌ ${data.message}`;
                resultMessage.style.color = 'red';
            }

        } catch (error) {
            console.error('통신 오류:', error);
            resultMessage.textContent = '🔌 서버와 통신 중 오류가 발생했습니다.';
            resultMessage.style.color = 'red';
        }
    });
});
