import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } from "discord.js";
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
// Slash Commands Definition
// ------------------
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Zeigt die Latenz des Bots"),
  new SlashCommandBuilder().setName("rules").setDescription("Zeigt die Server-Regeln"),
  new SlashCommandBuilder().setName("status").setDescription("Zeigt den Bot-Status"),
  new SlashCommandBuilder().setName("uptime").setDescription("Zeigt wie lange der Bot läuft"),
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Lässt den Bot etwas wiederholen")
    .addStringOption(option => option.setName("text").setDescription("Der Text, den der Bot wiederholen soll").setRequired(true)),
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Zeigt Infos über einen User")
    .addUserOption(option => option.setName("user").setDescription("Der User, über den Informationen angezeigt werden sollen").setRequired(false)),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Zeigt Infos über den Server"),
].map(cmd => cmd.toJSON());

// ------------------
// Registriere die Commands bei Discord
// ------------------
const rest = new REST({ version: "10" }).setToken(Deno.env.get("TOKEN"));
(async () => {
  try {
    console.log("Starte Registrierung der Commands...");
    await rest.put(Routes.applicationCommands(Deno.env.get("CLIENT_ID")), { body: commands });
    console.log("✅ Commands erfolgreich registriert!");
  } catch (error) {
    console.error(error);
  }
})();

// ------------------
// Command Handler
// ------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, user, guild } = interaction;

  try {
    await interaction.deferReply();

    if (commandName === "ping") {
      const latency = Math.round(client.ws.ping);
      await interaction.editReply(`🏓 Pong! Latenz: ${latency}ms`);
    } 
    else if (commandName === "rules") {
      await interaction.editReply(
        "📜 Regeln:\n1. Sei nett\n2. Kein Spam\n3. Spaß haben!"
      );
    } 
    else if (commandName === "status") {
      await interaction.editReply("✅ Bot läuft einwandfrei!");
    } 
    else if (commandName === "uptime") {
      const diff = Date.now() - botStartTime;
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);
      await interaction.editReply(`⏱️ Bot-Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    } 
    else if (commandName === "say") {
      const text = options.getString("text");
      await interaction.editReply(text || "Nichts angegeben!");
    } 
    else if (commandName === "userinfo") {
      const member = options.getUser("user") || user;
      const embed = new EmbedBuilder()
        .setTitle(`${member.username}#${member.discriminator}`)
        .setThumbnail(member.displayAvatarURL())
        .addFields(
          { name: "ID", value: member.id, inline: true },
          { name: "Bot?", value: member.bot ? "Ja" : "Nein", inline: true }
        );
      await interaction.editReply({ embeds: [embed] });
    } 
    else if (commandName === "serverinfo") {
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
    else {
      await interaction.editReply("❌ Command nicht gefunden.");
    }

  } catch (error) {
    console.error(error);
    await interaction.editReply({ content: "Fehler beim Ausführen des Commands!", ephemeral: true });
  }
});

// ------------------
// Bot Login
// ------------------
client.once("ready", () => {
  console.log(`Bot eingeloggt als ${client.user.tag}`);
});

client.login(Deno.env.get("TOKEN"));
