import { axiosBase } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'
import { ISubCategories } from '@/modules/admin/categories/models/category.model'

class SubCategoriesAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/product`

	async getSubCategories(categoryId: string) {
		return axiosBase
			.get<{
				categories: ISubCategories[]
			}>(`${this.baseUrl}/categories`, { params: { categoryId } })
			.then(res => res.data.categories)
	}
}

export const subCategoriesAPIService = new SubCategoriesAPIClass()
