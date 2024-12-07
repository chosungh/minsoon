$(document).ready(function () {
    $('#loading').hide();
});

document.getElementById('keywords').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.isComposing) { // IME 입력 상태 무시
        event.preventDefault(); // 기본 동작(폼 제출) 방지
        document.getElementById('send-button').click(); // 버튼 클릭 이벤트 트리거
    }
});

document.getElementById('input_key').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const api_key = document.getElementById("input_key").value;
        console.log(api_key); // 값을 처리하거나 다른 방법으로 사용할 수 있음
    }
});

// 테마 변경 및 크리스마스 테마 선택 시 h1 변경 
document.getElementById('style').addEventListener('change', function () {
    const h1Element = document.querySelector('h1');
    const selectedStyle = this.value;
    const thememusictrack = {
        horror: 'base_music/horror.mp3',
        friendly: 'base_music/friendly.mp3',
        christmas: 'base_music/christmas.mp3'
    };

    const audio = document.getElementById('themebgm');
    audio.src = thememusictrack[selectedStyle];
    audio.load();

    // 테마 클래스 제거 및 새 클래스 추가
    document.body.classList.remove('basic', 'horror', 'friendly', 'christmas');
    document.body.classList.add(selectedStyle);

    // 테마 변경 시 기존 채팅 메시지 삭제
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = ''; // 기존 채팅 기록 초기화

    // 헤더 텍스트 변경
    if (selectedStyle === 'christmas') {
        h1Element.textContent = 'Merry Christmas';
    } else {
        h1Element.textContent = '내 이름은 민순';
    }
});

document.getElementById('bgmToggle').addEventListener('change', function () {
    const toggle = document.getElementById('themebgm');
    if (this.checked) {
        playMusic();
    } else if (!this.checked) {
        stopMusic();
    }
});

function playMusic() {
    const audio = document.getElementById('themebgm');
    audio.play();
}

function stopMusic() {
    const audio = document.getElementById('themebgm');
    audio.pause();
}

function test123() {
    const api_key = document.getElementById("input_key").value;
    return api_key;
}

function chatGPT() {
    const api_key = test123();
    const keywords = document.getElementById('keywords').value;
    if (!keywords.trim()) return;  // Prevent sending empty messages

    appendMessage(keywords, 'user-message');
    $('#keywords').val('');
    $('#loading').show();

    // 사용자 선택 스타일에 맞는 프롬프트 만들기
    const selectedStyle = document.getElementById('style').value;
    let prompt = '';

    if (selectedStyle === 'basic') {
        prompt = "\n\n지금부터 너의 이름은 민순이이고 기본적인 너의 모습대로 말을 해:\n";
    } else if (selectedStyle === 'horror') {
        prompt = "\n\n지금부터 너의 이름은 민순이이고 아래 지침을 따르며 대답합니다:\n"
            + "1. 상대에게 공포감을 줄 수 있게 말을 해\n"
            + "3. 어둠 등과 같이 소설 속에서나 쓸 법한 단어는 쓰지 마"
            + "4. 무섭고 스산한 분위기를 잡아서 말을 해.\n"
            + "5. 40글자 미만으로 말을 해.\n"
            + "6. 소설처럼 말하지 마\n";
    } else if (selectedStyle === 'friendly') {
        prompt = "\n\n지금부터 너의 이름은 민순이이고 아래 지침을 따르며 대답합니다:\n"
            + "1. 말 안듣는 아이처럼 말해줘.\n"
            + "2. 반말해줘.\n"
            + "3. 40글자 미만으로 말을 해.\n";
    } else if (selectedStyle === 'christmas') {
        prompt = "\n\n지금부터 너의 이름은 민순이이고 아래 지침을 따르며 대답합니다:\n"
            + "1. 크리스마스를 기다려온 사람 느낌으로 말을 해.\n"
            + "2. 크리스마스가 연상되도록 말을 해.\n"
            + "3. 40글자 미만으로 말을 해.\n";
    }

    const messages = [
        { role: 'user', content: keywords + prompt },
    ];

    const data = {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        temperature: 0.5,
    };

    $.ajax({
        url: "https://api.openai.com/v1/chat/completions",
        method: 'POST',
        headers: {
            Authorization: "Bearer " + api_key,
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data),
    }).then(function (response) {
        $('#loading').hide();
        const botResponse = response.choices[0].message.content;
        appendMessage(botResponse, 'bot-message');
    }).catch(function (error) {
        $('#loading').hide();
        appendMessage("죄송합니다, 문제가 발생했습니다.", 'bot-message');
        console.error('Error:', error);
    });
}

let isVoiceEnabled = true; // 음성 출력 활성화 여부

document.getElementById('readToggle').addEventListener('change', function () {
    isVoiceEnabled = !isVoiceEnabled;
    const button = document.getElementById('toggle-voice');
    button.textContent = isVoiceEnabled ? '음성 끄기' : '음성 켜기'; // 버튼 텍스트 변경
});

function appendMessage(message, type) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerHTML = message;
    chatContainer.appendChild(messageElement);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 음성 출력 기능 활성화 상태에서만 작동
    if (type === 'bot-message' && isVoiceEnabled) {
        speakMessage(message);
    }
}

function speakMessage(message) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ko-KR'; // 한국어 설정
        utterance.rate = 1.0; // 말하기 속도 (0.1 ~ 10)
        utterance.pitch = 0; // 톤 (0 ~ 2)
        speechSynthesis.speak(utterance);
    } else {
        console.warn('이 브라우저는 음성 합성을 지원하지 않습니다.');
    }
}

// 모달 열기
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    document.body.classList.add('modal-active');
}

// 모달 닫기
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.classList.remove('modal-active');
}

// 로그인에서 회원가입으로 전환
function switchToSignup() {
    closeModal();
    openModal('signup-modal');
}

// 회원가입에서 로그인으로 전환
function switchToSignin() {
    closeModal();
    openModal('signin-modal');
}


function hideSigninButton() {
    const button = document.getElementById('signin_Modal_Button');
    button.style.display = 'none';
}