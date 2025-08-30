// firebase-config.js에서 필요한 기능들을 import합니다.
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // HTML 요소 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    let pyeongsangId = urlParams.get('id');
    pyeongsangId = pyeongsangId.replace(/\s|-/g, ''); 
    const backBtn = document.getElementById('back-to-choice-btn');
    const imageInput = document.getElementById('imageInput');
    const imageInputLabel = document.getElementById('imageInputLabel');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');

    

    // --- 💻 서버 주소 설정 ---
    const aiServerUrl = 'https://4e11c31d6dff.ngrok-free.app/predict';
    const bookingServerUrl = 'https://o70albxd7n.onrender.com';

    // '이전' 버튼 링크 설정
    if (pyeongsangId && backBtn) {
        backBtn.href = `QR.html?id=${pyeongsangId}`;
    }

    // 모든 기능을 비활성화하는 함수
    function disableAllFeatures(message) {
        resultDiv.textContent = `❌ ${message}`;
        resultDiv.style.color = 'red';
        imageInputLabel.style.backgroundColor = '#cccccc';
        imageInputLabel.style.cursor = 'not-allowed';
        imageInput.disabled = true;
        uploadButton.disabled = true;
    }
    
    // 로그인 상태 변화를 감지
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 로그인 상태이면, 예약 상태를 확인하여 버튼 활성화 여부 결정
            checkBookingStatus(user);
        } else {
            // 로그아웃 상태이면, 모든 기능을 비활성화
            disableAllFeatures('로그인 후 이용해주세요.');
        }
    });

    // 페이지 로드 시 예약 상태를 확인하는 함수
    async function checkBookingStatus(user) {
        if (!pyeongsangId) {
            disableAllFeatures('유효하지 않은 평상 ID입니다.');
            return;
        }

        try {
            const response = await fetch(`${bookingServerUrl}/api/bookings/by-pyeongsang/${pyeongsangId}`);
            if (!response.ok) {
                throw new Error(response.status === 404 ? '해당 평상에 대한 유효한 예약이 없습니다.' : '예약 정보 조회 실패');
            }
            const booking = await response.json();
            
            // 본인 확인: 로그인한 사용자의 정보와 예약자 정보가 일치하는지 확인
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) throw new Error('Firestore에서 사용자 정보를 찾을 수 없습니다.');
            const currentUserInfo = docSnap.data();

            const normalizedBookingPhone = booking.phone.replace(/\s|-/g, '');
            const normalizedUserPhone = currentUserInfo.phone.replace(/\s|-/g, '');

            if (booking.name !== currentUserInfo.name || normalizedBookingPhone !== normalizedUserPhone) {
                 throw new Error('본인의 예약이 아닙니다.');
            }
            
            if (booking.status === '사용 중') {
                imageInput.disabled = false;
                imageInputLabel.style.backgroundColor = '#28a745';
                imageInputLabel.style.cursor = 'pointer';
                resultDiv.textContent = '반납을 위해 사진을 촬영해주세요.';
            } else {
                throw new Error(`이 평상은 현재 '사용 중' 상태가 아닙니다. (현재 상태: ${booking.status})`);
            }
        } catch (error) {
            disableAllFeatures(error.message);
        }
    }
    
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
                        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                    } else {
                        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // 사진 선택 시 미리보기 기능
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
                const predictResponse = await fetch(aiServerUrl, { method: 'POST', body: formData });
                if (!predictResponse.ok) throw new Error('AI 서버 응답 오류');
                const predictData = await predictResponse.json();

                    // --- [핵심 추가] ---
                // 서버가 보내준 시각화 이미지 URL로 미리보기 이미지를 업데이트합니다.
                const aiServerBaseUrl = new URL(aiServerUrl).origin; // ngrok 주소 (예: https://....ngrok-free.app)
                preview.src = aiServerBaseUrl + predictData.image_url;

                // 2. AI 분석 결과가 'CLEAN'일 때만 예약 삭제 절차 진행
                if (predictData.status === 'CLEAN') {
                    resultDiv.textContent = '✅ 청결 확인!';
                    
                    const user = auth.currentUser;
                    if (!user) throw new Error('로그인 정보가 없습니다. 다시 로그인해주세요.');
                    
                    const userDocRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userDocRef);
                    if (!docSnap.exists()) throw new Error('Firestore 사용자 정보를 찾을 수 없습니다.');
                    
                    const { name, phone } = docSnap.data();
                    
                    const returnUrl = `${bookingServerUrl}/api/bookings/return/${pyeongsangId}`;
                    const returnResponse = await fetch(returnUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone })
                    });
                    
                    if (!returnResponse.ok) {
                        const errorData = await returnResponse.json();
                        throw new Error(`예약 삭제 실패: ${errorData.message}`);
                    }
                    
                    resultDiv.textContent = '반납이 완료되었습니다. 환불은 3-7일이 소요됩니다.';

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
