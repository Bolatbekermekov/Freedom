import mongoose from 'mongoose'

const {
	Types: { ObjectId },
} = mongoose

export const isObjectId = id => {
	return mongoose.isValidObjectId(id)
}

export const convertToObjectId = id => {
	if (!isObjectId(id)) {
		throw new Error('Invalid object id')
	}

	return ObjectId(id)
}
