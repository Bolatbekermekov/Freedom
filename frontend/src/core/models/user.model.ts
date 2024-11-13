import { ICompany } from './company.model'
import { IImages } from './images.model'

export enum ROLES {
	SUPERADMIN = 'superadmin',
	ADMIN = 'admin',
	USER = 'user'
}

export interface IUser {
	_id: string
	name: string
	phone: string
	role: ROLES
	avatar?: IImages
	address: string
	city: string
	country: string
	createdAt: Date
	company?: ICompany
}
