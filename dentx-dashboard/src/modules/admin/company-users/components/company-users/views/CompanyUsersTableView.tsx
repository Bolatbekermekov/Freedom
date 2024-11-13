'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CompanyUsersTableItem } from './CompanyUsersTableItem'
import { IUser } from '@/core/models/user.model'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface CompanyUsersTableViewProps {
	users: IUser[]
}

export const CompanyUsersTableView = memo(
	({ users }: Readonly<CompanyUsersTableViewProps>) => {
		const { t } = useTranslation()

		const renderedList = useMemo(
			() =>
				users.map(user => (
					<CompanyUsersTableItem
						user={user}
						key={user._id}
					/>
				)),
			[users]
		)

		return (
			<div>
				<Table className='rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead>{t('COMPANY_USERS.TABLE.NAME')}</TableHead>
							<TableHead>{t('COMPANY_USERS.TABLE.PHONE')}</TableHead>
							<TableHead className='text-right'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>
			</div>
		)
	}
)

CompanyUsersTableView.displayName = 'CompanyUsersTableView'
