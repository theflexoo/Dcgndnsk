import { Client, GatewayIntentBits, Collection } from "discord.js";
import express from "express";

// ------------------
// Mini Webserver für Deno HealthCheck
// ------------------
const app = express();
app.get("/", (req, res) => res.send("Bot läuft 24/7!"));
app.listen(3000, () => console.log("Webserver läuft auf Port 3000"));

// ------------------
// Discord Bot Setup
// ------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ------------------
// Commands direkt importieren
// ------------------
import { data as rulesData, execute as rulesExecute } from "./commands/rules.js";

client.commands = new Collection();
client.commands.set(rulesData.name, { data: rulesData, execute: rulesExecute });

// ------------------
// Command Handler
// ------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await interaction.deferReply(); // Sofort ack
        await command.execute(interaction);
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
