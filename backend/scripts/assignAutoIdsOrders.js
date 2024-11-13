import { config } from 'dotenv'

import { connectDB } from '../src/database/database.js'
import { Order } from '../src/models/order.js'
import { logger } from '../src/utils/logger.utils.js'

config({ path: './.env' })

await connectDB()

async function assignAutoIds() {
	try {
		const lastDocument = await Order.find().sort({ autoId: -1 }).limit(1)
		let highestId = lastDocument[0] ? lastDocument[0].autoId ?? 0 : 0

		const cursor = Order.find().cursor()

		for await (const doc of cursor) {
			if (!doc.autoId) {
				highestId++
				doc.autoId = highestId
				await doc.save()
			}
		}

		console.log('Successfully assigned autoIds to existing documents!')
	} catch (err) {
		logger.error(err)
	}
}

assignAutoIds().catch(err => logger.error('Unhandled error:', err))
