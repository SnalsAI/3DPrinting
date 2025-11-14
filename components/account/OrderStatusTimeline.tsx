import { OrderStatus } from '@prisma/client';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = [
  {
    status: OrderStatus.PENDING_PAYMENT,
    label: 'Payment Pending',
    icon: '💳',
    description: 'Waiting for payment',
  },
  {
    status: OrderStatus.PAID,
    label: 'Payment Confirmed',
    icon: '✓',
    description: 'Payment received',
  },
  {
    status: OrderStatus.SCHEDULED,
    label: 'Print Scheduled',
    icon: '📅',
    description: 'Assigned to print partner',
  },
  {
    status: OrderStatus.PRINTING,
    label: 'In Production',
    icon: '🖨️',
    description: 'Currently printing',
  },
  {
    status: OrderStatus.SHIPPED,
    label: 'Shipped',
    icon: '📦',
    description: 'On the way',
  },
  {
    status: OrderStatus.DELIVERED,
    label: 'Delivered',
    icon: '🎉',
    description: 'Order completed',
  },
];

const CANCELLED_STEP = {
  status: OrderStatus.CANCELLED,
  label: 'Cancelled',
  icon: '❌',
  description: 'Order cancelled',
};

export default function OrderStatusTimeline({
  currentStatus,
  createdAt,
  updatedAt,
}: OrderStatusTimelineProps) {
  // Handle cancelled status separately
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{CANCELLED_STEP.icon}</span>
          <div>
            <div className="text-lg font-semibold text-red-900">
              {CANCELLED_STEP.label}
            </div>
            <div className="text-sm text-red-700">{CANCELLED_STEP.description}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.status === currentStatus);

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div
          className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
          style={{
            height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        ></div>

        {/* Steps */}
        <div className="space-y-8">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.status} className="relative flex items-start space-x-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                >
                  <span className="text-xl">{step.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className={`text-base font-semibold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <div
                        className={`text-sm ${
                          isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
