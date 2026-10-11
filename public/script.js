const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Menyimpan riwayat percakapan untuk dikirim ke backend
let conversationHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // 1. Tampilkan pesan user di UI
  appendMessage('user', userMessage);
  input.value = '';

  // Tambahkan pesan user ke memori percakapan
  conversationHistory.push({ role: 'user', text: userMessage });

  // 2. Buat elemen placeholder "Gemini is thinking..."
  const botMessageElement = document.createElement('div');
  botMessageElement.classList.add('message', 'bot');
  botMessageElement.textContent = 'Fini lagi mikir bentar... 🤔';
  chatBox.appendChild(botMessageElement);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // 3. Kirim request POST ke backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation: conversationHistory
      }),
    });

    if (!response.ok) {
      // Coba ambil pesan error spesifik dari backend
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(`Server error: ${errorMessage}`);
    }

    const data = await response.json();

    // 4. Ganti teks "thinking" dengan balasan dari AI
    if (data && data.result) {
      botMessageElement.textContent = data.result;
      // Simpan balasan bot ke riwayat percakapan
      conversationHistory.push({ role: 'model', text: data.result });
    } else {
      botMessageElement.textContent = 'Sorry, no response received.';
    }

  } catch (error) {
    console.error('Error fetching response:', error);
    botMessageElement.textContent = 'Failed to get response from server.';
  } finally {
    // Pastikan UI scroll ke bawah setelah selesai
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// Fungsi bantuan (helper) untuk menambahkan elemen chat ke DOM UI
function appendMessage(sender, text) {
  const msgElement = document.createElement('div');
  msgElement.classList.add('message', sender);
  msgElement.textContent = text;
  chatBox.appendChild(msgElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}