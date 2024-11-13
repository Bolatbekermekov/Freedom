import mongoose from 'mongoose'

const searchQuerySchema = new mongoose.Schema(
	{
		query: {
			type: String,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: false,
		},
	},
	{ timestamps: true },
)

export const SearchQuery = mongoose.model('SearchQuery', searchQuerySchema)
