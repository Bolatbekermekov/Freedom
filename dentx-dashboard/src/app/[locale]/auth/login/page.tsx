import { Metadata } from 'next'

import LoginPage from '@/modules/auth/pages/login/LoginPage'

export const metadata: Metadata = {
	title: 'Войти'
}

export default function Home() {
	return <LoginPage />
}
