import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Personalize Your 3D Printed Objects
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create unique, custom 3D printed gadgets with AI-powered design assistance
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/models"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
            >
              Browse Models
            </Link>
            {!session && (
              <Link
                href="/auth/signup"
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Customize Design</h3>
            <p className="text-gray-600">
              Choose colors, add text, and upload logos to make each piece uniquely yours
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Get intelligent design suggestions based on your style preferences
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Professional 3D printing partners ensure quality and timely shipping
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {session && (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user?.name || 'User'}!
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to create your next custom 3D print?
            </p>
            <Link
              href="/account/orders"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View My Orders
            </Link>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2025 3D PrintHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
