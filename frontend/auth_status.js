import { auth, db } from './firebase-config.js'; // Firebase 설정 파일
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// HTML에서 id가 'login-status-link'인 a 태그를 찾습니다.
const loginStatusLink = document.getElementById('login-status-link');

// Firebase 로그인 상태 변경을 감지합니다.
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // --- 1. 로그인 상태일 경우 ---
        try {
            // Firestore 데이터베이스에서 현재 로그인한 사용자의 정보를 가져옵니다.
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            let userName = user.email; // Firestore에 이름이 없으면 이메일을 기본값으로 사용
            if (docSnap.exists() && docSnap.data().name) {
                userName = docSnap.data().name;
            }

            // a 태그의 텍스트를 '사용자이름님'으로 변경합니다.
            loginStatusLink.textContent = `${userName}님`;
            // 클릭했을 때 이동할 주소를 마이페이지 등으로 변경합니다.
            loginStatusLink.href = 'mypage.html'; 

        } catch (error) {
            console.error("사용자 정보 로딩 실패:", error);
            // 에러 발생 시 기본값 설정
            loginStatusLink.textContent = '내 정보';
            loginStatusLink.href = 'mypage.html';
        }
    } else {
        // --- 2. 로그아웃 상태일 경우 ---
        // a 태그의 텍스트와 링크를 원래대로 설정합니다.
        loginStatusLink.textContent = '로그인';
        loginStatusLink.href = 'login-status.html';
    }
});
