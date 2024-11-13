export interface CreateSubCategoryDTO {
	name: string
	categoryId: string
}

export interface UpdateSubCategoryDTO {
	name: string
}

export interface ISubCategoryFilter {
	searchValue?: string
	sort?: string
	view?: string
	categoryId?: string
}

export const SubCategoriesSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const SubCategoriesViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}
