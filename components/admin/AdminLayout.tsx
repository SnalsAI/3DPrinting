import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: 'overview' | 'models' | 'orders' | 'print-jobs' | 'partners' | 'analytics' | 'debug';
}

export default function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const router = useRouter();

  const tabs = [
    { id: 'overview', name: 'Overview', href: '/admin' },
    { id: 'analytics', name: 'Analytics', href: '/admin/analytics' },
    { id: 'models', name: 'Models', href: '/admin/models' },
    { id: 'orders', name: 'Orders', href: '/admin/orders' },
    { id: 'print-jobs', name: 'Print Jobs', href: '/admin/print-jobs' },
    { id: 'partners', name: 'Partners', href: '/admin/partners' },
    { id: 'debug', name: 'Debug', href: '/admin/debug' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage your 3D printing platform</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                `}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
