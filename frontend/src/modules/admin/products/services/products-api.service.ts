import {
	Pageable,
	PaginatedResult
} from '../../../../core/models/paginated.model'
import {
	CreateProductDTO,
	IProductsFilter,
	ParsedCreateProductDTO,
	UpdateProductDTO
} from '../models/product-dto.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'
import { IProducts } from '@/modules/admin/products/models/product.model'

class AdminProductsAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/products`

	async getProducts(
		pageable: Pageable,
		filter: IProductsFilter
	): Promise<PaginatedResult<IProducts[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}`, { params: params })
			.then(res => res.data)
	}

	async getProductById(id: string) {
		return axiosWithAuth
			.get<IProducts>(`${this.baseUrl}/${id}`)
			.then(res => res.data)
	}

	async createProduct(dto: CreateProductDTO) {
		const formData = new FormData()

		Object.entries(dto).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value)
			}
		})

		return axiosWithAuth.post(`${this.baseUrl}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	}

	async generateBarcode() {
		return axiosWithAuth
			.post<{ barcode: string }>(`${this.baseUrl}/generate-barcode`)
			.then(res => res.data)
	}

	async uploadParsedProducts(dto: ParsedCreateProductDTO[]) {
		const formData = new FormData()

		dto.forEach((product, index) => {
			formData.append(`products[${index}][name]`, product.name)
			formData.append(`products[${index}][description]`, product.description)
			formData.append(`products[${index}][category]`, product.category)
			formData.append(`products[${index}][section]`, product.section)
			formData.append(`products[${index}][price]`, product.price.toString())
			formData.append(`products[${index}][stock]`, product.stock.toString())
			formData.append(`products[${index}][productCode]`, product.productCode)
			formData.append(`products[${index}][file]`, product.file)

			if (product.size)
				formData.append(`products[${index}][size]`, product.size)
			if (product.manufacturer)
				formData.append(
					`products[${index}][manufacturer]`,
					product.manufacturer
				)
			if (product.packageSize)
				formData.append(`products[${index}][packageSize]`, product.packageSize)
			if (product.onecname)
				formData.append(`products[${index}][onecname]`, product.onecname)
			if (product.extraDescription)
				formData.append(
					`products[${index}][extraDescription]`,
					product.extraDescription
				)
			if (product.labels)
				formData.append(`products[${index}][labels]`, product.labels)
			if (product.measureUnit)
				formData.append(`products[${index}][measureUnit]`, product.measureUnit)
			if (product.color)
				formData.append(`products[${index}][color]`, product.color)
		})

		return axiosWithAuth.post(`${this.baseUrl}/upload`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	}

	async updateProduct(id: string, dto: UpdateProductDTO) {
		const formData = new FormData()

		Object.entries(dto).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value)
			}
		})

		return axiosWithAuth.put(`${this.baseUrl}/${id}`, dto, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	}

	async getProductByBarcode(barcode: string) {
		return axiosWithAuth
			.get<IProducts>(`${this.baseUrl}/barcode/${barcode}`)
			.then(res => res.data)
	}
}

export const adminProductsAPIService = new AdminProductsAPIClass()
