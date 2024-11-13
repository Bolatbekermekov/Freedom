import { ISubCategories } from '../../categories/models/category.model'

export interface IProducts {
	_id: string
	productCode: string
	barcode: string
	name: string
	description: string
	price: number
	stock: number
	imageUrls: string[]
	characteristics: { [key: string]: string }
	images: string[]
	color: string
	category: ISubCategories
	createdAt: Date
	extraDescription?: string
	measureUnit?: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	labels?: string
	hidden?: boolean
}
