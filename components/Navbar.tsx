import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">3D Print</span>
              <span className="text-2xl font-light text-gray-700">Hub</span>
            </Link>

            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                href="/models"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
              >
                Models
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/account/orders"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                  >
                    My Orders
                  </Link>
                  {(session.user as any).role === 'ADMIN' && (
                    <Link
                      href="/admin/models"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            ) : session?.user ? (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition"
                >
                  Sign In
                </button>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
