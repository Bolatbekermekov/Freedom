export const usersDocs = {
	'/api/v2/admin/users/signup': {
		post: {
			summary: 'Sign up',
			description: 'Create a new user',
			tags: ['Users'],
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Signup' },
					},
				},
			},
			responses: {
				200: {
					description: 'User created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									message: { type: 'string' },
									token: { type: 'string' },
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
	'/api/v2/admin/users/login': {
		post: {
			summary: 'Log in',
			description: 'Log in into account',
			tags: ['Users'],
			security: [{ bearerAuth: [] }],
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Login' },
					},
				},
			},
			responses: {
				200: {
					description: 'User created successfully',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									success: { type: 'boolean' },
									message: { type: 'string' },
									token: { type: 'string' },
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
}

export const usersDocsSchema = {
	User: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				required: true,
			},
			phone: {
				type: 'string',
				required: true,
			},
			address: {
				type: 'string',
				required: true,
			},
			city: {
				type: 'string',
				required: true,
			},
			country: {
				type: 'string',
				required: true,
			},
			role: {
				type: 'string',
				required: true,
			},
		},
	},
	CreateCompany: {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			phone: { type: 'string', required: true },
			description: { type: 'string', required: true },
			address: { type: 'string', required: true },
			type: { type: 'string', required: true },
			city: { type: 'string', required: true },
		},
	},
	Signup: {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			phone: { type: 'string', required: true },
			password: { type: 'string', required: true },
			company: { $ref: '#/components/schemas/CreateCompany' },
		},
	},
	Login: {
		type: 'object',
		properties: {
			phone: { type: 'string', required: true },
			password: { type: 'string', required: true },
		},
	},
	BearerAuth: {
		type: 'http',
		scheme: 'bearer',
		bearerFormat: 'JWT',
	},
}
