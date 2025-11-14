import Link from 'next/link';
import { OrderStatus } from '@prisma/client';
import { formatCurrency, formatDate } from '@/utils/helpers';

interface OrderCardProps {
  order: any;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  PRINTING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Payment Pending',
  PAID: 'Payment Confirmed',
  SCHEDULED: 'Print Scheduled',
  PRINTING: 'In Production',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items?.length || 0;
  const firstItem = order.items?.[0];

  return (
    <Link href={`/account/orders/${order.id}`}>
      <div className="card hover:shadow-lg transition cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(order.createdAt)}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              STATUS_COLORS[order.status]
            }`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {firstItem?.customization?.model?.previewImageUrl ? (
            <img
              src={firstItem.customization.model.previewImageUrl}
              alt={firstItem.customization.model.name}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}

          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {firstItem?.customization?.model?.name || 'Custom Item'}
            </div>
            {itemCount > 1 && (
              <div className="text-sm text-gray-500 mt-1">
                +{itemCount - 1} more item{itemCount - 1 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(Number(order.totalAmount))}
          </div>
        </div>

        <div className="mt-4">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}
