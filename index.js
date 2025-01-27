const Discord = require("discord.js-selfbot-v13");
const axios = require("axios");
const readline = require("readline-sync");

console.clear();
console.log("⏳ Tokeninizi girin:");
const token = readline.question("> ", { hideEchoBack: true });

console.log("⏳ Owo bot kanal ID'sini girin:");
const owoChannelID = readline.question("> ");

console.log("❓ Captcha API kullanmak istiyor musunuz? (Evet/Hayır):");
const useCaptcha = readline.question("> ").toLowerCase() === "evet";

let captchaApiUrl = null;
if (useCaptcha) {
    console.log("🔑 Captcha API URL'sini girin:");
    captchaApiUrl = readline.question("> ");
}

const client = new Discord.Client();
let startTime = Date.now();
let minecraftHours = 272;
let isCaptchaActive = false;

// Rastgele zaman aralığı için fonksiyon
function randomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// OwO komut gönderme
async function sendOwoCommand(cmd) {
    if (isCaptchaActive) return; // CAPTCHA çözülüyorsa komut gönderme
    const channel = await client.channels.fetch(owoChannelID);
    if (channel) {
        await channel.send(cmd);
        console.log(`[GÖNDERİLDİ] ${cmd}`);
    }
}

// CAPTCHA çözme (isteğe bağlı)
async function solveCaptcha(imageUrl) {
    if (!useCaptcha) {
        console.log("⚠️ CAPTCHA algılandı! Lütfen manuel çözüm yapın.");
        return null;
    }

    console.log("⚠️ CAPTCHA algılandı! API üzerinden çözüm bekleniyor...");
    try {
        const response = await axios.post(captchaApiUrl, { image: imageUrl });
        return response.data.solution;
    } catch (err) {
        console.log("❌ CAPTCHA çözülemedi, manuel çözüm gerekli.");
        return null;
    }
}

// En iyi taşları otomatik takma
async function equipBestGem() {
    await sendOwoCommand("owo winv");
    setTimeout(async () => {
        const gems = ["weapon", "glove", "ring"];
        for (let gem of gems) {
            await sendOwoCommand(`owo equip ${gem}`);
            await new Promise(r => setTimeout(r, 5000)); // 5 saniye bekle
        }
    }, 5000);
}

// Bot hazır olduğunda çalışacak
client.on("ready", async () => {
    console.log(`✅ Bağlandı: ${client.user.username}`);
    console.log(`⏳ Owo komutları ${owoChannelID} kanalında çalışacak.`);

    // Durum güncelleme (Minecraft oynuyor süresi)
    setInterval(() => {
        minecraftHours++;
        client.user.setActivity(`${minecraftHours} saatdir Minecraft oynuyor`, { type: "PLAYING" });
    }, 3600000);

    // Otomatik `wh` ve `wb` komutları
    setInterval(() => {
        sendOwoCommand("owo wh");
        sendOwoCommand("owo wb");
    }, randomInterval(15000, 20000));

    // Otomatik `wsell all`
    setInterval(() => {
        sendOwoCommand("owo wsell all");
    }, 3600000);
});

// Lootbox ve taş işlemleri
client.on("messageCreate", async (message) => {
    if (message.channel.id !== owoChannelID) return;

    if (message.content.includes("Congratulations") || message.content.includes("lootbox")) {
        await sendOwoCommand("owo wlb all");
        await sendOwoCommand("owo wwc all");
    }

    if (message.content.includes("Your inventory is empty")) {
        await equipBestGem();
    }
});

// CAPTCHA algılama ve çözüm
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
                    console.log("✅ CAPTCHA çözüldü, devam ediliyor...");
                }
            }

            isCaptchaActive = false;
        }
    }
});

// Özel komutlar
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

// Hata yakalama
client.on("error", (err) => {
    console.log("❌ Hata:", err);
});

// Token ile giriş yap
client.login(token).catch(() => {
    console.log("❌ Token geçersiz!");
});
