import {
	Pageable,
	PaginatedResult
} from '../../../../core/models/paginated.model'
import {
	CreateSubCategoryDTO,
	ISubCategoryFilter,
	UpdateSubCategoryDTO
} from '../models/sub-category-dto.model'
import { ISubCategories } from '../models/sub-category.model'

import { axiosWithAuth } from '@/core/api/interceptors'
import { environment } from '@/core/config/environment.config'

class AdminSubCategoriesAPIClass {
	baseUrl = `${environment.apiUrl}/api/v2/admin/sub-categories`

	async getSubCategories(
		pageable: Pageable,
		filter: ISubCategoryFilter
	): Promise<PaginatedResult<ISubCategories[]>> {
		const params = {
			...pageable,
			...filter
		}

		return axiosWithAuth
			.get(`${this.baseUrl}`, { params: params })
			.then(res => res.data)
	}

	async getSubCategory(id: string): Promise<ISubCategories> {
		return axiosWithAuth.get(`${this.baseUrl}/${id}`).then(res => res.data)
	}

	async createSubCategory(dto: CreateSubCategoryDTO) {
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

	async updateSubCategory(id: string, dto: UpdateSubCategoryDTO) {
		const formData = new FormData()

		Object.entries(dto).forEach(([key, value]) => {
			if (value) {
				formData.append(key, value)
			}
		})

		return axiosWithAuth.put(`${this.baseUrl}/${id}`, dto)
	}
}

export const adminSubCategoriesAPIService = new AdminSubCategoriesAPIClass()
