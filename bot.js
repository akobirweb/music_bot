const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Last.fm API kalitini kiriting
const lastFmApiKey = 'd3b805d9dbaf59a5649698c5e6d24d5d'; // Sizning Last.fm API kalitingiz

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
                // Musiqa topilganda, ularni raqamli tugmalar bilan ko'rsatamiz
                let buttons = [];
                tracks.forEach((track, index) => {
                    if (index < 10) { // Faqat 10 ta musiqani ko'rsatamiz
                        buttons.push([{ text: `${index + 1}: ${track.name} by ${track.artist}`, callback_data: `play_${index}` }]);
                    }
                });

                // Musiqa ro'yxatini yuborish
                const options = {
                    reply_markup: {
                        inline_keyboard: buttons
                    }
                };

                bot.sendMessage(chatId, 'Musiqa topildi:', options);
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

// Foydalanuvchi tugmani bosganda
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    // Agar foydalanuvchi musiqani ijro etishni xohlasa
    if (action.startsWith('play_')) {
        const trackIndex = action.split('_')[1];

        // Musiqa haqida qo'shimcha ma'lumot olish
        axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${lastFmApiKey}&mbid=${tracks[trackIndex].mbid}&format=json`)
            .then(response => {
                const track = response.data.track;
                const trackUrl = track.url; // Musiqa havolasi

                // Musiqani yuborish
                bot.sendMessage(chatId, `O'ynatish: ${track.name} by ${track.artist}\n${trackUrl}`);
            })
            .catch(error => {
                console.error('API xatosi:', error);
                bot.sendMessage(chatId, 'Musiqani ijro etishda xato yuz berdi.');
            });
    }
});
