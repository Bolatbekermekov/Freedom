import { DashboardOrdersAssignee } from '../components/orders-assignee/DashboardOrdersAssignee'
import { DashboardOrdersStatuses } from '../components/orders-statuses/DashboardOrdersStatuses'
import { DashboardSalesByPeriod } from '../components/sales-by-period/DashboardSalesByPeriod'
import { DashboardStatisticsList } from '../components/totals/DashboardStatisticsList'

function DashboardPage() {
	return (
		<div className='relative h-full w-full'>
			<DashboardStatisticsList />

			<div className='mt-6'>
				<DashboardSalesByPeriod />
			</div>

			<div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
				<DashboardOrdersStatuses />
				<DashboardOrdersAssignee />
			</div>
		</div>
	)
}

export default DashboardPage
