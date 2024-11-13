'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isMobilePhone } from 'validator'
import { z } from 'zod'

import { RegisterStoreDTO } from '../models/store-dto.model'
import { companiesService } from '../services/store.service'

import { ADMIN_PAGES } from '@/core/config/pages-url.config'
import { REQUIRED_MESSAGE } from '@/core/constants/forms.constant'
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
import { Textarea } from '@/core/ui/textarea'

const RegisterStoreFormSchema = z.object({
	companyName: z.string().min(2, { message: REQUIRED_MESSAGE }),
	companyIinBin: z.string().min(2, { message: REQUIRED_MESSAGE }),
	companyPhone: z.string().refine(isMobilePhone),
	companyDescription: z.string().optional(),
	companyAddress: z.string().min(2, { message: REQUIRED_MESSAGE }),
	companyCity: z.string().min(2, { message: REQUIRED_MESSAGE })
})

type RegisterStoreFormType = z.infer<typeof RegisterStoreFormSchema>

export default function RegisterStoreForm() {
	const {
		t,
		i18n: { language }
	} = useTranslation()
	const router = useRouter()

	const form = useForm<RegisterStoreFormType>({
		resolver: zodResolver(RegisterStoreFormSchema)
	})

	const { mutate } = useMutation({
		mutationKey: ['store-register'],
		mutationFn: (data: RegisterStoreDTO) =>
			companiesService.registerStore(data),
		onSuccess: () => {
			toast.success('Магазин зарегистрирован')
			form.reset()
			router.push(ADMIN_PAGES.DASHBOARD)
		},
		onError: (err: ResponseError) => {
			ToastService.axiosError(err, 'Ошибка при регистрации магазина!', language)
		}
	})

	const onSubmit = (values: RegisterStoreFormType) => {
		const dto: RegisterStoreDTO = {
			name: values.companyName.trim(),
			description: values.companyDescription?.trim(),
			phone: values.companyPhone.trim(),
			address: values.companyAddress.trim(),
			city: values.companyCity.trim()
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
					name='companyName'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.COMPANY.NAME.LABEL')}</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder={t('AUTH.SIGNUP.COMPANY.NAME.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='companyIinBin'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.COMPANY.IINBIN.LABEL')}</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder={t('AUTH.SIGNUP.COMPANY.IINBIN.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='companyDescription'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{t('AUTH.SIGNUP.COMPANY.DESCRIPTION.LABEL')}
							</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t('AUTH.SIGNUP.COMPANY.DESCRIPTION.PLACEHOLDER')}
									className='resize-none'
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='companyPhone'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.COMPANY.PHONE.LABEL')}</FormLabel>
							<FormControl>
								<Input
									type='tel'
									placeholder={t('AUTH.SIGNUP.COMPANY.PHONE.PLACEHOLDER')}
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='companyAddress'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.COMPANY.ADDRESS.LABEL')}</FormLabel>
							<FormControl>
								<Textarea
									placeholder={t('AUTH.SIGNUP.COMPANY.ADDRESS.PLACEHOLDER')}
									className='resize-none'
									{...field}
								/>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='companyCity'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('AUTH.SIGNUP.COMPANY.CITY.LABEL')}</FormLabel>
							<FormControl>
								<Input
									placeholder={t('AUTH.SIGNUP.COMPANY.CITY.PLACEHOLDER')}
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
