import dynamic from 'next/dynamic'

import dayjs from 'dayjs'
import { GanttChartSquare } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { IUser } from '@/core/models/user.model'
import { TableCell, TableRow } from '@/core/ui/table'

const UserDetailDialog = dynamic(
	() => import('../dialogs/UserDetailDialog').then(m => m.UserDetailDialog),
	{
		ssr: false
	}
)

interface UsersTableItemProps {
	user: IUser
}

export const UsersTableItem = memo(({ user }: UsersTableItemProps) => {
	const [detailsModalOpen, setDetailsModalOpen] = useState(false)

	const toggleDetailsModal = useCallback(() => {
		setDetailsModalOpen(prev => !prev)
	}, [])

	return (
		<TableRow>
			<TableCell>{user._id}</TableCell>
			<TableCell>{user.name}</TableCell>
			<TableCell>{user.phone}</TableCell>
			<TableCell>{user.role}</TableCell>
			<TableCell>{dayjs(user.createdAt).format('MMMM D, YYYY')}</TableCell>
			<TableCell>
				<div className='flex items-center justify-end gap-4'>
					<button onClick={toggleDetailsModal}>
						<GanttChartSquare size={18} />
					</button>

					{detailsModalOpen && (
						<UserDetailDialog
							user={user}
							isOpen={detailsModalOpen}
							toggleOpen={toggleDetailsModal}
						/>
					)}
				</div>
			</TableCell>
		</TableRow>
	)
})

UsersTableItem.displayName = 'UsersTableItem'
