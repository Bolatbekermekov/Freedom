import dynamic from 'next/dynamic'

import { GanttChartSquare } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { IUser } from '@/core/models/user.model'
import { TableCell, TableRow } from '@/core/ui/table'

const CompanyUserDetailDialog = dynamic(
	() =>
		import('../dialogs/CompanyUserDetailDialog').then(
			m => m.CompanyUserDetailDialog
		),
	{
		ssr: false
	}
)

interface CompanyUsersTableItemProps {
	user: IUser
}

export const CompanyUsersTableItem = memo(
	({ user }: CompanyUsersTableItemProps) => {
		const [detailsModalOpen, setDetailsModalOpen] = useState(false)

		const toggleDetailsModal = useCallback(() => {
			setDetailsModalOpen(prev => !prev)
		}, [])

		return (
			<TableRow>
				<TableCell>{user.name}</TableCell>
				<TableCell>{user.phone}</TableCell>
				<TableCell>
					<div className='flex items-center justify-end gap-4'>
						<button onClick={toggleDetailsModal}>
							<GanttChartSquare size={18} />
						</button>

						{detailsModalOpen && (
							<CompanyUserDetailDialog
								user={user}
								isOpen={detailsModalOpen}
								toggleOpen={toggleDetailsModal}
							/>
						)}
					</div>
				</TableCell>
			</TableRow>
		)
	}
)

CompanyUsersTableItem.displayName = 'CompanyUsersTableItem'
