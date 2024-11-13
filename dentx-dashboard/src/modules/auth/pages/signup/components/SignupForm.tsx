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
import { SignupDTO } from '@/modules/auth/models/auth.model'
import { AuthService } from '@/modules/auth/services/auth.service'

const SignupFormSchema = z.object({
	firstname: z.string().min(1, { message: REQUIRED_MESSAGE }),
	lastname: z.string().min(1, { message: REQUIRED_MESSAGE }),
	phone: z.string().refine(isMobilePhone, { message: INVALID_PHONE_FORMAT }),
	password: z.string().min(8, { message: 'Мин. 8 символов' })
})

type SignupFormType = z.infer<typeof SignupFormSchema>

export default function SignupForm() {
	const {
		t,
		i18n: { language }
	} = useTranslation()
	const router = useRouter()
	const queryClient = useQueryClient()

	const form = useForm<SignupFormType>({
		resolver: zodResolver(SignupFormSchema)
	})

	const { mutate } = useMutation({
		mutationKey: ['auth-signup'],
		mutationFn: (data: SignupDTO) => AuthService.signup(data),
		onSuccess: () => {
			queryClient.resetQueries({ queryKey: ['profile'] })
			toast.success('Учетная запись создана')
			form.reset()
			router.push('/')
		},
		onError: (err: ResponseError) => {
			ToastService.axiosError(
				err,
				'Ошибка при регистрации в системе!',
				language
			)
		}
	})

	const onSubmit = (values: SignupFormType) => {
		const dto: SignupDTO = {
			phone: values.phone.trim(),
			password: values.password.trim(),
			name: `${values.firstname.trim()} ${values.lastname.trim()}`
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
					name='firstname'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t('AUTH.SIGNUP.PERSONAL.FIRST_NAME.LABEL')}
							</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder={t('AUTH.SIGNUP.PERSONAL.FIRST_NAME.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='lastname'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t('AUTH.SIGNUP.PERSONAL.LAST_NAME.PLACEHOLDER')}
							</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder={t('AUTH.SIGNUP.PERSONAL.LAST_NAME.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='phone'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.PERSONAL.PHONE.LABEL')}</FormLabel>
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
							<FormLabel>{t('AUTH.SIGNUP.PERSONAL.PASSWORD.LABEL')}</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder={t('AUTH.SIGNUP.PERSONAL.PASSWORD.PLACEHOLDER')}
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
					{t('AUTH.SIGNUP.SIGNUP_BUTTON')}
				</Button>
			</form>
		</Form>
	)
}
