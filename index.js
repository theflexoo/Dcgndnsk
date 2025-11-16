import { Client, GatewayIntentBits } from "discord.js";
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

// ------------------
// Command Handler
// ------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // --------- Ping Command ----------
    if (interaction.commandName === 'ping') {
        await interaction.reply('🏓 Pong!');
    } 
    // --------- Rules Command ----------
    else if (interaction.commandName === 'rules') {
        await interaction.reply(
            "📜 Regeln:\n" +
            "1. Sei nett\n" +
            "2. Kein Spam\n" +
            "3. Spaß haben!"
        );
    } 
    // --------- Status Command ----------
    else if (interaction.commandName === 'status') {
        await interaction.reply('✅ Bot läuft einwandfrei!');
    } 
    // --------- Weitere alte Commands hier hinzufügen ----------
    else {
        await interaction.reply('❌ Command nicht gefunden.');
    }
});

// ------------------
// Bot Login
// ------------------
client.once('ready', () => {
    console.log(`Bot eingeloggt als ${client.user.tag}`);
});

client.login(Deno.env.get("TOKEN"));
