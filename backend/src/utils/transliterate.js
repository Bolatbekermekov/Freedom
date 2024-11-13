const latinToCyrillicMap = {
	a: 'а',
	b: 'б',
	c: ['ц', 'к'],
	d: 'д',
	e: ['е', 'э'],
	f: 'ф',
	g: ['г', 'дж'],
	h: 'х',
	i: ['и', 'ий', 'ай'],
	j: ['дж', 'й'],
	k: 'к',
	l: 'л',
	m: 'м',
	n: 'н',
	o: 'о',
	p: 'п',
	q: ['к', 'кью'],
	r: 'р',
	s: 'с',
	t: 'т',
	u: ['у', 'ю', 'а'],
	v: 'в',
	w: ['в', 'y'],
	x: 'кс',
	y: ['й', 'ай'],
	z: 'з',
	zh: 'ж',
	ch: 'ч',
	sh: ['ш', 'щ'],
	ya: 'я',
}

function transliterateWordLatinToCyrillic(word) {
	const results = []

	function generateCombinations(prefix, index) {
		if (index === word.length) {
			results.push(prefix)
			return
		}

		const currentChar = word[index].toLowerCase()
		const possibleChars = latinToCyrillicMap[currentChar] || [currentChar]

		for (const char of possibleChars) {
			generateCombinations(prefix + char, index + 1)
		}

		// Check for multi-character combinations
		if (index + 1 < word.length) {
			const nextTwoChars = word.substring(index, index + 2).toLowerCase()
			const possibleMultiChars = latinToCyrillicMap[nextTwoChars]
			if (possibleMultiChars) {
				for (const multiChar of possibleMultiChars) {
					generateCombinations(prefix + multiChar, index + 2)
				}
			}
		}
	}

	generateCombinations('', 0)
	return results
}

function transliterateTextLatinToCyrillic(text) {
	const words = text.split(/\s+/)
	const uniqueWords = new Set(words)
	const transliteratedWords = []

	for (const word of uniqueWords) {
		const transliterations = transliterateWordLatinToCyrillic(word)
		transliteratedWords.push(transliterations.join(', '))
	}

	return transliteratedWords.join(' ')
}

export { transliterateTextLatinToCyrillic }
