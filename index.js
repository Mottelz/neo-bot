const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const snapdeck = require('snapdeck');

const TOKEN = process.env.NEO_BOT_TOKEN; // Replace with your bot token
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

	try {
		const deckcode = snapdeck.extractDeckcode(message.content);
		if (!deckcode) return;

		const deck = await snapdeck.parseDeckcode(deckcode);
		if (!deck) return;

		const displayDeck = await snapdeck.generateDisplayString(deck.cards);
		if (!displayDeck) return;

		await message.delete();
		await message.channel.send(`Here's the deck <@${message.author.id}> shared:\n\`\`\`${displayDeck}\`\`\`\nTap here on mobile:\n\`${deckcode.deckcode}\``);

	} catch (err) {
		console.log(`error processing: ${message.content}\n${err}`);
	}
});

client.login(TOKEN);