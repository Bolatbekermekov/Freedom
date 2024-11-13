import { Metadata } from 'next'

import { CartPage } from '@/modules/cart/pages/CartPage'

export const metadata: Metadata = {
	title: 'Корзина'
}

export default function Page() {
	return <CartPage />
}
