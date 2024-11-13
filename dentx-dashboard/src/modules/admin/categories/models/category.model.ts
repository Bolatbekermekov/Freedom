export interface ICategories {
	id: string
	section: string
	imageUrl: string
	subCategories?: ISubCategories[]
}

export interface ISubCategories {
	_id: string
	category: string
	section: ICategories
}
