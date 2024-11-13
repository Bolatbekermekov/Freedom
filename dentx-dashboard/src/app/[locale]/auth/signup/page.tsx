import { Metadata } from 'next'
import React from 'react'

import SignupPage from '@/modules/auth/pages/signup/SignupPage'

export const metadata: Metadata = {
	title: 'Регистрация'
}

export default function Page() {
	return <SignupPage />
}
