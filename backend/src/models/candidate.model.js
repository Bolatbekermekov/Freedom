import mongoose from 'mongoose'

const candidateSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: false,
		},
		phone: {
			type: String,
			required: false,
		},
		resumeFilePath: {
			type: String,
			required: false,
		},
		analysisStatus: {
			type: String,
			enum: ['ожидание', 'не подходит', 'частично подходит', 'подходит'],
			default: 'ожидание',
			required: true,
		},
		analysisResult: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: false,
	},
)

export const Candidate = mongoose.model('Candidate', candidateSchema)
