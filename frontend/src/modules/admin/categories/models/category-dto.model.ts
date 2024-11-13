export interface CreateCategoryDTO {
	name: string
	file: File
}

export interface UpdateCategoryDTO {
	name: string
}

export interface ICategoryFilter {
	searchValue?: string
	sort?: string
	view?: string
}

export const CategoriesSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const CategoriesViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}
