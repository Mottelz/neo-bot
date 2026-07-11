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


		const isCardLine = (line) => /^#\s*\(\d+\)\s+\S/.test(line.trim());
		const isCommentLine = (line) => line.trim().startsWith('#');
		const isDeckcodeLine = (line) => {
			const trimmed = line.trim();
			return !trimmed.startsWith('#') && !trimmed.includes(' ') && trimmed.length > 0;
		};
		const lines = message.content.split('\n');

		// The Snap export is one contiguous block: card lines, bare `#` lines,
		// the deckcode, then the (possibly multi-line, non-English) boilerplate.
		// Consume the whole block so no stray comment line survives at the bottom.
		const firstCard = lines.findIndex(isCardLine);
		const blockStart = firstCard >= 0 ? firstCard : lines.findIndex(isDeckcodeLine);
		let blockEnd = blockStart;
		for (let i = blockStart; blockStart >= 0 && i < lines.length; i++) {
			if (lines[i].trim() === '') break;
			if (isCommentLine(lines[i]) || isDeckcodeLine(lines[i])) blockEnd = i;
			else break;
		}
		const before = blockStart >= 0 ? lines.slice(0, blockStart).join('\n').trim() : '';
		const after = blockStart >= 0 ? lines.slice(blockEnd + 1).join('\n').trim() : '';

		await message.delete();
		await message.channel.send(
			`<@${message.author.id}> shared:\n` +
			(before ? `${before}\n\n` : '') +
			`\`\`\`\n${displayDeck}\n\`\`\`\n Deckcode:\n\`${shortcode}\`` +
			(after ? `\n${after}` : '')
		);

	} catch (err) {
		console.log(`error processing: ${message.content}\n${err}`);
	}
});

client.login(TOKEN);