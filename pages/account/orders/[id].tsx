import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { PrintStatus } from '@prisma/client';

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (id && session) {
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Order not found'}</p>
            <button onClick={() => router.push('/account/orders')} className="btn-primary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shippingInfo = order.shippingInfo as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/account/orders')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-gray-600">Order #{order.id}</p>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <OrderStatusTimeline
                currentStatus={order.status}
                createdAt={order.createdAt}
                updatedAt={order.updatedAt}
              />
            </div>

            {/* Order Items */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex space-x-4">
                      {item.customization.model.previewImageUrl ? (
                        <img
                          src={item.customization.model.previewImageUrl}
                          alt={item.customization.model.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
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

                        {/* Print Jobs for this item */}
                        {item.printJobs && item.printJobs.length > 0 && (
                          <div className="mt-3 bg-gray-50 rounded p-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              Print Status:
                            </div>
                            {item.printJobs.map((job: any) => (
                              <div key={job.id} className="text-xs text-gray-600">
                                <span
                                  className={`inline-block px-2 py-1 rounded text-white ${
                                    job.status === PrintStatus.COMPLETED
                                      ? 'bg-green-600'
                                      : job.status === PrintStatus.PRINTING
                                      ? 'bg-blue-600'
                                      : job.status === PrintStatus.FAILED
                                      ? 'bg-red-600'
                                      : 'bg-gray-600'
                                  }`}
                                >
                                  {job.status}
                                </span>
                                {job.partner && (
                                  <span className="ml-2">by {job.partner.name}</span>
                                )}
                                {job.estimatedPrintTimeMinutes && (
                                  <span className="ml-2">
                                    (~{Math.round(job.estimatedPrintTimeMinutes / 60)}h)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Shipping */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="card sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(Number(order.totalAmount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
              </div>

              {/* Invoice Link */}
              {order.invoice && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Invoice #{order.invoice.invoiceNumber}
                    </div>
                    {order.invoice.pdfUrl && (
                      <a
                        href={order.invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                        download
                      >
                        📄 Download Invoice PDF
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
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
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium">{shippingInfo.email}</div>
                </div>
                {shippingInfo.phone && (
                  <div>
                    <div className="text-gray-500">Phone</div>
                    <div className="font-medium">{shippingInfo.phone}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
