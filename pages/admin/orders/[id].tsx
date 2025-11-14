import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { OrderStatus } from '@prisma/client';

export default function AdminOrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session && (session.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (id && session && (session.user as any)?.role === 'ADMIN') {
      fetchOrder();
    }
  }, [id, session]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order');
      }

      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!confirm(`Update order status to ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setOrder(data.data);
      alert('Order status updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout activeTab="orders">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout activeTab="orders">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </AdminLayout>
    );
  }

  const shippingInfo = order.shippingInfo as any;

  return (
    <AdminLayout activeTab="orders">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Orders
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Order #{order.id}</h2>
        <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Order Status</h3>
            <OrderStatusTimeline
              currentStatus={order.status}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
            />

            {/* Status Update Actions */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Update Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.values(OrderStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating || order.status === status}
                    className={`px-3 py-1 text-sm rounded ${
                      order.status === status
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex space-x-4">
                    {item.customization.model.previewImageUrl && (
                      <img
                        src={item.customization.model.previewImageUrl}
                        alt={item.customization.model.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.customization.model.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(Number(item.unitPrice))} × {item.quantity} ={' '}
                        {formatCurrency(Number(item.subtotal))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Customer</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-500">Name</div>
                <div className="font-medium">{order.user.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{order.user.email}</div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
            <div className="text-sm space-y-2">
              <div>
                <div className="text-gray-500">Name</div>
                <div className="font-medium">{shippingInfo.name}</div>
              </div>
              <div>
                <div className="text-gray-500">Address</div>
                <div className="font-medium">
                  {shippingInfo.address}
                  <br />
                  {shippingInfo.city}, {shippingInfo.zip}
                  <br />
                  {shippingInfo.country}
                </div>
              </div>
              {shippingInfo.email && (
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium">{shippingInfo.email}</div>
                </div>
              )}
              {shippingInfo.phone && (
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div className="font-medium">{shippingInfo.phone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
