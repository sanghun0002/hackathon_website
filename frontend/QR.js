import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // URL에서 평상 ID ('?id=...') 값을 읽어옵니다.
    const urlParams = new URLSearchParams(window.location.search);
    const pyeongsangId = urlParams.get('id');

    // HTML 요소 가져오기
    const pyeongsangIdElement = document.getElementById('pyeongsang-id');
    const loggedInView = document.getElementById('logged-in-view');
    const loggedOutView = document.getElementById('logged-out-view');
    const userNameElement = document.getElementById('user-name');
    const checkInBtn = document.getElementById('check-in-btn');
    const returnBtn = document.getElementById('return-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (!pyeongsangId) {
        pyeongsangIdElement.textContent = '유효하지 않은 QR 코드입니다.';
        pyeongsangIdElement.style.color = 'red';
        loggedOutView.classList.remove('hidden'); // 로그인 버튼이라도 보여주기
        return;
    } 
    
    pyeongsangIdElement.textContent = pyeongsangId;

    // Firebase 로그인 상태 감지 (v9+ 모듈식 문법 사용)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // --- 로그인 상태 ---
            loggedInView.classList.remove('hidden');
            loggedOutView.classList.add('hidden');

            // Firestore에서 사용자 이름 가져오기
            const userDocRef = doc(db, "users", user.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().name) {
                    userNameElement.textContent = docSnap.data().name;
                } else {
                    userNameElement.textContent = user.email; // 이름 없으면 이메일
                }
            } catch (error) {
                console.error("이름 가져오기 실패:", error);
                userNameElement.textContent = user.email;
            }

            // 버튼 링크 설정
            checkInBtn.href = `checkQR.html?id=${pyeongsangId}`;
            returnBtn.href = `return.html?id=${pyeongsangId}`;

            // 로그아웃 버튼 이벤트
            logoutBtn.addEventListener('click', () => {
                signOut(auth); // v9+ 로그아웃 함수
            });

        } else {
            // --- [핵심 수정] 로그아웃 상태일 경우 ---
            loggedOutView.classList.remove('hidden');
            loggedInView.classList.add('hidden');
            
            // '로그인 페이지로 이동' 버튼을 찾습니다.
            const loginBtn = document.querySelector('#logged-out-view a.btn');
            if(loginBtn) {
                // 현재 QR 페이지의 전체 주소를 가져옵니다. (예: .../QR.html?id=평상1)
                const redirectUrl = window.location.href;
                // 로그인 버튼의 링크에 '돌아올 주소' 정보를 추가합니다.
                loginBtn.href = `login.html?redirect=${encodeURIComponent(redirectUrl)}`;
            }
        }
    });
});
