// firebase-config.js에서 auth와 db 객체를 가져옵니다.
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// admin.js 파일에서 내보낸 함수를 가져옵니다.
import { initAdminPage } from './admin.js';

/**
 * 이 스크립트는 관리자 페이지를 보호하는 '문지기' 역할을 합니다.
 * admin.html의 <head> 태그에서 호출되어 페이지 내용이 표시되기 전에 실행됩니다.
 */
onAuthStateChanged(auth, async (user) => {
    // 1. 사용자가 로그인했는지 확인합니다.
    if (user) {
        try {
            // 2. 로그인된 사용자의 UID를 사용하여 Firestore에서 사용자 정보를 조회합니다.
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            // 3. 사용자 정보가 존재하고, 'isAdmin' 필드가 true인지 확인합니다.
            if (docSnap.exists() && docSnap.data().isAdmin === true) {
                // 모든 조건을 통과하면 관리자로 확인됩니다.
                console.log("Admin Guard: 접근 허용. 관리자입니다:", user.email);
                // Firebase 인증이 성공한 후, admin.js의 페이지 초기화 함수를 호출합니다.
                initAdminPage();
            } else {
                // 로그인했지만 관리자가 아닌 경우, 오류를 발생시켜 접근을 차단합니다.
                throw new Error("관리자 권한이 없습니다.");
            }
        } catch (error) {
            // Firestore 조회 중 에러가 발생하거나 관리자가 아닌 경우, 여기서 처리됩니다.
            console.error("Admin Guard: 접근 거부.", error);
            alert("관리자만 접근할 수 있는 페이지입니다.");
            window.location.href = 'index.html'; // 메인 페이지로 쫓아냅니다.
        }
    } else {
        // 4. 로그아웃 상태인 경우, 접근을 차단합니다.
        console.log("Admin Guard: 접근 거부. 로그인이 필요합니다.");
        alert("관리자 로그인이 필요한 페이지입니다.");
        
        // 관리자 페이지로 가려던 원래 목적지를 저장해두고 로그인 페이지로 보냅니다.
        sessionStorage.setItem('redirectTo', window.location.href);
        window.location.href = 'login.html';
    }
});
