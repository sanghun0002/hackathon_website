// firebase-config.js에서 auth 객체를 가져옵니다.
// 이 파일이 존재하고 올바르게 설정되어 있다고 가정합니다.
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * 이 스크립트는 로그인이 필요한 페이지를 보호하는 역할을 합니다.
 * 페이지 내용이 로드되기 전에 실행되어야 가장 효과적입니다.
 */
onAuthStateChanged(auth, (user) => {
    // onAuthStateChanged는 Firebase 서버에 직접 현재 사용자 상태를 확인합니다.
    // 페이지 로드 시 가장 먼저 실행되어 정확한 로그인 상태를 파악합니다.

    // 만약 user 객체가 null이거나 undefined이면, 로그인하지 않은 상태입니다.
    if (!user) {
        console.log("Auth Guard: 접근 거부. 로그인이 필요합니다.");

        // 사용자가 원래 접속하려던 페이지의 전체 URL을 sessionStorage에 임시 저장합니다.
        // 이렇게 하면 로그인 성공 후, 사용자를 원래 가려던 곳으로 다시 보내줄 수 있습니다.
        sessionStorage.setItem('redirectTo', window.location.href);

        // 사용자에게 로그인이 필요함을 알리고,
        alert("로그인이 필요한 페이지입니다. 로그인 화면으로 이동합니다.");
        
        // 로그인 상태를 확인하고 로그인/회원가입을 할 수 있는 페이지로 강제 이동시킵니다.
        window.location.href = 'login-status.html';
    } else {
        // user 객체가 존재하면, 사용자가 로그인한 상태입니다.
        // 아무 작업도 하지 않고 페이지가 정상적으로 로드되도록 둡니다.
        console.log("Auth Guard: 접근 허용. 사용자:", user.email);
    }
});
