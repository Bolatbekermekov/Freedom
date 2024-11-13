import { Company } from '../models/company.model.js'
import { logger } from '../utils/logger.utils.js'

class CompanyService {
	async createCompany(dto) {
		const { name, phone, description, address, type, city, iinBin } = dto

		const company = await Company.create({
			name,
			phone,
			description,
			address,
			type,
			city,
			iinBin,
		})

		return company
	}

	async getCompany(id) {
		const company = await Company.findById(id)

		if (!company) {
			throw new Error('Company not found')
		}

		return company
	}

	async updateCompany(id, dto) {
		const { name, phone, description, address, city, iinBin, bankInformation } = dto

		try {
			const company = await Company.findById(id)
			if (!company) {
				throw new Error('Company not found')
			}

			if (name) company.name = name
			if (phone) company.phone = phone
			if (description) company.description = description
			if (address) company.address = address
			if (city) company.city = city
			if (iinBin) company.iinBin = iinBin

			if (bankInformation) {
				company.bankInformation = {
					...company.bankInformation.toObject(),
					...bankInformation,
				}
			}

			const updatedCompany = await company.save()
			return updatedCompany
		} catch (error) {
			logger.error('Error updating company', error)
			throw error
		}
	}
}

export const companyService = new CompanyService()
