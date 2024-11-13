export interface CreateProductDTO {
	name: string
	barcode: string
	description: string
	subCategoryId: string
	price: number
	stock: number
	productCode: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	extraDescription?: string
	labels?: string
	measureUnit?: string
	color?: string
	file: File
}

export interface RawParsedProduct {
	name: string
	description: string
	category: string
	section: string
	price: number
	stock: number
	productCode: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	extraDescription?: string
	measureUnit?: string
	color?: string
}

export interface ParsedProduct {
	index: number
	name: string
	description: string
	section: string
	category: string
	price: number
	stock: number
	productCode: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	extraDescription?: string
	labels?: string
	measureUnit?: string
	color?: string
	file?: File
}

export interface ParsedCreateProductDTO {
	name: string
	description: string
	section: string
	category: string
	price: number
	stock: number
	productCode: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	extraDescription?: string
	labels?: string
	measureUnit?: string
	color?: string
	file: File
}

export interface UpdateProductDTO {
	name: string
	description: string
	barcode: string
	subCategoryId?: string
	price: number
	stock: number
	productCode: string
	size?: string
	manufacturer?: string
	packageSize?: string
	onecname?: string
	extraDescription?: string
	labels?: string
	measureUnit?: string
	color?: string
	hidden?: boolean
	file?: File
}

export interface IProductsFilter {
	searchValue?: string
	sort?: string
	view?: string
	subCategoryId?: string
}

export const ProductsSortTypes = {
	DATE_ASC: 'createdAt,asc',
	DATE_DESC: 'createdAt,desc'
}

export const ProductsViewTypes = {
	TABLE: 'table',
	LIST: 'list'
}
