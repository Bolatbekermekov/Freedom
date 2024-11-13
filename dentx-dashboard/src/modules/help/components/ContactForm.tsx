'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { HelpContactDTO } from '../models/help-dto.model'
import { helpApiService } from '../services/help.service'

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

const ContactFormSchema = z.object({
	name: z.string().min(2),
	contact: z.string().min(2),
	message: z.string().min(2)
})

type ContactFormType = z.infer<typeof ContactFormSchema>

export const ContactForm = () => {
	const router = useRouter()

	const form = useForm<ContactFormType>({
		resolver: zodResolver(ContactFormSchema)
	})

	const { mutate } = useMutation({
		mutationKey: ['create_help_contact'],
		mutationFn: (data: HelpContactDTO) => helpApiService.sendContactForm(data),
		onSuccess: () => {
			toast.success('Ваш запрос успешно отправлен')
			form.reset()
			router.push('/')
		},
		onError: () => {
			toast.error('Ошибка при отправки сообщения!')
		}
	})

	const onSubmit = (values: ContactFormType) => {
		const dto: HelpContactDTO = {
			name: values.name,
			contact: values.contact,
			message: values.message
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
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ваше имя</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder='Введите ваше контактное имя'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='contact'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Ваши контакты</FormLabel>
							<FormControl>
								<Input
									type='text'
									placeholder='Введите ваши контакты (телефон, почта и пр.)'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='message'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Сообщение</FormLabel>
							<FormControl>
								<Textarea
									className='resize-none'
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
					Отправить
				</Button>
			</form>
		</Form>
	)
}
