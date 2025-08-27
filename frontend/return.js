document.addEventListener('DOMContentLoaded', () => {
    console.log('페이지 로딩 완료, 반납 스크립트 실행 시작.');

    // URL에서 평상 ID 값을 읽어옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const pyeongsangId = urlParams.get('id');

    // '선택 화면으로' 버튼의 링크를 동적으로 설정합니다.
    const backBtn = document.getElementById('back-to-choice-btn');
    if (pyeongsangId && backBtn) {
        backBtn.href = `QR.html?id=${pyeongsangId}`;
    }

    // HTML 요소들을 미리 찾아 변수에 저장합니다.
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');

    // --- 💻 서버 주소 설정 ---
    const aiServerUrl = 'https://65a8b868fc3c.ngrok-free.app/predict'; // Python AI 서버
    const bookingServerUrl = 'https://o70albxd7n.onrender.com'; // Node.js 예약 서버

    // 이미지 리사이징 함수
    function resizeImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // 사진 선택(촬영) 시 미리보기 기능
    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                uploadButton.disabled = false;
                resultDiv.textContent = '사진이 준비되었습니다. 인증 버튼을 눌러주세요.';
            }
        });
    }

    // '인증하기' 버튼 클릭 이벤트 처리
    if (uploadButton) {
        uploadButton.disabled = true; // 페이지 로드 시에는 버튼 비활성화

        uploadButton.addEventListener('click', async () => {
            const originalFile = imageInput.files?.[0];
            if (!originalFile) {
                alert('사진을 먼저 촬영해주세요!');
                return;
            }

            resultDiv.textContent = 'AI 분석 중...';
            uploadButton.disabled = true;

            try {
                // 1. AI 서버로 청결도 분석 요청
                const resizedFile = await resizeImage(originalFile, 800, 800, 0.8);
                const formData = new FormData();
                formData.append('file', resizedFile);
                
                const predictResponse = await fetch(aiServerUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!predictResponse.ok) throw new Error('AI 서버 응답 오류');
                const predictData = await predictResponse.json();

                // 2. AI 분석 결과가 'CLEAN'일 때만 예약 삭제 절차 진행
                if (predictData.status === 'CLEAN') {
                    resultDiv.textContent = '✅ 청결 확인! 본인 확인을 위해 정보를 입력해주세요.';
                    
                    const userName = prompt("예약자 성함을 입력하세요:");
                    if (userName === null || userName.trim() === '') return; // 사용자가 취소하거나 아무것도 입력하지 않으면 중단

                    const userPhone = prompt("예약 시 사용한 전화번호를 입력하세요:");
                    if (userPhone === null || userPhone.trim() === '') return; // 사용자가 취소하거나 아무것도 입력하지 않으면 중단

                    resultDiv.textContent = '예약 내역을 삭제 중입니다...';

                    // 3. Node.js 예약 서버로 예약 삭제 요청
                    const cancelUrl = `${bookingServerUrl}/api/bookings/${pyeongsangId}`;
                    const cancelResponse = await fetch(cancelUrl, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: userName, phone: userPhone })
                    });
                    
                    if (!cancelResponse.ok) {
                        const errorData = await cancelResponse.json();
                        throw new Error(`예약 내역 삭제에 실패했습니다: ${errorData.message}`);
                    }
                    
                    // 4. 최종 성공 메시지 표시
                    resultDiv.textContent = '🎉 반납이 완료되었습니다.';

                } else if (predictData.status === 'DIRTY') {
                    resultDiv.textContent = '❌ 다시 청소한 후 인증 부탁드립니다.';
                } else if (predictData.status === 'NO_PYEONGSANG') {
                    resultDiv.textContent = '⚠️ 평상이 인식되지 않습니다. 평상이 보이도록 다시 촬영해주세요.';
                }

            } catch (error) {
                console.error('오류 발생:', error);
                resultDiv.textContent = `🔌 오류가 발생했습니다: ${error.message}`;
            } finally {
                uploadButton.disabled = false;
            }
        });
    }
});
