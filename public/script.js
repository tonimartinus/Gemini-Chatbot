const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// History percakapan untuk dikirim ke backend
let conversation = [];

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // 1. Tambahkan pesan user ke UI & array percakapan
    appendMessage('user', userMessage);
    conversation.push({ role: 'user', text: userMessage });
    
    // Reset input field
    input.value = '';

    // 2. Tampilkan indikator "Thinking..." (bot message placeholder)
    const thinkingMessageId = 'thinking-' + Date.now();
    appendMessage('model', 'Thinking...', thinkingMessageId);

    try {
        // 3. Kirim request ke backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ conversation })
        });

        const data = await response.json();

        // 4. Proses hasil response
        const botMessageElement = document.getElementById(thinkingMessageId);
        
        if (response.ok && data.result) {
            // Update UI dengan jawaban asli
            botMessageElement.textContent = data.result;
            // Simpan jawaban bot ke history agar konteks berlanjut
            conversation.push({ role: 'model', text: data.result });
        } else {
            // Tampilkan pesan error yang lebih spesifik jika ada dari server
            const errorMsg = data.error || 'Sorry, no response received.';
            botMessageElement.textContent = errorMsg;
            botMessageElement.classList.add('error');
        }

    } catch (error) {
        console.error('Error fetching chat:', error);
        const botMessageElement = document.getElementById(thinkingMessageId);
        if (botMessageElement) {
            botMessageElement.textContent = 'Failed to get response from server.';
            botMessageElement.classList.add('error');
        }
    }
});

/**
 * Fungsi helper untuk menambah pesan ke dalam chat box
 * @param {string} role - 'user' atau 'model'
 * @param {string} text - Isi pesan
 * @param {string} id - Opsional ID untuk elemen (berguna untuk mengganti konten nanti)
 */
function appendMessage(role, text, id = null) {
    const msgDiv = document.createElement('div');
    
    // Menambahkan class 'message' dan 'user'/'bot' (bot diubah ke 'model' di backend tapi 'bot' di CSS)
    msgDiv.classList.add('message', role === 'user' ? 'user' : 'bot');
    
    if (id) msgDiv.id = id;
    msgDiv.textContent = text;
    
    chatBox.appendChild(msgDiv);
    
    // Scroll otomatis ke posisi paling bawah
    chatBox.scrollTop = chatBox.scrollHeight;
}
