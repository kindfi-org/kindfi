import React from 'react'
import type { ReactNode } from 'react'

interface DashboardLayoutProps {
	children: ReactNode
	currentPath?: string
	user?: {
		name: string
		email?: string
	}
}

// Dashboard navigation items
const dashboardNavItems = [
	{ path: '/dashboard', label: 'Overview', icon: '📊' },
	{ path: '/dashboard/customers', label: 'Customers', icon: '👥' },
	{ path: '/dashboard/products', label: 'Products', icon: '📦' },
	{ path: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
	{ path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export function DashboardLayout({
	children,
	currentPath = '/dashboard',
	user,
}: DashboardLayoutProps) {
	const isActive = (path: string) => currentPath === path

	return (
		<>
			<div className="dashboard-shell">
				{/* Mobile Sidebar Overlay */}
				<div className="sidebar-overlay" id="sidebarOverlay" />

				{/* Mobile Sidebar */}
				<div className="mobile-sidebar" id="mobileSidebar">
					{/* Sidebar Header */}
					<div className="sidebar-header">
						<h2 className="sidebar-logo">Kindfi KYC</h2>
						<button
							type="button"
							className="sidebar-close-btn"
							id="sidebarCloseBtn"
							aria-label="Close sidebar"
						>
							✕
						</button>
					</div>

					{/* Sidebar Navigation */}
					<nav className="sidebar-nav">
						{dashboardNavItems.map((item) => (
							<a
								key={item.path}
								href={item.path}
								className={`sidebar-nav-link ${isActive(item.path) ? 'active' : ''}`}
							>
								<span className="nav-icon">{item.icon}</span>
								<span className="nav-label">{item.label}</span>
								{isActive(item.path) && <span className="active-indicator" />}
							</a>
						))}
					</nav>

					{/* Sidebar Footer */}
					<div className="sidebar-footer">
						<div className="sidebar-user-menu">
							<div className="sidebar-user-avatar">
								{user?.name?.charAt(0) || 'U'}
							</div>
							<div className="user-info">
								<div className="sidebar-user-name">{user?.name || 'User'}</div>
								<div className="user-email">
									{user?.email || 'user@kindfi.com'}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Header */}
				<header className="dashboard-header">
					<div className="header-content">
						<div className="header-left">
							<button
								type="button"
								className="mobile-menu-btn"
								id="mobileMenuBtn"
								aria-label="Toggle sidebar menu"
							>
								<span className="hamburger" id="hamburger">
									<span />
									<span />
									<span />
								</span>
							</button>

							<h1 className="logo">Kindfi KYC</h1>
						</div>

						{/* Desktop Navigation */}
						<div className="header-center desktop-nav">
							<nav className="top-nav">
								{dashboardNavItems.map((item) => (
									<a
										key={item.path}
										href={item.path}
										className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
									>
										<span className="nav-icon">{item.icon}</span>
										<span className="nav-label">{item.label}</span>
									</a>
								))}
							</nav>
						</div>

						<div className="header-right">
							<div className="user-menu">
								<div className="user-avatar">
									{user?.name?.charAt(0) || 'U'}
								</div>
								<span className="user-name">{user?.name || 'User'}</span>
								<span className="user-dropdown">▼</span>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content Area */}
				<main className="dashboard-main">
					<div className="content-container">{children}</div>
				</main>
			</div>

			<script
				dangerouslySetInnerHTML={{
					__html: `
    (function() {
      function initDashboard() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const mobileSidebar = document.getElementById('mobileSidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const hamburger = document.getElementById('hamburger');

        if (!mobileMenuBtn || !mobileSidebar || !sidebarOverlay) {
          return;
        }

        function openSidebar() {
          mobileSidebar.classList.add('open');
          sidebarOverlay.classList.add('open');
          hamburger.classList.add('open');
          document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
          mobileSidebar.classList.remove('open');
          sidebarOverlay.classList.remove('open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }

        mobileMenuBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if (mobileSidebar.classList.contains('open')) {
            closeSidebar();
          } else {
            openSidebar();
          }
        });

        if (sidebarCloseBtn) {
          sidebarCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
          });
        }

        sidebarOverlay.addEventListener('click', function(e) {
          e.preventDefault();
          closeSidebar();
        });

        const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
        sidebarLinks.forEach(function(link) {
          link.addEventListener('click', function() {
            closeSidebar();
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
      } else {
        initDashboard();
      }
    })();
  `,
				}}
			/>

			{/* CSS Styles */}
			<style jsx global>{`
        .dashboard-shell {
          min-height: 100vh;
          background-color: #0f0f23;
          color: #e2e8f0;
          font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          position: relative;
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.3s ease,
            visibility 0.3s ease;
          backdrop-filter: blur(2px);
        }

        .sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Sidebar */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background-color: #1a1a2e;
          border-right: 1px solid #2d2d44;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          z-index: 999;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
        }

        .mobile-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #2d2d44;
        }

        .sidebar-logo {
          font-size: 20px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
        }

        .sidebar-close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .sidebar-close-btn:hover {
          color: #e2e8f0;
          background-color: #2d2d44;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .sidebar-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 12px 16px;
          border-radius: 8px;
          transition: all 0.2s;
          margin-bottom: 4px;
          position: relative;
        }

        .sidebar-nav-link:hover {
          color: #e2e8f0;
          background-color: #2d2d44;
        }

        .sidebar-nav-link.active {
          color: #e2e8f0;
          background-color: #8b5cf6;
        }

        .sidebar-nav-link .nav-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .sidebar-nav-link .nav-label {
          flex: 1;
        }

        .active-indicator {
          width: 4px;
          height: 4px;
          background-color: #ffffff;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 24px 16px;
          border-top: 1px solid #2d2d44;
        }

        .sidebar-user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #2d2d44;
          border-radius: 8px;
        }

        .sidebar-user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .sidebar-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-email {
          font-size: 12px;
          color: #94a3b8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Header */
        .dashboard-header {
          background-color: #1a1a2e;
          border-bottom: 1px solid #2d2d44;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
          white-space: nowrap;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .mobile-menu-btn:hover {
          background-color: #2d2d44;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          width: 24px;
          height: 18px;
          position: relative;
        }

        .hamburger span {
          background-color: #e2e8f0;
          height: 2px;
          margin: 2px 0;
          transition: all 0.3s ease;
          border-radius: 1px;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .desktop-nav {
          display: flex;
        }

        .top-nav {
          display: flex;
          gap: 8px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 16px;
          border-radius: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #e2e8f0;
          background-color: #2d2d44;
        }

        .nav-link.active {
          color: #e2e8f0;
          background-color: #8b5cf6;
        }

        .top-nav .nav-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .top-nav .nav-label {
          display: block;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background-color: #2d2d44;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 0;
        }

        .user-menu:hover {
          background-color: #3d3d54;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-dropdown {
          font-size: 10px;
          color: #94a3b8;
          margin-left: 4px;
          flex-shrink: 0;
        }

        .dashboard-main {
          padding: 24px;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Hide sidebar on desktop */
        @media (min-width: 769px) {
          .mobile-sidebar,
          .sidebar-overlay {
            display: none !important;
          }
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .header-content {
            padding: 0 16px;
          }

          .mobile-menu-btn {
            display: block !important;
          }

          .desktop-nav {
            display: none !important;
          }

          .user-menu {
            padding: 6px 8px;
            gap: 8px;
          }

          .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .user-name,
          .user-dropdown {
            display: none;
          }

          .dashboard-main {
            padding: 16px;
          }
        }

        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .mobile-sidebar {
            width: 260px;
          }
        }
      `}</style>
		</>
	)
}
