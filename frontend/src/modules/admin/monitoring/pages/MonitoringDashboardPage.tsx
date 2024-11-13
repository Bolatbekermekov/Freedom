import { MonitoringPlatformSection } from '../components/monitoring-platform/MonitoringPlatformSection'
import { MonitoringSalesSection } from '../components/monitoring-sales/MonitoringSalesSection'

export const MonitoringDashboardPage = () => {
	return (
		<div>
			<MonitoringPlatformSection />

			<div className='mt-10'>
				<MonitoringSalesSection />
			</div>
		</div>
	)
}
