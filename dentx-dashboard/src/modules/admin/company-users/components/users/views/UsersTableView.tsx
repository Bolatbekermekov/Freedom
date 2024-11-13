'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { UsersTableItem } from './UsersTableItem'
import { IUser } from '@/core/models/user.model'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface UsersTableViewProps {
	users: IUser[]
}

export const UsersTableView = memo(
	({ users }: Readonly<UsersTableViewProps>) => {
		const { t } = useTranslation()

		const renderedList = useMemo(
			() =>
				users.map(user => (
					<UsersTableItem
						key={user._id}
						user={user}
					/>
				)),
			[users]
		)

		return (
			<div>
				<Table className='rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead>#</TableHead>
							<TableHead>{t('USERS.TABLE.NAME')}</TableHead>
							<TableHead>{t('USERS.TABLE.PHONE')}</TableHead>
							<TableHead>{t('USERS.TABLE.ROLE')}</TableHead>
							<TableHead>{t('USERS.TABLE.CREATED_AT')}</TableHead>
							<TableHead className='text-right'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>
			</div>
		)
	}
)

UsersTableView.displayName = 'UsersTableView'
