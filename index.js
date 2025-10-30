const dotenv = require('dotenv');
dotenv.config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const snapdeck = require('snapdeck');
const parseDeck = require('./parseDeck');

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
		console.log(`extracted deckcode: ${JSON.stringify(deckcode)}`);
		if (!deckcode) return;
		const deck = await snapdeck.parseDeckcode(deckcode);
		console.log(`parsed deck: ${JSON.stringify(deck)}`);
		if (!deck) return;
		const displayDeck = await snapdeck.generateDisplayString(deck.cards);
		console.log(`generated display deck: ${displayDeck}`);
		if (!displayDeck) return;

		await message.delete();

		await message.channel.send(`Here's the deck <@${message.author.id}> shared:\n\`\`\`${displayDeck}\`\`\``);
	} catch (err) {
		console.log(`error processing: ${message.content}\n${err}`);
	}
});

client.login(TOKEN);