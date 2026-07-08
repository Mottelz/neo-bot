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

		const displayDeck = await snapdeck.generateSimplifiedDisplayString(deck.cards);
		if (!displayDeck) return;

		const shortcode = snapdeck.getDeckCode(deck);
		if (!shortcode) return;

		// Same rule extractDeckcode uses to identify deckcode lines
		const isDeckcodeLine = (line) => !line.trim().startsWith('#') && !line.trim().includes(' ') && line.trim().length > 0;
		const lines = message.content.split('\n');
		const firstDeckcodeLine = lines.findIndex(isDeckcodeLine);
		const before = lines.slice(0, firstDeckcodeLine).join('\n').trim();
		const after = lines.slice(firstDeckcodeLine).filter((line) => !isDeckcodeLine(line)).join('\n').trim();

		await message.delete();
		await message.channel.send(
			`<@${message.author.id}> shared:\n` +
			(before ? `${before}\n` : '') +
			`${displayDeck}\n Deckcode:\n\`${shortcode}\`` +
			(after ? `\n${after}` : '')
		);

	} catch (err) {
		console.log(`error processing: ${message.content}\n${err}`);
	}
});

client.login(TOKEN);