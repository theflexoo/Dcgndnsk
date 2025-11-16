import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Zeigt die Server-Regeln an");

export async function execute(interaction) {
    await interaction.editReply("📜 Regeln:\n1. Sei nett\n2. Kein Spam\n3. Spaß haben!");
}