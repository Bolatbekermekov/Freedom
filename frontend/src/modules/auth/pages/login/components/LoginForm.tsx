'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { toast } from 'sonner'
import { isMobilePhone } from 'validator'
import { z } from 'zod'

import { LoginDTO } from '../../../models/auth.model'
import { AuthService } from '../../../services/auth.service'

import {
	INVALID_PHONE_FORMAT,
	REQUIRED_MESSAGE
} from '@/core/constants/forms.constant'
import { ResponseError } from '@/core/models/axios.models'
import { ToastService } from '@/core/services/toast.service'
import { Button } from '@/core/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/core/ui/form'
import { Input } from '@/core/ui/input'

const LoginFormSchema = z.object({
	phone: z
		.string()
		.min(1, { message: REQUIRED_MESSAGE })
		.refine(isMobilePhone, {
			message: INVALID_PHONE_FORMAT
		}),
	password: z.string().min(1, { message: REQUIRED_MESSAGE })
})

type LoginFormType = z.infer<typeof LoginFormSchema>

export default function LoginForm() {
	const {
		t,
		i18n: { language }
	} = useTranslation()
	const router = useRouter()
	const queryClient = useQueryClient()

	const form = useForm<LoginFormType>({
		resolver: zodResolver(LoginFormSchema)
	})

	const { mutate } = useMutation({
		mutationKey: ['auth-login'],
		mutationFn: (data: LoginDTO) => AuthService.login(data),
		onSuccess: () => {
			queryClient.resetQueries({ queryKey: ['profile'] })
			toast.success('Вы успешно вошли в систему!')
			form.reset()
			router.push('/')
		},
		onError: (err: ResponseError) => {
			ToastService.axiosError(err, 'Ошибка при входе в систему!', language)
		}
	})

	const onSubmit = (values: LoginFormType) => {
		const dto = {
			phone: values.phone.trim(),
			password: values.password.trim()
		}

		mutate(dto)
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-5'
			>
				<FormField
					control={form.control}
					name='phone'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.LOGIN.PHONE.LABEL')}</FormLabel>
							<FormControl>
								<PhoneInput
									defaultCountry='kz'
									placeholder={t('AUTH.LOGIN.PHONE.PLACEHOLDER')}
									className='w-full rounded-md border-input bg-background'
									inputClassName='w-full rounded-md border-input bg-background rounded-none'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.LOGIN.PASSWORD.LABEL')}</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder={t('AUTH.LOGIN.PASSWORD.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type='submit'
					className='!mt-8 w-full'
				>
					{t('AUTH.LOGIN.LOGIN_BUTTON')}
				</Button>
			</form>
		</Form>
	)
}
