function DashboardPageSkeleton({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children?: React.ReactNode
}) {
	return (
		<>
			<div className="dashboard-page">
				<div className="page-header">
					<h1>{title}</h1>
					<p>{description}</p>
				</div>

				<div className="page-content">
					{children || (
						<div className="placeholder-content">
							<div className="placeholder-card">
								<h3>Content Coming Soon</h3>
								<p>This section will be implemented in future iterations.</p>
								<div className="placeholder-items">
									<div className="placeholder-item" />
									<div className="placeholder-item" />
									<div className="placeholder-item" />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<style jsx global>{`
        .dashboard-page {
          width: 100%;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #94a3b8;
          font-size: 16px;
          margin: 0;
        }

        .page-content {
          width: 100%;
        }

        .placeholder-content {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .placeholder-card {
          background-color: #1a1a2e;
          border: 1px solid #2d2d44;
          border-radius: 12px;
          padding: 48px;
          text-align: center;
          max-width: 500px;
        }

        .placeholder-card h3 {
          font-size: 24px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 16px 0;
        }

        .placeholder-card p {
          color: #94a3b8;
          font-size: 16px;
          margin: 0 0 32px 0;
        }

        .placeholder-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .placeholder-item {
          height: 40px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          border-radius: 6px;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
		</>
	)
}

export function DashboardOverview() {
	return (
		<>
			<DashboardPageSkeleton
				title="Dashboard Overview"
				description="Key metrics and insights for your KYC operations"
			>
				<div className="overview-content">
					<div className="metrics-grid">
						{[1, 2, 3, 4].map((index) => (
							<div key={index} className="metric-card">
								<div className="metric-title-skeleton" />
								<div className="metric-value-skeleton" />
								<div className="metric-trend-skeleton" />
							</div>
						))}
					</div>

					<div className="content-grid">
						<div className="chart-section">
							<div className="section-title-skeleton" />
							<div className="chart-skeleton">
								<div className="chart-bars">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => (
										<div
											key={bar}
											className="chart-bar-skeleton"
											style={{ height: `${Math.random() * 60 + 20}%` }}
										/>
									))}
								</div>
								<div className="chart-labels">
									{[
										'Jan',
										'Feb',
										'Mar',
										'Apr',
										'May',
										'Jun',
										'Jul',
										'Aug',
										'Sep',
										'Oct',
										'Nov',
										'Dec',
									].map((month) => (
										<div key={month} className="chart-label">
											{month}
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="activity-section">
							<div className="section-title-skeleton" />
							<div className="section-subtitle-skeleton" />
							<div className="activity-list">
								{[1, 2, 3, 4, 5].map((item) => (
									<div key={item} className="activity-item">
										<div className="activity-avatar-skeleton" />
										<div className="activity-info">
											<div className="activity-name-skeleton" />
											<div className="activity-email-skeleton" />
										</div>
										<div className="activity-amount-skeleton" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</DashboardPageSkeleton>

			<style jsx global>{`
        .overview-content {
          width: 100%;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .metric-card {
          background-color: #1a1a2e;
          border: 1px solid #2d2d44;
          border-radius: 12px;
          padding: 24px;
          transition: border-color 0.2s;
        }

        .metric-card:hover {
          border-color: #3d3d54;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .chart-section,
        .activity-section {
          background-color: #1a1a2e;
          border: 1px solid #2d2d44;
          border-radius: 12px;
          padding: 24px;
        }

        .chart-skeleton {
          height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 16px;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 250px;
          gap: 8px;
        }

        .chart-bar-skeleton {
          flex: 1;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 2s infinite;
          border-radius: 4px 4px 0 0;
          min-height: 20px;
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .chart-label {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          flex: 1;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .activity-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Skeleton Elements */
        .metric-title-skeleton {
          height: 14px;
          width: 120px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .metric-value-skeleton {
          height: 32px;
          width: 100px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .metric-trend-skeleton {
          height: 13px;
          width: 140px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .section-title-skeleton {
          height: 20px;
          width: 100px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .section-subtitle-skeleton {
          height: 14px;
          width: 180px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .activity-avatar-skeleton {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          flex-shrink: 0;
        }

        .activity-name-skeleton {
          height: 14px;
          width: 120px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .activity-email-skeleton {
          height: 13px;
          width: 160px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .activity-amount-skeleton {
          height: 14px;
          width: 80px;
          background: linear-gradient(
            90deg,
            #2d2d44 25%,
            #3d3d54 50%,
            #2d2d44 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        /* Loading Animation */
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .chart-bars {
            gap: 4px;
          }
        }
      `}</style>
		</>
	)
}

export function DashboardCustomers() {
	return (
		<DashboardPageSkeleton
			title="KYC Customers"
			description="Manage customer verification status and documentation"
		/>
	)
}

export function DashboardProducts() {
	return (
		<DashboardPageSkeleton
			title="KYC Products"
			description="Configure verification products and pricing"
		/>
	)
}

export function DashboardAnalytics() {
	return (
		<DashboardPageSkeleton
			title="KYC Analytics"
			description="Monitor verification performance and trends"
		/>
	)
}

export function DashboardSettings() {
	return (
		<DashboardPageSkeleton
			title="KYC Settings"
			description="Configure verification rules and integrations"
		/>
	)
}
