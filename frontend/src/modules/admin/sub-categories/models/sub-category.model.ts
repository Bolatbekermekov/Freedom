import { ICategories } from '../../categories/models/category.model'

export interface ISubCategories {
	_id: string
	category: string
	section: ICategories
}
