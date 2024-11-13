export interface AddCompanyUserDTO {
	name: string
	phone: string
	password: string
}

export interface ICompanyUsersFilter {
	searchValue?: string
	sort?: string
	view?: string
}

export const CompanyUsersSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const CompanyUsersViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}
