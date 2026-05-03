import { Routes } from '@angular/router';
import { RoleSelectorComponent } from './pages/role-selector/role-selector.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { CustomerLayoutComponent } from './layouts/customer/customer-layout.component';
import { ProviderLayoutComponent } from './layouts/provider/provider-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminRequestsComponent } from './pages/admin/admin-requests.component';
import { AdminEmployeesComponent } from './pages/admin/admin-employees.component';
import { AdminProvidersComponent } from './pages/admin/admin-providers.component';
import { AdminInvoicingComponent } from './pages/admin/admin-invoicing.component';
import { AdminLoginComponent } from './pages/admin/admin-login.component';
import { AdminCrmComponent } from './pages/admin/admin-crm.component';
import { AdminServicesComponent } from './pages/admin/admin-services.component';
import { AdminReportsComponent } from './pages/admin/admin-reports.component';
import { CustomerHomeComponent } from './pages/customer/customer-home.component';
import { CustomerServiceRequestComponent } from './pages/customer/customer-service-request.component';
import { CustomerTrackRequestComponent } from './pages/customer/customer-track-request.component';
import { CustomerServicesComponent } from './pages/customer/customer-services.component';
import { CustomerHelpComponent } from './pages/customer/customer-help.component';
import { ProviderDashboardComponent } from './pages/provider/provider-dashboard.component';
import { ProviderProfileComponent } from './pages/provider/provider-profile.component';
import { ProviderRegisterComponent } from './pages/provider/provider-register.component';
import { AdminRequestDetailComponent } from './pages/admin/admin-request-detail.component';
import { AdminCrmDetailComponent } from './pages/admin/admin-crm-detail.component';
import { ProviderRequestsComponent } from './pages/provider/provider-requests.component';
import { ProviderCalendarComponent } from './pages/provider/provider-calendar.component';
import { ProviderEarningsComponent } from './pages/provider/provider-earnings.component';
import { ProviderReviewsComponent } from './pages/provider/provider-reviews.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'role', pathMatch: 'full' },
	{ path: 'role', component: RoleSelectorComponent },
	{
		path: 'admin',
		component: AdminLayoutComponent,
		children: [
			{ path: 'dashboard', component: AdminDashboardComponent },
			{ path: 'requests', component: AdminRequestsComponent },
			{ path: 'crm', component: AdminCrmComponent },
			{ path: 'services', component: AdminServicesComponent },
			{ path: 'employees', component: AdminEmployeesComponent },
			{ path: 'providers', component: AdminProvidersComponent },
			{ path: 'invoicing', component: AdminInvoicingComponent },
			{ path: 'reports', component: AdminReportsComponent },
			{ path: 'login', component: AdminLoginComponent },
			{ path: 'requests/:id', component: AdminRequestDetailComponent },
			{ path: 'crm/:id', component: AdminCrmDetailComponent },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},
	{
		path: 'customer',
		component: CustomerLayoutComponent,
		children: [
			{ path: 'home', component: CustomerHomeComponent },
			{ path: 'services', component: CustomerServicesComponent },
			{ path: 'service-request', component: CustomerServiceRequestComponent },
			{ path: 'track-request', component: CustomerTrackRequestComponent },
			{ path: 'help', component: CustomerHelpComponent },
			{ path: '', redirectTo: 'home', pathMatch: 'full' }
		]
	},
	{
		path: 'provider',
		component: ProviderLayoutComponent,
		children: [
			{ path: 'dashboard', component: ProviderDashboardComponent },
			{ path: 'requests', component: ProviderRequestsComponent },
			{ path: 'calendar', component: ProviderCalendarComponent },
			{ path: 'earnings', component: ProviderEarningsComponent },
			{ path: 'reviews', component: ProviderReviewsComponent },
			{ path: 'profile', component: ProviderProfileComponent },
			{ path: 'register', component: ProviderRegisterComponent },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},
	{ path: '**', component: NotFoundComponent }
];
