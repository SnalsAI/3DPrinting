import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { formatDate } from '@/utils/helpers';
import { PrintStatus } from '@prisma/client';

interface PrintJob {
  id: string;
  status: PrintStatus;
  estimatedPrintTimeMinutes: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orderItem: {
    id: string;
    order: {
      id: string;
      user: {
        name: string | null;
        email: string;
      };
    };
    customization: {
      model: {
        name: string;
      };
    };
    quantity: number;
  };
  partner: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminPrintJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<PrintStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session && (session.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && (session.user as any)?.role === 'ADMIN') {
      fetchPrintJobs();
    }
  }, [session, filter]);

  const fetchPrintJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const url =
        filter === 'ALL'
          ? '/api/admin/print-jobs/list'
          : `/api/admin/print-jobs/list?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch print jobs');
      }

      setPrintJobs(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: PrintStatus) => {
    if (!confirm(`Update print job status to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/print-jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh the list
      fetchPrintJobs();
      alert('Print job status updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getStatusBadgeColor = (status: PrintStatus) => {
    switch (status) {
      case PrintStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case PrintStatus.PRINTING:
        return 'bg-yellow-100 text-yellow-800';
      case PrintStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case PrintStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout activeTab="print-jobs">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading print jobs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="print-jobs">
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Status
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PrintStatus | 'ALL')}
          className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">All Jobs</option>
          <option value={PrintStatus.SCHEDULED}>Scheduled</option>
          <option value={PrintStatus.PRINTING}>Printing</option>
          <option value={PrintStatus.COMPLETED}>Completed</option>
          <option value={PrintStatus.FAILED}>Failed</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Print Jobs Table */}
      {printJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No print jobs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {printJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {job.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {job.orderItem.customization.model.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {job.orderItem.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {job.orderItem.order.user.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.orderItem.order.user.email}
                      </div>
                      <Link
                        href={`/admin/orders/${job.orderItem.order.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View Order
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {job.partner ? (
                        <div>
                          <div className="text-sm text-gray-900">{job.partner.name}</div>
                          <div className="text-xs text-gray-500">{job.partner.email}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.estimatedPrintTimeMinutes
                        ? `~${Math.round(job.estimatedPrintTimeMinutes / 60)}h`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-1">
                        {job.status !== PrintStatus.PRINTING && (
                          <button
                            onClick={() => updateJobStatus(job.id, PrintStatus.PRINTING)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Start
                          </button>
                        )}
                        {job.status !== PrintStatus.COMPLETED && (
                          <button
                            onClick={() => updateJobStatus(job.id, PrintStatus.COMPLETED)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                        )}
                        {job.status !== PrintStatus.FAILED && (
                          <button
                            onClick={() => updateJobStatus(job.id, PrintStatus.FAILED)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Mark Failed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
