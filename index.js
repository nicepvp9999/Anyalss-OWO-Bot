const Discord = require("discord.js-selfbot-v13");
const axios = require("axios");
const readline = require("readline-sync");

console.clear();
console.log("⏳ Tokeninizi girin:");
const token = readline.question("> ", { hideEchoBack: true });

console.log("⏳ Owo bot kanal ID'sini girin:");
const owoChannelID = readline.question("> ");

const client = new Discord.Client();
let startTime = Date.now();
let isCaptchaActive = false;
let minecraftHours = 272;

// Rastgele zaman için yardımcı fonksiyon
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Owo komutlarını gönderme
async function sendOwoCommand(cmd) {
    if (isCaptchaActive) return; // Captcha varsa komutları durdur
    const channel = await client.channels.fetch(owoChannelID);
    if (channel) {
        await channel.send(cmd);
        console.log(`[GÖNDERİLDİ] ${cmd}`);
    }
}

// Captcha çözme fonksiyonu (API Entegrasyonu)
async function solveCaptcha(imageUrl) {
    console.log("⚠️ Captcha algılandı! Çözüm bekleniyor...");
    
    try {
        let response = await axios.post("CAPTCHA_API_URL", { image: imageUrl });
        return response.data.solution;
    } catch (err) {
        console.log("❌ Captcha çözülemedi, manuel çözmelisin.");
        return null;
    }
}

// Taş takma fonksiyonu
async function equipBestGem() {
    const gems = ["weapon", "glove", "ring"];
    for (let gem of gems) {
        await sendOwoCommand(`owo equip ${gem}`);
        await new Promise(r => setTimeout(r, 5000)); // 5 saniye bekle
    }
}

// Bot açıldığında çalışacak
client.on("ready", async () => {
    console.log(`✅ Bağlandı: ${client.user.username}`);
    console.log(`⏳ Owo komutları ${owoChannelID} kanalında çalışacak.`);

    // Durum güncelleme (Minecraft oynuyor süresi)
    setInterval(() => {
        minecraftHours++;
        client.user.setActivity(`${minecraftHours} saatdir Minecraft oynuyor`, { type: "PLAYING" });
    }, 3600000);

    // Otomatik taş takma (başlangıçta)
    await equipBestGem();

    // Otomatik `wh` ve `wb` (15-20 saniye arası)
    setInterval(() => {
        sendOwoCommand("owo wh");
        sendOwoCommand("owo wb");
    }, randomInterval(15000, 20000));

    // Otomatik `wsell all` (1 saatte bir)
    setInterval(() => {
        sendOwoCommand("owo wsell all");
    }, 3600000);
});

// Komutları dinleme
client.on("messageCreate", async (message) => {
    if (message.author.id !== client.user.id) return;
    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === "!say") {
        message.channel.send(args.join(" "));
    }

    if (command === "!send") {
        if (args.length < 2) return message.channel.send("Kullanım: `!send @kullanıcı miktar`");
        let target = args[0];
        let amount = args[1];
        sendOwoCommand(`owo give ${target} ${amount}`);
    }

    if (command === "!bilgi") {
        let uptime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
        message.channel.send(`⏳ Bot aktif süresi: **${uptime} dakika**`);
    }

    if (command === "!help") {
        message.channel.send("Komutlar: `!say mesaj`, `!send @kullanıcı miktar`, `!bilgi`, `!help`");
    }
});

// Captcha algılama ve durdurma
client.on("messageCreate", async (message) => {
    if (message.channel.id !== owoChannelID) return;

    if (message.embeds.length > 0) {
        let embed = message.embeds[0];

        if (embed.title && embed.title.includes("Verification")) {
            isCaptchaActive = true;
            let imageUrl = embed.image?.url;

            if (imageUrl) {
                let solution = await solveCaptcha(imageUrl);
                if (solution) {
                    await sendOwoCommand(solution);
                    console.log("✅ Captcha çözüldü, devam ediliyor...");
                }
            }

            isCaptchaActive = false;
        }
    }
});

// Kutu açma `wlb all` ve `wwc all`
client.on("messageCreate", async (message) => {
    if (message.channel.id !== owoChannelID) return;
    if (message.content.includes("Congratulations") || message.content.includes("lootbox")) {
        sendOwoCommand("owo wlb all");
        sendOwoCommand("owo wwc all");
    }
});

// Hata yakalama
client.on("error", (err) => {
    console.log("❌ Hata:", err);
});

// Token ile giriş yap
client.login(token).catch(() => {
    console.log("❌ Token geçersiz!");
});