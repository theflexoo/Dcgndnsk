import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

const TOKEN = process.env.TOKEN;
const APP_ID = process.env.APP_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName("rules")
        .setDescription("Zeigt die Server Regeln an"),

    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot-Ping testen"),

    new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Infos über einen User anzeigen")
        .addUserOption(opt =>
            opt.setName("target")
               .setDescription("Welcher User?")
               .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Infos über den Server anzeigen")
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
    await rest.put(
        Routes.applicationCommands(APP_ID),
        { body: commands }
    );
    console.log("Slash Commands registriert!");
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "rules") {
        return interaction.reply("📜 **Regeln:**\n1. Sei nett.\n2. Kein Spam.\n3. Keine Beleidigungen.\n4. Viel Spaß!");
    }

    if (interaction.commandName === "ping") {
        return interaction.reply(`🏓 Pong! Ping: **${client.ws.ping}ms**`);
    }

    if (interaction.commandName === "userinfo") {
        const user = interaction.options.getUser("target") || interaction.user;
        return interaction.reply(`👤 **Userinfo für ${user.tag}:**\nID: ${user.id}`);
    }

    if (interaction.commandName === "serverinfo") {
        return interaction.reply(`🌐 **Serverinfo**\nName: ${interaction.guild.name}\nMitglieder: ${interaction.guild.memberCount}`);
    }
});

client.once("ready", () => console.log(`Bot gestartet als ${client.user.tag}`));

registerCommands();
client.login(TOKEN);
