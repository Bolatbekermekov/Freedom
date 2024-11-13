import { SearchProductsDTO } from '../models/products-dto.model'

import { axiosBase } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'
import { IProducts } from '@/modules/admin/products/models/product.model'

class ProductsAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/product`

	async searchProducts(dto?: SearchProductsDTO) {
		return axiosBase
			.get<IProducts[]>(`${this.baseUrl}/search`, { params: dto })
			.then(res => res.data)
	}

	async getProductById(productId: string) {
		return axiosBase
			.get<{ product: IProducts }>(`${this.baseUrl}/single/${productId}`)
			.then(res => res.data.product)
	}
}

export const ProductsAPIService = new ProductsAPIClass()
