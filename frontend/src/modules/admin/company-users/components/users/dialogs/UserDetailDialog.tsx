import dayjs from 'dayjs'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { DialogProps } from '@/core/models/dialogs.model'
import { IUser } from '@/core/models/user.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'

const DEFAULT_EMPTY_VALUE = '-'

interface UserDetailDialogProps extends DialogProps {
	user: IUser
}

export const UserDetailDialog = memo(
	({ user, isOpen, toggleOpen }: UserDetailDialogProps) => {
		const { t } = useTranslation()

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='bg-white'>
					<DialogHeader>
						<DialogTitle>
							{t('USERS.DIALOGS.DETAILS.HEADER')} #{user._id}
						</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
						<div>
							<p className='text-slate-400'>ID</p>
							<p className='mt-1 font-medium'>{user._id}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('USERS.DIALOGS.DETAILS.NAME')}
							</p>
							<p className='mt-1 font-medium'>{user.name}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('USERS.DIALOGS.DETAILS.PHONE')}
							</p>
							<p className='mt-1 font-medium'>{user.phone}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('USERS.DIALOGS.DETAILS.ADDRESS')}
							</p>
							<p className='mt-1 font-medium'>
								{user.address ?? DEFAULT_EMPTY_VALUE}
							</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('USERS.DIALOGS.DETAILS.ROLES')}
							</p>
							<p className='mt-1 font-medium'>{user.role}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('USERS.DIALOGS.DETAILS.CREATED_DATE')}
							</p>
							<p className='mt-1 font-medium'>
								{dayjs(user.createdAt).format('MMMM D, YYYY h:mm A')}
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

UserDetailDialog.displayName = 'UserDetailDialog'
