import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { AnalyticsPeriodTypes } from '../models/totals.dto'

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'

interface DashboardPeriodsSelectorProps {
	onPeriodTypeChange: (value: AnalyticsPeriodTypes) => void
	periodType: AnalyticsPeriodTypes
}

export const DashboardPeriodsSelector = memo(
	({
		onPeriodTypeChange,
		periodType: selectedPeriodType
	}: DashboardPeriodsSelectorProps) => {
		const { t } = useTranslation()

		return (
			<Select
				onValueChange={onPeriodTypeChange}
				value={selectedPeriodType}
			>
				<SelectTrigger className='w-fit border border-slate-300 bg-transparent'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel> {t('DASHBOARD.PERIODS.LABEL')}</SelectLabel>
						<SelectItem value={AnalyticsPeriodTypes.DAILY}>
							{t('DASHBOARD.PERIODS.DAILY')}
						</SelectItem>
						<SelectItem value={AnalyticsPeriodTypes.WEEKLY}>
							{t('DASHBOARD.PERIODS.WEEKLY')}
						</SelectItem>
						<SelectItem value={AnalyticsPeriodTypes.MONTHLY}>
							{t('DASHBOARD.PERIODS.MONTHLY')}
						</SelectItem>
						<SelectItem value={AnalyticsPeriodTypes.QUARTERLY}>
							{t('DASHBOARD.PERIODS.QUARTERLY')}
						</SelectItem>
						<SelectItem value={AnalyticsPeriodTypes.YEARLY}>
							{t('DASHBOARD.PERIODS.YEARLY')}
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		)
	}
)

DashboardPeriodsSelector.displayName = 'DashboardPeriodsSelector'
