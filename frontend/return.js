// firebase-config.js와 auth.js에서 필요한 기능들을 모두 import합니다.
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    const aiServerUrl = 'https://ee6b97c890b3.ngrok-free.app/predict'; // Python AI 서버
    const bookingServerUrl = 'https://o70albxd7n.onrender.com'; // Node.js 예약 서버

    // --- [핵심 추가] 페이지 로드 시 예약 상태를 확인하는 함수 ---
    async function checkBookingStatus() {
        if (!pyeongsangId) {
            resultDiv.textContent = '⚠️ 유효하지 않은 평상 ID입니다.';
            return;
        }

        try {
            const response = await fetch(`${bookingServerUrl}/api/bookings/${pyeongsangId}`);
            
            if (!response.ok) {
                // 예약 정보가 없는 경우 (404 Not Found)
                if (response.status === 404) {
                    throw new Error('해당 평상에 대한 유효한 예약이 없습니다.');
                }
                throw new Error('예약 정보를 불러오는 데 실패했습니다.');
            }

            const booking = await response.json();
            
            // 예약 상태 확인
            if (booking.status === '사용 중') {
                // 상태가 '사용 중'이면 촬영 버튼 활성화
                imageInputLabel.style.backgroundColor = '#28a745'; // 원래 색으로
                imageInputLabel.style.cursor = 'pointer';
                imageInput.disabled = false;
                resultDiv.textContent = '반납을 위해 사진을 촬영해주세요.';
            } else {
                // '사용 중'이 아니면 비활성화
                throw new Error(`이 평상은 현재 '사용 중' 상태가 아닙니다. (현재 상태: ${booking.status})`);
            }

        } catch (error) {
            console.error('상태 확인 오류:', error);
            resultDiv.textContent = `❌ ${error.message}`;
            resultDiv.style.color = 'red';
            // 촬영 및 인증 버튼 모두 비활성화
            imageInputLabel.style.backgroundColor = '#cccccc';
            imageInputLabel.style.cursor = 'not-allowed';
            imageInput.disabled = true;
            uploadButton.disabled = true;
        }
    }

    // 페이지가 열리면 제일 먼저 예약 상태 확인 함수를 실행
    checkBookingStatus();
    
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
                    
                    // prompt 대신, 현재 로그인된 사용자 정보를 가져옵니다.
                    const user = auth.currentUser;
                    if (!user) {
                        throw new Error('로그인 정보가 없습니다. 다시 로그인해주세요.');
                    }

                    // Firestore에서 로그인된 사용자의 이름과 전화번호를 조회합니다.
                    const userDocRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (!docSnap.exists() || !docSnap.data().name || !docSnap.data().phone) {
                        throw new Error('데이터베이스에서 사용자 정보를 찾을 수 없습니다.');
                    }
                    const userName = docSnap.data().name;
                    const userPhone = docSnap.data().phone;
                    // -----------------------
                    
                    // 3. Node.js 예약 서버로 예약 삭제 요청 (가져온 정보 사용)
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
                    
                    resultDiv.textContent = '🎉 반납이 완료되었습니다. 환불은 3-7일이 소요됩니다.';

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
