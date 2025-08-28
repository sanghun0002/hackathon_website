// auth.js

import { auth, db } from './firebase-config.js';
import { 
    onAuthStateChanged, 
    setPersistence, 
    browserSessionPersistence, 
    signInWithEmailAndPassword,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let logoutTimer; // 로그아웃 타이머를 저장할 변수

// --- 1. 로그인 지속성 설정: 'session' ---
// 이 코드는 로그인 정보가 브라우저 탭 세션 동안만 유지되도록 설정합니다.
// 즉, 창을 닫으면 자동으로 로그아웃됩니다.
setPersistence(auth, browserSessionPersistence)
    .catch((error) => {
        console.error("세션 설정 실패:", error);
    });

// --- 2. 로그인 함수 ---
// 이메일과 비밀번호를 받아 로그인을 처리하고, 성공 시 3분 로그아웃 타이머를 설정합니다.
export async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // 로그인 성공 시, 3분(180,000 밀리초) 후에 실행될 로그아웃 타이머 설정
    clearTimeout(logoutTimer); // 기존 타이머가 있다면 초기화
    logoutTimer = setTimeout(() => {
        console.log("3분이 지나 자동 로그아웃됩니다.");
        alert("세션이 만료되어 자동 로그아웃됩니다.");
        logout();
    }, 3 * 60 * 1000);

    return userCredential.user;
}

// --- 3. 로그아웃 함수 ---
export function logout() {
    clearTimeout(logoutTimer); // 로그아웃 시 타이머도 함께 제거
    signOut(auth);
}

// --- 4. 모든 페이지의 로그인 상태 UI 업데이트 ---
// 이 부분은 모든 페이지에 공통으로 적용됩니다.
const loginStatusLink = document.getElementById('login-status-link');
if (loginStatusLink) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // 로그인 상태일 경우 (이전과 동일)
            try {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().name) {
                    loginStatusLink.textContent = `${docSnap.data().name}님`;
                    loginStatusLink.href = 'login-status.html';
                } else {
                    loginStatusLink.textContent = '내 정보';
                    loginStatusLink.href = 'login-status.html';
                }
            } catch (error) {
                loginStatusLink.textContent = '내 정보';
                loginStatusLink.href = 'login-status.html';
            }
        } else {
            // 로그아웃 상태일 경우
            loginStatusLink.textContent = '로그인';
            loginStatusLink.href = 'login-status.html';
        }
    });
}
