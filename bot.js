const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Last.fm API kalitini kiriting
const lastFmApiKey = 'd3b805d9dbaf59a5649698c5e6d24d5d'; // O'z Last.fm API kalitingizni joylashtiring

// Bot tokenini kiriting
const token = '7529923721:AAE7CoWB9aj1xCuW6cXwuotRHZRp_1YZlwM';
const bot = new TelegramBot(token, { polling: true });

// /start buyruqiga javob berish
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Salom! Musiqa nomini kiriting, men sizga musiqa haqida ma\'lumot beraman.');
});

// Musiqa ro'yxatini yaratish
function createMusicButtons(tracks, chatId) {
    const buttons = tracks.map((track, index) => ({
        text: `${index + 1}: ${track.name} by ${track.artist}`,
        callback_data: track.url // Musiqa URL'sini callback data sifatida olamiz
    }));

    const replyMarkup = {
        inline_keyboard: [
            buttons.map(button => [{ text: button.text, callback_data: button.callback_data }])
        ]
    };

    bot.sendMessage(chatId, 'Musiqa ro\'yxati tayyor! Iltimos, ijro etish uchun raqamni bosing.', {
        reply_markup: replyMarkup
    });
}

// Foydalanuvchi musiqa nomini yozganda
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const musicName = msg.text;

    // Musiqa nomini Last.fm API orqali qidiramiz
    axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(musicName)}&api_key=${lastFmApiKey}&format=json`)
        .then(response => {
            const tracks = response.data.results.trackmatches.track;

            if (tracks.length > 0) {
                // Musiqa topilganda
                createMusicButtons(tracks, chatId); // Musiqa tugmalarini yaratamiz
            } else {
                // Musiqa topilmasa
                bot.sendMessage(chatId, 'Kechirasiz, bunday musiqa topilmadi.');
            }
        })
        .catch(error => {
            console.error('API xatosi:', error);
            bot.sendMessage(chatId, 'Biror xato yuz berdi, keyinroq qaytadan urinib ko\'ring.');
        });
});

// Inline tugmalar bosilganda musiqa ijro etish
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const musicUrl = query.data; // Callback data sifatida olingan URL

    const audio = new Audio(musicUrl); // Musiqani ijro etish
    audio.play();

    bot.sendMessage(chatId, 'Musiqa ijro etilmoqda!');
});
