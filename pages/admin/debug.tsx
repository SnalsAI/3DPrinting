import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface DebugLog {
  id: string;
  level: string;
  category: string;
  action: string;
  message: string;
  userId?: string;
  metadata?: any;
  error?: string;
  stackTrace?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: number;
  endpoint?: string;
  createdAt: string;
}

interface DebugStats {
  summary: {
    total: number;
    byLevel: {
      error: number;
      warn: number;
      info: number;
      debug: number;
    };
  };
  byCategory: Array<{ category: string; count: number }>;
  recentErrors: Array<DebugLog>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  performance: {
    averageDuration: number;
  };
  hourlyDistribution: Array<{ hour: string; count: number }>;
  timeRange: string;
}

export default function DebugPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [stats, setStats] = useState<DebugStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<DebugLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Filters
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    search: '',
    timeRange: '24h',
    limit: 100,
    offset: 0,
  });

  const [totalCount, setTotalCount] = useState(0);

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/debug/logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/debug/stats?timeRange=${filters.timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [filters.timeRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setLoading(false);
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchData();
    }
  }, [status, session, fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  const clearOldLogs = async (days: number) => {
    if (
      !confirm(
        `Are you sure you want to delete all logs older than ${days} days?`
      )
    ) {
      return;
    }

    try {
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - days);

      const response = await fetch(
        `/api/admin/debug/logs?olderThan=${olderThan.toISOString()}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete logs');

      const data = await response.json();
      toast.success(`Deleted ${data.deletedCount} logs`);
      fetchData();
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Failed to delete logs');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50';
      case 'WARN':
        return 'text-yellow-600 bg-yellow-50';
      case 'INFO':
        return 'text-blue-600 bg-blue-50';
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      API: 'bg-purple-100 text-purple-800',
      AUTH: 'bg-green-100 text-green-800',
      DATABASE: 'bg-indigo-100 text-indigo-800',
      PAYMENT: 'bg-pink-100 text-pink-800',
      EMAIL: 'bg-cyan-100 text-cyan-800',
      '3D_RENDER': 'bg-orange-100 text-orange-800',
      AI: 'bg-violet-100 text-violet-800',
      NOTIFICATION: 'bg-teal-100 text-teal-800',
      SYSTEM: 'bg-slate-100 text-slate-800',
      PRINT_JOB: 'bg-amber-100 text-amber-800',
      ORDER: 'bg-lime-100 text-lime-800',
      MODEL: 'bg-emerald-100 text-emerald-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout activeTab="debug">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="debug">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Debug & Monitoring
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor system events, errors, and performance in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            )}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.summary.total.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Errors</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.summary.byLevel.error.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {stats.summary.byLevel.warn.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatDuration(stats.performance.averageDuration)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {stats && stats.byCategory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Logs by Category
            </h2>
            <div className="flex flex-wrap gap-3">
              {stats.byCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg"
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) =>
                  setFilters({ ...filters, level: e.target.value, offset: 0 })
                }
                className="w-full rounded-md border-gray-300"
              >
                <option value="">All Levels</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warning</option>
                <option value="INFO">Info</option>
                <option value="DEBUG">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value, offset: 0 })
                }
                className="w-full rounded-md border-gray-300"
              >
                <option value="">All Categories</option>
                <option value="API">API</option>
                <option value="AUTH">Auth</option>
                <option value="DATABASE">Database</option>
                <option value="PAYMENT">Payment</option>
                <option value="EMAIL">Email</option>
                <option value="3D_RENDER">3D Render</option>
                <option value="AI">AI</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="SYSTEM">System</option>
                <option value="PRINT_JOB">Print Job</option>
                <option value="ORDER">Order</option>
                <option value="MODEL">Model</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) =>
                  setFilters({ ...filters, timeRange: e.target.value, offset: 0 })
                }
                className="w-full rounded-md border-gray-300"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, offset: 0 })
                }
                placeholder="Search logs..."
                className="w-full rounded-md border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, offset: 0 })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={() =>
                  setFilters({
                    level: '',
                    category: '',
                    search: '',
                    timeRange: '24h',
                    limit: 100,
                    offset: 0,
                  })
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => clearOldLogs(7)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
              >
                Clear 7d+ Logs
              </button>
              <button
                onClick={() => clearOldLogs(30)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
              >
                Clear 30d+ Logs
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Logs ({totalCount.toLocaleString()} total)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50 ${getLevelColor(log.level)}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeColor(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(
                            log.category
                          )}`}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-md truncate">{log.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(log.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > filters.limit && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filters.offset + 1} to{' '}
                {Math.min(filters.offset + filters.limit, totalCount)} of{' '}
                {totalCount} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      offset: Math.max(0, filters.offset - filters.limit),
                    })
                  }
                  disabled={filters.offset === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      offset: filters.offset + filters.limit,
                    })
                  }
                  disabled={filters.offset + filters.limit >= totalCount}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">
                  Log Details
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Level</p>
                    <span
                      className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getLevelBadgeColor(
                        selectedLog.level
                      )}`}
                    >
                      {selectedLog.level}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <span
                      className={`mt-1 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getCategoryColor(
                        selectedLog.category
                      )}`}
                    >
                      {selectedLog.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Timestamp</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedLog.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDuration(selectedLog.duration)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Action</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.message}</p>
                </div>

                {selectedLog.endpoint && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Endpoint</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedLog.endpoint}
                    </p>
                  </div>
                )}

                {selectedLog.userId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedLog.userId}
                    </p>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">IP Address</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">User Agent</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Metadata</p>
                    <pre className="mt-1 p-4 bg-gray-50 rounded-lg text-xs text-gray-900 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.error && (
                  <div>
                    <p className="text-sm font-medium text-red-500">Error</p>
                    <pre className="mt-1 p-4 bg-red-50 rounded-lg text-xs text-red-900 overflow-x-auto">
                      {selectedLog.error}
                    </pre>
                  </div>
                )}

                {selectedLog.stackTrace && (
                  <div>
                    <p className="text-sm font-medium text-red-500">Stack Trace</p>
                    <pre className="mt-1 p-4 bg-red-50 rounded-lg text-xs text-red-900 overflow-x-auto">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
