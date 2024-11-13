import { User } from '../models/user.js'

class UsersService {
	async getById(id) {
		const user = await User.findById(id).populate('company')

		if (!user) throw new Error('User not found')

		return user
	}
}

export const usersService = new UsersService()
