class AdminPages {
	private readonly baseUrl = '/store/admin'

	DASHBOARD = `${this.baseUrl}`
	MONITORING = `${this.baseUrl}/monitoring`
	ORDERS = `${this.baseUrl}/orders`
	CATEGORIES = `${this.baseUrl}/categories`
	SUB_CATEGORIES = `${this.baseUrl}/sub-categories`
	PRODUCTS = `${this.baseUrl}/products`
	RESUME = `${this.baseUrl}/resume`
	COMPANY_USERS = `${this.baseUrl}/company-users`
	USERS = `${this.baseUrl}/users`
	SETTINGS = `${this.baseUrl}/settings`
	PROMOTIONS = `${this.baseUrl}/promotions`
}
class AuthPages {
	private readonly baseUrl = '/auth'

	LOGIN = `${this.baseUrl}/login`
	SIGNUP = `${this.baseUrl}/signup`
}

class PrimaryPages {
	private readonly baseUrl = ''

	HOME = `${this.baseUrl}`
	CART = `${this.baseUrl}/cart`
	PRODUCTS = `${this.baseUrl}/products`
	PROFILE = `${this.baseUrl}/profile`
	ORDERS = `${this.baseUrl}/orders`
	APP_PROMO = `${this.baseUrl}/app-promo`
	REGISTER_STORE = `${this.baseUrl}/store/register`
}

export const ADMIN_PAGES = new AdminPages()
export const AUTH_PAGES = new AuthPages()
export const PRIMARY_PAGES = new PrimaryPages()
