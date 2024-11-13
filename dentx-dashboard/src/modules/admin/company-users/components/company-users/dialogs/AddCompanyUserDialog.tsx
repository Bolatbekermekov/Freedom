'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isMobilePhone } from 'validator'
import { z } from 'zod'

import { AddCompanyUserDTO } from '../../../models/company-users-dto.model'
import { UsersAPIService } from '../../../services/users-api.service'

import {
	INVALID_PHONE_FORMAT,
	REQUIRED_MESSAGE
} from '@/core/constants/forms.constant'
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

const addCompanyUserSchema = z.object({
	name: z.string().min(1, { message: REQUIRED_MESSAGE }),
	phone: z.string().refine(isMobilePhone, { message: INVALID_PHONE_FORMAT }),
	password: z.string().min(8, { message: 'Мин. 8 символов' })
})

type AddCompanyUserSchemaType = z.infer<typeof addCompanyUserSchema>

interface AddCompanyUserDialogProps extends DialogProps {}

export const AddCompanyUserDialog = memo(
	({ isOpen, toggleOpen }: AddCompanyUserDialogProps) => {
		const { t } = useTranslation()

		const form = useForm<AddCompanyUserSchemaType>({
			resolver: zodResolver(addCompanyUserSchema)
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['add-company-user'],
			mutationFn: (data: AddCompanyUserDTO) =>
				UsersAPIService.addCompanyMember(data),
			onSuccess: () => {
				toast.success('Успешно добавлен новый пользователь')
				queryClient.refetchQueries({ queryKey: ['company-users'] })
				form.reset()
			},
			onError: () => {
				toast.error('Не удалось добавить нового пользователя')
			}
		})

		const onSubmit = useCallback(
			(values: AddCompanyUserSchemaType) => {
				const dto: AddCompanyUserDTO = {
					name: values.name,
					password: values.password,
					phone: values.phone
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
						<DialogTitle>
							{t('COMPANY_USERS.DIALOGS.CREATE.HEADER')}
						</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='flex w-full flex-col gap-4'
							>
								<FormField
									control={form.control}
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{t('COMPANY_USERS.DIALOGS.CREATE.NAME.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													placeholder={t(
														'COMPANY_USERS.DIALOGS.CREATE.NAME.PLACEHOLDER'
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
												{t('COMPANY_USERS.DIALOGS.CREATE.PHONE.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													type='tel'
													placeholder={t(
														'COMPANY_USERS.DIALOGS.CREATE.PHONE.PLACEHOLDER'
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
												{t('COMPANY_USERS.DIALOGS.CREATE.PASSWORD.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													type='password'
													placeholder={t(
														'COMPANY_USERS.DIALOGS.CREATE.PASSWORD.PLACEHOLDER'
													)}
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type='submit'
									className='mt-8'
									disabled={isPending}
								>
									{t('COMPANY_USERS.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

AddCompanyUserDialog.displayName = 'AddCompanyUserDialog'
