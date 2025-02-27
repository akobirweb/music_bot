const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Last.fm API kalitini kiriting
const lastFmApiKey = 'YOUR_LAST_FM_API_KEY'; // O'z Last.fm API kalitingizni joylashtiring

// Bot tokenini kiriting
const token = '7529923721:AAE7CoWB9aj1xCuW6cXwuotRHZRp_1YZlwM';
const bot = new TelegramBot(token, { polling: true });

// /start buyruqiga javob berish
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Salom! Musiqa nomini kiriting, men sizga musiqa haqida ma\'lumot beraman.');
});

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
                const trackButtons = tracks.map((track, index) => ({
                    text: `${index + 1}. ${track.name} by ${track.artist}`,
                    callback_data: `${index + 1}` // Musiqaning tartib raqamini callback_data sifatida saqlaymiz
                }));

                const inlineKeyboard = {
                    inline_keyboard: [trackButtons],
                };

                // Musiqani tartib raqami bilan ko'rsatamiz
                bot.sendMessage(chatId, `Musiqa topildi! Sizning yoqtirgan musiqangiz:`, {
                    reply_markup: inlineKeyboard
                });
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

// Tugmalarga bosilganda
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const trackIndex = parseInt(callbackQuery.data) - 1; // Tugmadagi tartib raqamini olamiz
    const musicName = callbackQuery.message.reply_markup.inline_keyboard[0][trackIndex].text; // Musiqa nomini olamiz

    // Musiqa ijro etish
    bot.sendMessage(chatId, `Siz tanlagan musiqa: ${musicName}`); // Tanlangan musiqani foydalanuvchiga jo'natamiz

    // Ijtimoiy media (musiqani ijro etish uchun URL yo'q, buni o'zgartirish mumkin)
    bot.sendMessage(chatId, `Musiqa ijro etilmoqda: ${musicName}...`); // Ijtimoiy media orqali ijro etish
});
