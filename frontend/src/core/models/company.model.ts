export enum COMPANY_TYPES {
	CLINIC = 'CLINIC',
	STORE = 'STORE'
}

export interface ICompany {
	name: string
	phone: string
	description: string | null
	logoUrl: string | null
	address: string
	type: COMPANY_TYPES
}
