export const adminProductsDocs = {
	'/api/v2/admin/products/': {
		get: {
			tags: ['Admin Products'],
			description: 'Get all products',
			security: [
				{
					BearerAuth: [],
				},
			],
			parameters: [
				{
					in: 'query',
					name: 'page',
					schema: { type: 'integer' },
					description: 'Page number for pagination',
				},
				{
					in: 'query',
					name: 'size',
					schema: { type: 'integer' },
					description: 'Number of items per page',
				},
				{
					in: 'query',
					name: 'searchValue',
					schema: { type: 'string' },
					description: 'Value to search for in product name, description, or barcode',
				},
				{
					in: 'query',
					name: 'sort',
					schema: { type: 'string' },
					description: 'Sort order (e.g., "createdAt,desc", "createdAt,desc")',
				},
				{
					in: 'query',
					name: 'subCategoryId',
					schema: { type: 'string' },
					description: 'ID of the sub-category to filter products by',
				},
			],
			responses: {
				200: {
					description: 'Successful operation',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/PaginatedProducts',
							},
						},
					},
				},
				500: {
					description: 'Internal server error',
				},
			},
		},
		post: {
			summary: 'Create a new product',
			description: 'Create a new product with provided details',
			tags: ['Admin Products'],
			security: [{ BearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'multipart/form-data': {
						schema: { $ref: '#/components/schemas/CreateProduct' },
					},
				},
			},
			responses: {
				200: {
					description: 'Product created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									message: { type: 'string' },
								},
							},
						},
					},
				},
				400: {
					description: 'Bad Request',
				},
				500: {
					description: 'Internal Server Error',
				},
			},
		},
	},
	'/api/v2/admin/products/{id}': {
		get: {
			summary: 'Get product details by ID',
			description: 'Retrieve details of a product by its ID',
			tags: ['Admin Products'],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'id',
					schema: { type: 'string' },
					required: true,
					description: 'ID of the product',
				},
			],
			responses: {
				200: {
					description: 'Product details retrieved successfully',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Product',
							},
						},
					},
				},
				404: {
					description: 'Product not found',
				},
				500: {
					description: 'Internal Server Error',
				},
			},
		},
		put: {
			summary: 'Update a product by ID',
			description: 'Update a product with provided details',
			tags: ['Admin Products'],
			security: [{ BearerAuth: [] }],
			parameters: [
				{
					in: 'path',
					name: 'id',
					schema: { type: 'string' },
					required: true,
					description: 'ID of the product',
				},
			],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UpdateProduct' },
					},
				},
			},
			responses: {
				200: {
					description: 'Product updated successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									message: { type: 'string' },
								},
							},
						},
					},
				},
				404: {
					description: 'Product not found',
				},
				500: {
					description: 'Internal Server Error',
				},
			},
		},
	},
}

export const adminProductsSchema = {
	PaginatedProducts: {
		type: 'object',
		properties: {
			docs: {
				type: 'array',
				items: {
					$ref: '#/components/schemas/Product',
				},
			},
			totalDocs: { type: 'integer' },
			offset: { type: 'integer' },
			limit: { type: 'integer' },
			totalPages: { type: 'integer' },
			page: { type: 'integer' },
			pagingCounter: { type: 'integer' },
			hasPrevPage: { type: 'boolean' },
			hasNextPage: { type: 'boolean' },
			prevPage: { type: 'integer' },
			nextPage: { type: 'integer' },
		},
	},
	CreateProduct: {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			description: { type: 'string', required: true },
			subCategoryId: { type: 'string', required: true },
			price: { type: 'number', required: true },
			stock: { type: 'number', required: true },
			productCode: { type: 'string', required: true },
			barcode: { type: 'string', required: true },
			image: { type: 'string', format: 'binary', required: true },
			size: { type: 'string' },
			color: { type: 'string' },
			country: { type: 'string' },
			manufacturer: { type: 'string' },
			packageSize: { type: 'string' },
			onecname: { type: 'string' },
			extraDescription: { type: 'string' },
			labels: { type: 'string' },
			measureUnit: { type: 'string' },
		},
	},
	UpdateProduct: {
		type: 'object',
		properties: {
			name: { type: 'string', description: 'Product Name' },
			description: {
				type: 'string',
				description: 'Product Description',
			},
			category: { type: 'string', description: 'Category ID' },
			price: { type: 'number', description: 'Product Price' },
			stock: { type: 'number', description: 'Product Stock' },
			productCode: { type: 'string', description: 'Product Code' },
			size: { type: 'string', description: 'Product Size' },
			color: { type: 'string', description: 'Product Color' },
			onecname: { type: 'string', description: 'One C Name' },
			extraDescription: {
				type: 'string',
				description: 'Extra Description',
			},
			labels: { type: 'string', description: 'Labels' },
			country: { type: 'string', description: 'Country' },
			manufacturer: { type: 'string', description: 'Manufacturer' },
			packageSize: { type: 'string', description: 'Package Size' },
			hidden: { type: 'boolean', description: 'Not visible for users' },
		},
	},
	Product: {
		type: 'object',
		properties: {
			_id: {
				type: 'string',
			},
			productCode: { type: 'string' },
			name: { type: 'string' },
			onecname: { type: 'string' },
			description: { type: 'string' },
			extraDescription: { type: 'string' },
			price: { type: 'number' },
			stock: { type: 'number' },
			characteristics: { type: 'object' },
			manufacturer: { type: 'string' },
			country: { type: 'string' },
			packageSize: { type: 'string' },
			images: { type: 'array', items: { type: 'string' } },
			labels: { type: 'string' },
			measureUnit: { type: 'string' },
			color: { type: 'string' },
			size: { type: 'string' },
			hidden: { type: 'boolean' },
			barcode: { type: 'string' },
			category: { type: 'string' },
			createdAt: { type: 'string', format: 'date-time' },
		},
	},
}
