export interface RegisterStoreDTO {
	name: string
	phone: string
	description?: string
	address: string
	logo?: File
	city: string
}

export interface UpdateCompanyDTO {
	name?: string
	phone?: string
	description?: string
	address?: string
	city?: string
	iinBin?: string
	bankInformation?: CompanyBankDTO
}

export enum CompanyType {
	STORE = 'STORE',
	CLINIC = 'CLINIC'
}

interface CompanyBankDTO {
	bankName?: string
	individualIdentityCode?: string
	beneficiaryCode?: string
	bankIdentificationCode?: string
	paymentCode?: string
}

export interface CompanyDTO {
	_id: string
	name: string
	phone: string
	description: string
	address: string
	city: string
	type: CompanyType
	iinBin: string
	bankInformation?: CompanyBankDTO
}
