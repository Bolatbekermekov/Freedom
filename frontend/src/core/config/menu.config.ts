import {
	Boxes,
	Home,
	Layers3,
	LayoutDashboard,
	LayoutList,
	LibraryBig,
	ListOrdered,
	type LucideIcon,
	ShoppingBasket,
	ShoppingCart,
	Smartphone,
	User,
	Users
} from 'lucide-react'

import { ADMIN_PAGES, PRIMARY_PAGES } from '@/core/config/pages-url.config'
import { ROLES } from '@/core/models/user.model'

export interface IMenuItem {
	link: (slug?: number | string) => string
	name: string
	icon?: LucideIcon
	showRoles?: ROLES[]
}

export const ADMIN_MENU: IMenuItem[] = [
	{
		icon: LayoutDashboard,
		link: () => ADMIN_PAGES.DASHBOARD,
		name: 'DASHBOARD.PAGE',
		showRoles: [ROLES.ADMIN, ROLES.SUPERADMIN]
	},
	{
		icon: ListOrdered,
		link: () => ADMIN_PAGES.ORDERS,
		name: 'ORDERS.PAGE',
		showRoles: [ROLES.ADMIN, ROLES.SUPERADMIN]
	},
	{
		icon: ShoppingBasket,
		link: () => ADMIN_PAGES.PRODUCTS,
		name: 'PRODUCTS.PAGE',
		showRoles: [ROLES.ADMIN, ROLES.SUPERADMIN]
	},
	{
		icon: ShoppingBasket,
		link: () => ADMIN_PAGES.RESUME,
		name: 'RESUME.PAGE',
		showRoles: [ROLES.ADMIN, ROLES.SUPERADMIN]
	},
	{
		icon: LibraryBig,
		link: () => ADMIN_PAGES.CATEGORIES,
		name: 'CATEGORIES.PAGE',
		showRoles: [ROLES.SUPERADMIN]
	},
	{
		icon: LayoutList,
		link: () => ADMIN_PAGES.SUB_CATEGORIES,
		name: 'SUB_CATEGORIES.PAGE',
		showRoles: [ROLES.SUPERADMIN]
	},
	{
		icon: Users,
		link: () => ADMIN_PAGES.USERS,
		name: 'USERS.PAGE',
		showRoles: [ROLES.SUPERADMIN]
	},
	{
		icon: Layers3,
		link: () => ADMIN_PAGES.MONITORING,
		name: 'MONITORING.PAGE',
		showRoles: [ROLES.SUPERADMIN]
	}
]

type PrimaryPagesNames = 'HOME' | 'CART' | 'PROFILE' | 'ORDERS' | 'APP_PROMO'

export const PRIMARY_MENU: { [key in PrimaryPagesNames]: IMenuItem } = {
	HOME: {
		icon: Home,
		link: () => PRIMARY_PAGES.HOME,
		name: 'HOME.PAGE'
	},
	CART: {
		icon: ShoppingCart,
		link: () => PRIMARY_PAGES.CART,
		name: 'CART.PAGE'
	},
	PROFILE: {
		icon: User,
		link: () => PRIMARY_PAGES.PROFILE,
		name: 'PROFILE.PAGE'
	},
	ORDERS: {
		icon: Boxes,
		link: () => PRIMARY_PAGES.ORDERS,
		name: 'ORDERS.PAGE'
	},
	APP_PROMO: {
		icon: Smartphone,
		link: () => PRIMARY_PAGES.APP_PROMO,
		name: 'APP_PROMO.PAGE'
	}
}
