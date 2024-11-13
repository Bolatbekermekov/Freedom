export const adminOrdersDocs = {
	'/api/v2/admin/orders': {
		get: {
			summary: 'Retrieve a list of orders',
			description: 'Get orders based on query parameters',
			tags: ['Orders'],
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'page',
					in: 'query',
					required: false,
					schema: {
						type: 'integer',
						example: 1,
					},
				},
				{
					name: 'size',
					in: 'query',
					required: false,
					schema: {
						type: 'integer',
						example: 10,
					},
				},
				{
					name: 'searchValue',
					in: 'query',
					required: false,
					schema: {
						type: 'string',
					},
				},
				{
					name: 'sort',
					in: 'query',
					required: false,
					schema: {
						type: 'string',
						example: 'createdAt,desc',
					},
				},
				{
					name: 'status',
					in: 'query',
					required: false,
					schema: {
						type: 'string',
						enum: [
							'Active',
							'All',
							'Order Created',
							'Preparing',
							'Shipped',
							'Next Day Shipping',
							'Delivered',
						],
						example: 'Active',
					},
				},
				{
					name: 'paginate',
					in: 'query',
					required: false,
					schema: {
						type: 'boolean',
						example: true,
					},
				},
			],
			responses: {
				200: {
					description: 'A list of orders',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									docs: {
										type: 'array',
										items: { $ref: '#/components/schemas/Order' },
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
	'/api/v2/admin/orders/{id}': {
		get: {
			summary: 'Get order details',
			description: 'Get details of a specific order by ID',
			tags: ['Orders'],
			security: [{ bearerAuth: [] }],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
					schema: {
						type: 'string',
						example: '66708ffa766f6122f19cfb19',
					},
				},
			],
			responses: {
				200: {
					description: 'Order details retrieved successfully',
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Order' },
						},
					},
				},
				404: {
					description: 'Order Not Found',
				},
				500: {
					description: 'Internal Server Error',
				},
			},
		},
	},
}

export const adminOrdersDocsSchema = {
	OrderItem: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			image: { type: 'string' },
			price: { type: 'number' },
			quantity: { type: 'integer' },
			barcode: { type: 'string' },
			product: {
				type: 'object',
				properties: {
					_id: { type: 'string' },
					productCode: { type: 'string' },
					name: { type: 'string' },
					description: { type: 'string' },
					price: { type: 'number' },
					stock: { type: 'integer' },
					images: { type: 'array', items: { type: 'string' } },
					hidden: { type: 'boolean' },
					barcode: { type: 'string' },
					category: { type: 'string' },
					company: { type: 'string' },
					createdAt: { type: 'string' },
				},
			},
			_id: { type: 'string' },
		},
	},
	Order: {
		type: 'object',
		properties: {
			shippingInfo: {
				type: 'object',
				properties: {
					address: { type: 'string' },
					city: { type: 'string' },
					country: { type: 'string' },
				},
			},
			customer: {
				type: 'object',
				properties: {
					phone: { type: 'string' },
					name: { type: 'string' },
				},
			},
			_id: { type: 'string' },
			orderItems: {
				type: 'array',
				items: { $ref: '#/components/schemas/OrderItem' },
			},
			paymentMethod: { type: 'string' },
			isPaid: { type: 'boolean' },
			itemsPrice: { type: 'number' },
			taxPrice: { type: 'number' },
			shippingCharges: { type: 'number' },
			totalAmount: { type: 'number' },
			orderStatus: { type: 'string' },
			storeCompany: { type: 'string' },
			createdAt: { type: 'string' },
			autoId: { type: 'integer' },
			__v: { type: 'integer' },
		},
	},
	BearerAuth: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
	},
}
