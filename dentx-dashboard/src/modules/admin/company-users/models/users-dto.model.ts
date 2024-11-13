import { COMPANY_TYPES } from '@/core/models/company.model'

export interface CreateUserDTO {
	name: string
	phone: string
	password: string
	company: {
		name: string
		phone: string
		description?: string
		address: string
		logo?: File
		type: COMPANY_TYPES
		city: string
	}
}

export interface UsersFilterDTO {
	searchValue?: string
	sort?: string
	view?: string
}

export const UsersSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const UsersViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}
