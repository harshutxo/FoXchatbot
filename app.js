// Simple UI + API proxy client
const chatEl = document.getElementById('chat');
const form = document.getElementById('form');
const input = document.getElementById('input');
const backendInput = document.getElementById('backend');
const saveBtn = document.getElementById('saveBackend');

const STORAGE_KEY = 'chatbot_backend_url';
const backendUrl = localStorage.getItem(STORAGE_KEY);
if (backendUrl) backendInput.value = backendUrl;

saveBtn.addEventListener('click', () => {
  const v = backendInput.value.trim();
  if (!v) return alert('Enter backend URL');
  localStorage.setItem(STORAGE_KEY, v);
  alert('Saved backend URL.');
});

function appendMessage(text, cls='bot'){
  const div = document.createElement('div');
  div.className = 'msg ' + cls;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  appendMessage(text,'user');
  input.value = '';
  appendMessage('⏳ thinking...', 'bot');
  const url = localStorage.getItem(STORAGE_KEY) || backendInput.value.trim();
  if (!url) {
    alert('Please set your backend URL (top of the page) and save it.');
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({message: text})
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('Bad response: ' + res.status + ' ' + txt);
    }
    const data = await res.json();
    // remove the last 'thinking...' message
    const last = chatEl.querySelectorAll('.msg.bot');
    if (last.length) last[last.length - 1].remove();
    appendMessage(data.reply || '[no reply]', 'bot');
  } catch (err) {
    // remove the 'thinking...' and show error
    const last = chatEl.querySelectorAll('.msg.bot');
    if (last.length) last[last.length - 1].remove();
    appendMessage('⚠️ Error: ' + err.message, 'bot');
    console.error(err);
  }
});
