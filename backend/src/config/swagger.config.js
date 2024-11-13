import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import { adminOrdersDocs, adminOrdersDocsSchema } from '../docs/admin-orders.docs.js'
import { adminProductsDocs, adminProductsSchema } from '../docs/admin-products.docs.js'
import { usersDocs, usersDocsSchema } from '../docs/users.docs.js'

export function swaggerDocs(app, port, baseUrl) {
	const swaggerDocument = swaggerJSDoc({
		definition: {
			openapi: '3.1.0',
			info: {
				title: 'DentX API Documentation',
				version: '0.0.1',
				description: 'API endpoints for a DentX services documented on swagger',
			},
			basePath: '/',
			servers: [
				{
					url: baseUrl,
					description: 'Available URL',
				},
				{
					url: `http://localhost:${port}`,
					description: 'Local server',
				},
			],
			tags: [
				{
					name: 'Admin Products',
					description: 'API endpoints for managing products by admins.',
				},
			],
			paths: {
				...adminProductsDocs,
				...usersDocs,
				...adminOrdersDocs,
			},
			components: {
				schemas: {
					...adminProductsSchema,
					...usersDocsSchema,
					...adminOrdersDocsSchema,
				},
			},
		},
		apis: ['./routes/**/*.js'],
	})

	app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

	app.get('/api/docs.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json')
		res.send(swaggerDocument)
	})
}
