'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isMobilePhone } from 'validator'
import { z } from 'zod'

import { CreateUserDTO } from '../../../models/users-dto.model'
import { UsersAPIService } from '../../../services/users-api.service'

import {
	INVALID_PHONE_FORMAT,
	REQUIRED_MESSAGE
} from '@/core/constants/forms.constant'
import { COMPANY_TYPES } from '@/core/models/company.model'
import { DialogProps } from '@/core/models/dialogs.model'
import { Button } from '@/core/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/core/ui/form'
import { Input } from '@/core/ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'
import { Textarea } from '@/core/ui/textarea'

const CreateUserFormSchema = z.object({
	firstName: z.string().min(1, { message: REQUIRED_MESSAGE }),
	lastName: z.string().min(1, { message: REQUIRED_MESSAGE }),
	phone: z.string().refine(isMobilePhone, { message: INVALID_PHONE_FORMAT }),
	password: z.string().min(8, { message: REQUIRED_MESSAGE }),
	companyName: z.string().min(1, { message: REQUIRED_MESSAGE }),
	companyPhone: z
		.string()
		.refine(isMobilePhone, { message: INVALID_PHONE_FORMAT }),
	companyDescription: z.string().optional(),
	companyAddress: z.string().min(1, { message: REQUIRED_MESSAGE }),
	companyCity: z.string().min(1, { message: REQUIRED_MESSAGE }),
	companyType: z.enum([COMPANY_TYPES.CLINIC, COMPANY_TYPES.STORE])
})

type CreateUserFormSchemaType = z.infer<typeof CreateUserFormSchema>

interface CreateUserDialogProps extends DialogProps {}

export const CreateUserDialog = memo(
	({ isOpen, toggleOpen }: CreateUserDialogProps) => {
		const { t } = useTranslation()

		const form = useForm<CreateUserFormSchemaType>({
			resolver: zodResolver(CreateUserFormSchema)
		})

		const queryClient = useQueryClient()

		const { mutate } = useMutation({
			mutationKey: ['create-user'],
			mutationFn: (data: CreateUserDTO) => UsersAPIService.createUser(data),
			onSuccess: () => {
				toast.success('Успешно добавлен новый пользователь')
				form.reset()
				queryClient.refetchQueries({ queryKey: ['users'] })
			},
			onError: () => {
				toast.error('Failed to create a user!')
			}
		})

		const onSubmit = useCallback(
			(values: CreateUserFormSchemaType) => {
				const dto: CreateUserDTO = {
					phone: values.phone.trim(),
					password: values.password.trim(),
					name: `${values.firstName.trim()} ${values.lastName.trim()}`,
					company: {
						name: values.companyName.trim(),
						description: values.companyDescription?.trim(),
						phone: values.companyPhone.trim(),
						address: values.companyAddress.trim(),
						city: values.companyCity.trim(),
						type: values.companyType
					}
				}

				mutate(dto)
			},
			[mutate]
		)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>{t('USERS.DIALOGS.CREATE.HEADER')}</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<Tabs
									defaultValue='account'
									className='w-full'
								>
									<TabsList className='grid w-full grid-cols-2'>
										<TabsTrigger value='account'>
											{t('USERS.DIALOGS.CREATE.PERSONAL.LABEL')}
										</TabsTrigger>
										<TabsTrigger value='company'>
											{t('USERS.DIALOGS.CREATE.COMPANY.LABEL')}
										</TabsTrigger>
									</TabsList>
									<TabsContent
										value='account'
										className='mt-5 space-y-5'
									>
										<FormField
											control={form.control}
											name='firstName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'USERS.DIALOGS.CREATE.PERSONAL.FIRST_NAME.LABEL'
														)}
													</FormLabel>
													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'USERS.DIALOGS.CREATE.PERSONAL.FIRST_NAME.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='lastName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'USERS.DIALOGS.CREATE.PERSONAL.LAST_NAME.PLACEHOLDER'
														)}
													</FormLabel>
													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'USERS.DIALOGS.CREATE.PERSONAL.LAST_NAME.PLACEHOLDER'
															)}
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
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.PERSONAL.PHONE.LABEL')}
													</FormLabel>
													<FormControl>
														<Input
															type='tel'
															placeholder={t(
																'USERS.DIALOGS.CREATE.PERSONAL.PHONE.PLACEHOLDER'
															)}
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
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.PERSONAL.PASSWORD.LABEL')}
													</FormLabel>
													<FormControl>
														<Input
															type='password'
															placeholder={t(
																'USERS.DIALOGS.CREATE.PERSONAL.PASSWORD.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>
									</TabsContent>

									<TabsContent
										value='company'
										className='mt-8 space-y-5'
									>
										<FormField
											control={form.control}
											name='companyName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.COMPANY.NAME.LABEL')}
													</FormLabel>
													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'USERS.DIALOGS.CREATE.COMPANY.NAME.PLACEHOLDER'
															)}
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
														{t(
															'USERS.DIALOGS.CREATE.COMPANY.DESCRIPTION.LABEL'
														)}
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder={t(
																'USERS.DIALOGS.CREATE.COMPANY.DESCRIPTION.PLACEHOLDER'
															)}
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
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.COMPANY.PHONE.LABEL')}
													</FormLabel>
													<FormControl>
														<Input
															type='tel'
															placeholder={t(
																'USERS.DIALOGS.CREATE.COMPANY.PHONE.PLACEHOLDER'
															)}
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
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.COMPANY.ADDRESS.LABEL')}
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder={t(
																'USERS.DIALOGS.CREATE.COMPANY.ADDRESS.PLACEHOLDER'
															)}
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
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.COMPANY.CITY.LABEL')}
													</FormLabel>
													<FormControl>
														<Input
															placeholder={t(
																'USERS.DIALOGS.CREATE.COMPANY.CITY.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='companyType'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('USERS.DIALOGS.CREATE.COMPANY.TYPE.LABEL')}
													</FormLabel>
													<FormControl>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<SelectTrigger>
																<SelectValue
																	placeholder={t(
																		'USERS.DIALOGS.CREATE.COMPANY.TYPE.PLACEHOLDER'
																	)}
																/>
															</SelectTrigger>
															<SelectContent>
																<SelectGroup>
																	<SelectItem value={COMPANY_TYPES.CLINIC}>
																		{t(
																			'USERS.DIALOGS.CREATE.COMPANY.TYPE.CLINIC'
																		)}
																	</SelectItem>
																	<SelectItem value={COMPANY_TYPES.STORE}>
																		{t(
																			'USERS.DIALOGS.CREATE.COMPANY.TYPE.STORE'
																		)}
																	</SelectItem>
																</SelectGroup>
															</SelectContent>
														</Select>
													</FormControl>
												</FormItem>
											)}
										/>
									</TabsContent>
								</Tabs>

								<Button
									type='submit'
									className='!mt-8 w-full'
								>
									{t('USERS.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CreateUserDialog.displayName = 'CreateUserDialog'
