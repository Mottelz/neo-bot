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


		const isDeckcodeLine = (line) => !line.trim().startsWith('#') && !line.trim().includes(' ') && line.trim().length > 0;
		const lines = message.content.split('\n');
		const codeLine = lines.findIndex(isDeckcodeLine);
		let boilerplateLine = -1;
		for (let i = codeLine + 1; i < lines.length; i++) {
			const trimmed = lines[i].trim();
			if (!trimmed.startsWith('#')) break;
			if (trimmed !== '#') {
				boilerplateLine = i;
				break;
			}
		}
		const isDeckLine = (line, i) => {
			const trimmed = line.trim();
			return /^#\s*\(\d+\)\s+\S/.test(trimmed)
				|| trimmed === '#'
				|| i === boilerplateLine
				|| isDeckcodeLine(line);
		};
		const firstDeckLine = lines.findIndex(isDeckLine);
		const before = lines.slice(0, firstDeckLine).join('\n').trim();
		const after = lines.slice(firstDeckLine).filter((line, i) => !isDeckLine(line, firstDeckLine + i)).join('\n').trim();

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