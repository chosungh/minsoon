// 모달 관련 변수
const openModalButton = document.getElementById('openModalButton');
const closeModalButton = document.getElementById('closeModalButton');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');

// 모달 열기 함수
function openModal() {
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
}

// 모달 닫기 함수
function closeModal() {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

// 모달 오버레이 또는 닫기 버튼 클릭 시 모달 닫기
closeModalButton.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// "모달 열기" 버튼 클릭 시 모달 열기
openModalButton.addEventListener('click', openModal);

// 로그인 버튼 클릭 이벤트
document.getElementById('signInButton').addEventListener('click', (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    const signInEmail = document.getElementById('signInEmail').value;
    const signInPassword = document.getElementById('signInPassword').value;

    signInWithEmailAndPassword(auth, signInEmail, signInPassword)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            alert('로그인 성공!');
            closeModal();  // 로그인 성공 후 모달 닫기
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`로그인 실패: ${errorMessage}`);
        });
});