import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import express from "express";

// ------------------
// Mini Webserver für Deno HealthCheck (24/7)
// ------------------
const app = express();
app.get("/", (req, res) => res.send("Bot läuft 24/7!"));
app.listen(3000, () => console.log("Webserver läuft auf Port 3000"));

// ------------------
// Discord Bot Setup
// ------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let botStartTime = Date.now();

// ------------------
// Command Handler
// ------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        await interaction.deferReply(); // Sofort ack
        const { commandName, options, user, guild } = interaction;

        // --------- Ping Command ----------
        if (commandName === 'ping') {
            const latency = Date.now() - botStartTime;
            await interaction.editReply(`🏓 Pong! Latenz: ${latency}ms`);
        } 
        // --------- Rules Command ----------
        else if (commandName === 'rules') {
            await interaction.editReply(
                "📜 Regeln:\n1. Sei nett\n2. Kein Spam\n3. Spaß haben!"
            );
        } 
        // --------- Status Command ----------
        else if (commandName === 'status') {
            await interaction.editReply("✅ Bot läuft einwandfrei!");
        }
        // --------- User Info ----------
        else if (commandName === 'userinfo') {
            const member = options.getMember('user') || user;
            const embed = new EmbedBuilder()
                .setTitle(`${member.username}#${member.discriminator}`)
                .setThumbnail(member.displayAvatarURL())
                .addFields(
                    { name: "ID", value: member.id, inline: true },
                    { name: "Bot?", value: member.bot ? "Ja" : "Nein", inline: true }
                );
            await interaction.editReply({ embeds: [embed] });
        }
        // --------- Server Info ----------
        else if (commandName === 'serverinfo') {
            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: "Server ID", value: guild.id, inline: true },
                    { name: "Mitglieder", value: guild.memberCount.toString(), inline: true },
                    { name: "Region", value: guild.preferredLocale, inline: true }
                );
            await interaction.editReply({ embeds: [embed] });
        }
        // --------- Say Command ----------
        else if (commandName === 'say') {
            const text = options.getString('text');
            await interaction.editReply(text || "Nichts angegeben!");
        }
        // --------- Uptime Command ----------
        else if (commandName === 'uptime') {
            const diff = Date.now() - botStartTime;
            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
            const days = Math.floor(diff / 1000 / 60 / 60 / 24);
            await interaction.editReply(`⏱️ Bot-Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
        else {
            await interaction.editReply("❌ Command nicht gefunden.");
        }

    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Fehler beim Ausführen des Commands!', ephemeral: true });
    }
});

// ------------------
// Bot Login
// ------------------
client.once('ready', () => {
    console.log(`Bot eingeloggt als ${client.user.tag}`);
});

client.login(Deno.env.get("TOKEN"));
