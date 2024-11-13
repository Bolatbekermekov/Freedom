// Import the necessary module from the natural library
import natural from 'natural'

const { TfIdf } = natural

// Sample documents for indexing
const documents = [
	'368-010M-FG Боры алмазные Алмазные боры серии Prima Classic отличаются своей наде',
	'It`s a common technique used in information retrieval and text mining.',
	'TF-IDF reflects the importance of a word in a document relative to a collection of documents.',
	'some test',
]

// Create a new instance of TfIdf
const tfidf = new TfIdf()

// Add documents to the TfIdf instance
documents.forEach(document => {
	tfidf.addDocument(document)
})

// Search for documents based on a query
const query = 'Бор'
tfidf.documents.forEach((document, index) => {
	let measure = 0
	// Iterate through each term in the document
	Object.keys(document).forEach(term => {
		// Check if the term contains the query as a substring
		if (term.toLowerCase().includes(query.toLowerCase())) {
			// Increase the measure if the term contains the query as a substring
			measure += document[term] * 1.5 // Increase score by 50%
		}
	})
	console.log(`Document ${index + 1}: ${measure}`)
})
