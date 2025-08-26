// 웹 페이지의 모든 요소가 로드된 후에 스크립트가 실행되도록 합니다.
document.addEventListener('DOMContentLoaded', () => {
    // HTML에서 필요한 요소들을 미리 찾아 변수에 저장합니다.
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');

    // --- 💻 백엔드 서버 주소를 여기에 설정 ---
    // PC에서 실행 중인 ngrok 주소나 IP 주소를 입력하세요.
    // 예시: const backendUrl = 'https://1a2b-3c4d.ngrok-free.app/predict';
    const backendUrl = 'https://image-analyzer-wduj.onrender.com/predict';

    // 사진을 선택(촬영)하면 미리보기를 보여주는 기능
    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0]; // 사용자가 촬영한 사진 파일
            if (file) {
                preview.src = URL.createObjectURL(file); // 이미지 미리보기 생성
                uploadButton.disabled = false; // 파일이 선택되면 버튼 활성화
                resultDiv.textContent = '사진이 준비되었습니다. 인증 버튼을 눌러주세요.';
            }
        });
    }

    // '인증하기' 버튼 클릭 이벤트 처리
    if (uploadButton) {
        uploadButton.disabled = true; // 페이지 로드 시에는 버튼 비활성화

        uploadButton.addEventListener('click', async () => {
            const file = imageInput.files?.[0];
            if (!file) {
                alert('사진을 먼저 촬영해주세요!');
                return;
            }

            // 사용자에게 분석 중임을 알림
            resultDiv.textContent = '🤖 AI가 사진을 분석 중입니다...';
            uploadButton.disabled = true; // 분석 중에는 버튼 비활성화

            const formData = new FormData();
            formData.append('file', file);

            try {
                // fetch API를 사용해 백엔드 서버로 사진 데이터 전송
                const response = await fetch(backendUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`서버 응답 오류: ${response.status}`);
                }

                const data = await response.json(); // 서버로부터 받은 결과(JSON)

                // 결과에 따라 적절한 메시지를 화면에 표시
                switch (data.status) {
                    case 'CLEAN':
                        resultDiv.textContent = '✅ 반납 되었습니다. 이용해 주셔서 감사합니다.';
                        break;
                    case 'DIRTY':
                        resultDiv.textContent = '❌ 다시 청소한 후 인증 부탁드립니다.';
                        break;
                    case 'NO_PYEONGSANG':
                        resultDiv.textContent = '⚠️ 평상이 인식되지 않았습니다. 평상이 보이도록 다시 촬영해주세요.';
                        break;
                    default:
                        resultDiv.textContent = '알 수 없는 오류가 발생했습니다.';
                }

            } catch (error) {
                console.error('통신 오류:', error);
                resultDiv.textContent = '🔌 서버와 통신 중 오류가 발생했습니다. PC 서버가 켜져 있는지 확인해주세요.';
            } finally {
                // 성공하든 실패하든 버튼을 다시 활성화하여 재시도할 수 있게 함
                uploadButton.disabled = false;
            }
        });
    }
});
