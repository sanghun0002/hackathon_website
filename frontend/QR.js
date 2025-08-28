// QR.js

// auth.js 파일이 먼저 로드되어 auth 객체가 전역적으로 사용 가능해야 합니다.
// 또는 import 구문을 사용하려면 이 파일도 type="module"로 변경해야 합니다.
// 지금은 auth.js가 먼저 로드되었다고 가정하고 진행합니다.

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
        return; // 평상 ID가 없으면 여기서 실행 중단
    }
    
    pyeongsangIdElement.textContent = pyeongsangId;

    // Firebase 로그인 상태 감지 (auth.js의 onAuthStateChanged가 처리)
    // auth.js가 모든 페이지의 로그인 상태를 관리하므로, 여기서는 auth 객체를 직접 사용
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // 로그인 상태
            loggedInView.classList.remove('hidden');
            loggedOutView.classList.add('hidden');

            // Firestore에서 사용자 이름 가져오기
            const userDocRef = firebase.firestore().collection('users').doc(user.uid);
            try {
                const docSnap = await userDocRef.get();
                if (docSnap.exists && docSnap.data().name) {
                    userNameElement.textContent = docSnap.data().name;
                } else {
                    userNameElement.textContent = user.email;
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
                firebase.auth().signOut();
            });

        } else {
            // 로그아웃 상태
            loggedOutView.classList.remove('hidden');
            loggedInView.classList.add('hidden');
        }
    });
});
