import { CustomersFlowGraph } from './CustomersFlowGraph'
import { MonitoringPlatformDashboardToolbar } from './PlatformDashboardToolbar'
import { PlatformMetrics } from './PlatformMetrics'
import { SalesFlowGraph } from './SalesFlowGraph'

export const MonitoringPlatformSection = () => {
	return (
		<div>
			<MonitoringPlatformDashboardToolbar />

			<div className='mt-6'>
				<PlatformMetrics />
			</div>

			<div className='mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5'>
				<CustomersFlowGraph />
				<SalesFlowGraph />
			</div>
		</div>
	)
}
