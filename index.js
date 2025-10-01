const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const parseDeck = require('./parseDeck');

const TOKEN = process.env.BOT_TOKEN; // Replace with your bot token
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.on('clientReady', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	if (/^# \(\d+/.test(message.content)) {
		try {
			await message.delete();
			await message.channel.send(`Here's the deck <@${message.author.id}> shared:\n\`\`\`${parseDeck(message.content)}\`\`\``);
		} catch (err) {
			console.error('Failed to delete or send message:', err);
		}
	}
});

client.login(TOKEN);