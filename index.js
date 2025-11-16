import { Client, GatewayIntentBits, Collection } from "discord.js";
import express from "express";
import fs from "fs";
import path from "path";

// Mini Webserver für Deno HealthCheck
const app = express();
app.get("/", (req, res) => res.send("Bot läuft 24/7!"));
app.listen(3000, () => console.log("Webserver läuft auf Port 3000"));

// Discord Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Commands Collection
client.commands = new Collection();

// Lade Commands aus /commands
const commandsPath = path.join('./commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    client.commands.set(command.data.name, command);
}

// Command Handler
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

// Login
client.once('ready', () => {
    console.log(`Bot eingeloggt als ${client.user.tag}`);
});

client.login(process.env.TOKEN);