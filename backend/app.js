import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { swaggerDocs } from './src/config/swagger.config.js'
import { errorMiddleware } from './src/middlewares/error.js'
import { adminAnalyticsRouter } from './src/routes/admin/admin-analytics.route.js'
import { adminCategoriesRouter } from './src/routes/admin/admin-categories.route.js'
import { adminOrderRouter } from './src/routes/admin/admin-orders.route.js'
import { adminProductRouter } from './src/routes/admin/admin-products.route.js'
import { adminPromotionRouter } from './src/routes/admin/admin-promotions.route.js'
import { adminSubCategoriesRouter } from './src/routes/admin/admin-subcategories.route.js'
import { adminUsersRouter } from './src/routes/admin/admin-users.route.js'
import { companiesRouter } from './src/routes/companies.route.js'
import notification from './src/routes/notification.js'
import { orderReceiptRouter } from './src/routes/order-receipt.route.js'
import order from './src/routes/order.js'
import product from './src/routes/product.js'
import promotion from './src/routes/promotion.js'
import shipping_info from './src/routes/shipping_info.js'
import { superAdminAnalyticsRouter } from './src/routes/superadmin/superadmin-analytics.route.js'
import user from './src/routes/user.js'
import orderV1 from './src/routes/v1/order.js'
import productV1 from './src/routes/v1/product.js'
import shipping_infoV1 from './src/routes/v1/shipping_info.js'
import userV1 from './src/routes/v1/user.js'
import version from './src/routes/version.js'
import { morganMiddleware } from './src/utils/logger.utils.js'

config({
	path: './.env',
})
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const app = express()

// Using Middlewares
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morganMiddleware)
app.use(
	cors({
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		origin: [process.env.FRONTEND_URI_2, process.env.FRONTEND_URI_3],
	}),
)
app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	res.render('index', { title: 'Главная' })
})

app.get('/about', (req, res) => {
	res.render('about', { title: 'О Нас' })
})

app.get('/contact', (req, res) => {
	res.render('contact', { title: 'Свяжитесь с нами' })
})
app.get('/thankyou', (req, res) => {
	res.render('thankyou', { title: 'Спасибо' })
})

app.get('/error', (req, res) => {
	res.render('error', { title: 'Ошибка' })
})

app.use('/api/v1/user', userV1)
app.use('/api/v1/product', productV1)
app.use('/api/v1/order', orderV1)
app.use('/api/v1/shipping-info', shipping_infoV1)

///////////

app.use('/api/v2/user', user)
app.use('/api/v2/product', product)
app.use('/api/v2/order', order)
app.use('/api/v2/order-receipt', orderReceiptRouter)
app.use('/api/v2/shipping-info', shipping_info)
app.use('/api/v2/companies', companiesRouter)
app.use('/api/v2/app', version)
app.use('/api/v2/promotion', promotion)
app.use('/api/v2/notifications', notification)

//Admin Routes
app.use('/api/v2/admin/users', adminUsersRouter)
app.use('/api/v2/admin/orders', adminOrderRouter)
app.use('/api/v2/admin/products', adminProductRouter)
app.use('/api/v2/admin/categories', adminCategoriesRouter)
app.use('/api/v2/admin/sub-categories', adminSubCategoriesRouter)
app.use('/api/v2/admin/analytics', adminAnalyticsRouter)
app.use('/api/v2/admin/promotions', adminPromotionRouter)

// Superadmin Routes
app.use('/api/v2/superadmin/analytics', superAdminAnalyticsRouter)

// Using Error Middleware
app.use(errorMiddleware)

// Swagger
swaggerDocs(app, process.env.PORT, process.env.BASE_URL)

// 404 page
app.use((req, res) => {
	res.status(404).render('404', { title: '404' })
})
