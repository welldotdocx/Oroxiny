# 🤖 Discord Bot

Discord bot sederhana yang dibuat dengan Discord.js v14. Bot ini memiliki berbagai fitur dasar seperti slash commands, prefix commands, welcome messages, dan informasi server/user.

## ✨ Fitur

- **Slash Commands**: Commands modern menggunakan `/`
- **Prefix Commands**: Commands tradisional menggunakan `!`
- **Welcome Messages**: Pesan selamat datang untuk member baru
- **Server Info**: Informasi lengkap tentang server
- **User Info**: Informasi lengkap tentang user
- **Ping/Latency**: Cek koneksi bot ke Discord
- **Error Handling**: Penanganan error yang baik

## 🚀 Commands

### Slash Commands (/)
- `/ping` - Cek latency bot
- `/help` - Menampilkan daftar semua commands
- `/info` - Menampilkan informasi tentang bot
- `/server` - Menampilkan informasi tentang server
- `/user [target]` - Menampilkan informasi tentang user
- `/say <message>` - Bot mengulang pesan yang Anda ketik

### Prefix Commands (!)
- `!ping` - Cek latency bot
- `!say <message>` - Bot mengulang pesan yang Anda ketik

## 📋 Persyaratan

- [Node.js](https://nodejs.org/) v16.9.0 atau lebih baru
- [Discord Bot Token](https://discord.com/developers/applications)
- Internet connection

## 🛠️ Instalasi

### 1. Clone/Download Project
```bash
# Jika menggunakan Git
git clone <repository-url>
cd discord-bot

# Atau download dan extract ke folder discord-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Bot Token

#### a. Buat Bot di Discord Developer Portal
1. Pergi ke [Discord Developer Portal](https://discord.com/developers/applications)
2. Klik "New Application" dan beri nama bot Anda
3. Pergi ke tab "Bot" di sidebar
4. Klik "Add Bot"
5. Copy token bot Anda (jangan share token ini!)

#### b. Setup Environment Variables
1. Buka file `.env`
2. Ganti `your_discord_bot_token_here` dengan token bot Anda:
```env
DISCORD_TOKEN=your_actual_bot_token_here
```

### 4. Setup CLIENT_ID (Required for deploy)
1. Di Discord Developer Portal, copy **Application ID** dari halaman "General Information"
2. Tambahkan ke file `.env`:
```env
CLIENT_ID=your_bot_application_id_here
```

### 5. Invite Bot ke Server
1. Di Discord Developer Portal, pergi ke tab "OAuth2" > "URL Generator"
2. Pilih scopes: `bot` dan `applications.commands`
3. Pilih bot permissions yang diperlukan:
   - Read Messages/View Channels
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History
   - Add Reactions
4. Copy invite URL dan buka di browser
5. Pilih server dan invite bot

### 6. Deploy Slash Commands
```bash
# Deploy commands globally (takes up to 1 hour)
npm run deploy

# Optional: Deploy to specific server for instant testing
# Add GUILD_ID to .env first, then:
npm run deploy
```

## ▶️ Menjalankan Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Manual
```bash
node index.js
```

## ⚙️ Konfigurasi

Edit file `config.json` untuk mengubah pengaturan bot:

```json
{
  "prefix": "!",              // Prefix untuk commands tradisional
  "color": "#0099ff",         // Warna embed (hex code)
  "embedFooter": "Bot Footer", // Footer untuk embed messages
  "status": {
    "type": "PLAYING",        // PLAYING, WATCHING, LISTENING, STREAMING
    "name": "with Discord.js" // Status message
  }
}
```

## 📁 Struktur Project

```
discord-bot/
├── src/
│   └── commands/         # Command modules
│       ├── ping.js       # Ping command
│       ├── help.js       # Help command
│       ├── info.js       # Info command
│       ├── server.js     # Server info command
│       ├── user.js       # User info command
│       └── say.js        # Say command
├── index.js              # File utama bot
├── deploy-commands.js    # Script untuk register commands
├── config.json           # Konfigurasi bot
├── .env                  # Environment variables (token)
├── package.json          # Node.js dependencies
├── package-lock.json     # Lock file untuk dependencies
├── .gitignore            # Git ignore file
├── README.md             # Dokumentasi ini
└── node_modules/         # Dependencies (auto-generated)
```

## 🔧 Troubleshooting

### Bot tidak online
- Pastikan token di `.env` sudah benar
- Pastikan tidak ada spasi ekstra di token
- Cek internet connection
- Lihat console untuk error messages

### Slash commands tidak muncul
- Tunggu beberapa menit setelah bot online
- Restart Discord client
- Re-invite bot dengan permissions yang benar
- Cek console untuk registration errors

### Bot tidak merespon commands
- Pastikan bot memiliki permissions yang diperlukan
- Cek apakah bot bisa melihat channel tersebut
- Pastikan prefix benar untuk prefix commands

### Welcome messages tidak muncul
- Pastikan ada channel bernama "welcome" atau "general"
- Pastikan bot memiliki permission untuk send messages di channel tersebut

## 📝 Custom Commands

Dengan struktur handler baru, menambah command jadi lebih mudah:

### 1. Buat file command baru di `src/commands/`:
```javascript path=null start=null
// src/commands/mycommand.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mycommand')
        .setDescription('Deskripsi command saya')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input untuk command')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const input = interaction.options.getString('input') || 'default';
        await interaction.reply(`Command executed with: ${input}`);
    },
};
```

### 2. Deploy commands:
```bash
npm run deploy
```

### 3. Restart bot:
```bash
npm start
```

**Keuntungan struktur ini:**
- ✅ Auto-load command files
- ✅ Mudah maintenance
- ✅ Terorganisir per file
- ✅ Tidak perlu edit index.js

## 🛡️ Permissions

Bot memerlukan permissions berikut:
- **View Channels** - Untuk melihat channels
- **Send Messages** - Untuk mengirim pesan
- **Use Slash Commands** - Untuk slash commands
- **Embed Links** - Untuk rich embeds
- **Read Message History** - Untuk membaca pesan
- **Add Reactions** - Untuk menambah reactions

## 📚 Resources

- [Discord.js Documentation](https://discord.js.org/#/docs/)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🐛 Bug Reports

Jika menemukan bug atau ingin request fitur baru, silakan buat issue di repository ini.

## 📄 License

Project ini menggunakan ISC License.

## 🤝 Contributing

Pull requests welcome! Untuk perubahan besar, silakan buat issue terlebih dahulu untuk diskusi.

---

**Happy coding! 🎉**