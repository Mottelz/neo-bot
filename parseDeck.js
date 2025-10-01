const parseDeck = (decklist) => {
	try {
		const splitter = decklist.includes('\\n') ? '\\n' : '\n';
		const split_str = decklist.split(splitter);
		const cards = split_str
			.filter(line => line.startsWith('# ('))
			// .map(line => line.replace(/^# /, ''))
			.join('\n');
		const deck_code = split_str.filter(line => !line.startsWith('#') && line.length > 0);
		return cards + '\n\n' + deck_code[0];
	}
	catch (error) {
		console.error('Error parsing decklist string:', error);
		return null;
	}
}

module.exports = parseDeck;
