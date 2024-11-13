import { CategoryFilterDTO } from '../models/categories-filter.model'

import { axiosBase } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'
import { ICategories } from '@/modules/admin/categories/models/category.model'

class CategoriesAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/product`

	async getCategories(filter?: CategoryFilterDTO) {
		return axiosBase
			.get<{
				sections: ICategories[]
			}>(`${this.baseUrl}/sections`, { params: filter })
			.then(res => res.data.sections)
	}
}

export const categoriesAPIService = new CategoriesAPIClass()
