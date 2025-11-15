import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RecommendedCarousel from '@/components/recommendations/RecommendedCarousel';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-elegant mb-8 animate-fade-in">
                <span className="text-2xl">🎨</span>
                <span className="text-sm font-semibold text-primary-600">3D Prints & Paper Crafts</span>
                <span className="text-2xl">✂️</span>
              </div>

              <h1 className="font-display font-bold text-gray-900 mb-6 animate-slide-up">
                Create <span className="gradient-text">Unforgettable Moments</span>
                <br />
                For Every Occasion
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                Personalized 3D prints and paper crafts for birthdays, weddings, graduations,
                corporate events, religious celebrations, and more. Make every event special with
                custom-designed creations.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-slide-up">
                <Link
                  href="/explore"
                  className="btn-primary text-lg inline-flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore Collection
                </Link>
                {!session && (
                  <Link
                    href="/auth/signup"
                    className="btn-secondary text-lg inline-flex items-center justify-center"
                  >
                    Get Started Free
                    <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-elegant">
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-gray-600 font-medium">Designs</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-elegant">
                  <div className="text-3xl font-bold text-accent-600">15+</div>
                  <div className="text-sm text-gray-600 font-medium">Occasions</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-elegant">
                  <div className="text-3xl font-bold text-paper-600">2</div>
                  <div className="text-sm text-gray-600 font-medium">Craft Types</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-elegant">
                  <div className="text-3xl font-bold text-primary-600">∞</div>
                  <div className="text-sm text-gray-600 font-medium">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Models */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RecommendedCarousel />
          </div>
        </div>

        {/* Product Types Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-gray-900 mb-4">
                Choose Your <span className="gradient-text">Creation Style</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you prefer the innovation of 3D printing or the artistry of paper crafts,
                we have the perfect solution for you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 3D Printing */}
              <div className="group card-elegant hover:scale-105 transition-transform duration-300">
                <div className="text-6xl mb-6 text-center">🖨️</div>
                <h3 className="text-2xl font-display font-semibold mb-4 text-center text-gray-900">
                  3D Printing
                </h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Durable, high-quality 3D printed objects in various materials including PLA, ABS,
                  PETG, resin, and more. Perfect for functional items and long-lasting keepsakes.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Multiple material options
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Customizable colors & text
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Professional quality finish
                  </li>
                </ul>
                <Link href="/explore?productType=THREE_D_PRINT" className="btn-primary w-full">
                  Explore 3D Prints
                </Link>
              </div>

              {/* Paper Crafts */}
              <div className="group card-elegant hover:scale-105 transition-transform duration-300">
                <div className="text-6xl mb-6 text-center">✂️</div>
                <h3 className="text-2xl font-display font-semibold mb-4 text-center text-gray-900">
                  Paper Crafts
                </h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Intricate paper and cardstock designs compatible with Cricut, Silhouette, and other
                  cutting machines. Beautiful, affordable, and perfect for decorations.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-paper-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Compatible with Cricut & Silhouette
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-paper-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Various paper types available
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-paper-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Affordable & eco-friendly
                  </li>
                </ul>
                <Link href="/explore?productType=PAPER_CRAFT" className="btn-paper w-full">
                  Explore Paper Crafts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Occasions Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-gray-900 mb-4">
                Perfect For <span className="gradient-text">Every Occasion</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From intimate gatherings to grand celebrations, find the perfect custom creation for your special event.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Birthdays', icon: '🎂', occasion: 'BIRTHDAY' },
                { name: 'Weddings', icon: '💍', occasion: 'WEDDING' },
                { name: 'Graduations', icon: '🎓', occasion: 'GRADUATION' },
                { name: 'Corporate', icon: '💼', occasion: 'CORPORATE_EVENT' },
                { name: 'Communion', icon: '✝️', occasion: 'COMMUNION' },
                { name: 'Baptism', icon: '👶', occasion: 'BAPTISM' },
                { name: 'Confirmation', icon: '🕊️', occasion: 'CONFIRMATION' },
                { name: 'Holidays', icon: '🎄', occasion: 'SEASONAL_HOLIDAY' },
                { name: 'Baby Shower', icon: '🍼', occasion: 'BABY_SHOWER' },
                { name: 'Anniversary', icon: '💐', occasion: 'ANNIVERSARY' },
                { name: 'Trade Shows', icon: '🏢', occasion: 'TRADE_SHOW' },
                { name: 'Promotions', icon: '🎁', occasion: 'PROMOTIONAL_GADGET' },
              ].map((item) => (
                <Link
                  key={item.occasion}
                  href={`/explore?occasion=${item.occasion}`}
                  className="group card hover:shadow-elegant-xl transition-all duration-300 text-center"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-gray-900 mb-4">
                Why Choose Us?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-elegant text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">Full Customization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Personalize every detail with colors, text, logos, and custom designs to make each creation uniquely yours.
                </p>
              </div>

              <div className="card-elegant text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">AI-Powered Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get intelligent suggestions and design recommendations powered by advanced AI to create stunning results.
                </p>
              </div>

              <div className="card-elegant text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-paper-500 to-paper-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">Premium Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Professional printing partners and premium materials ensure every product meets the highest standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {session ? (
          <div className="bg-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="card-elegant text-center">
                <div className="text-5xl mb-4">👋</div>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                  Welcome back, {session.user?.name || 'Creator'}!
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Ready to create something amazing for your next special occasion?
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/explore" className="btn-primary">
                    Start Creating
                  </Link>
                  <Link href="/account/orders" className="btn-secondary">
                    View My Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <h2 className="text-4xl font-display font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                Join thousands of creators making unforgettable moments with custom 3D prints and paper crafts.
              </p>
              <Link href="/auth/signup" className="bg-white text-primary-600 hover:bg-gray-100 px-10 py-4 rounded-lg font-semibold text-lg shadow-elegant-xl transition-all transform hover:-translate-y-0.5 inline-block">
                Create Your Free Account
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-display font-semibold mb-4">Creative Hub</h3>
              <p className="text-sm">
                Custom 3D prints and paper crafts for every occasion.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/explore?productType=THREE_D_PRINT" className="hover:text-white transition">3D Prints</Link></li>
                <li><Link href="/explore?productType=PAPER_CRAFT" className="hover:text-white transition">Paper Crafts</Link></li>
                <li><Link href="/explore" className="hover:text-white transition">All Products</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Occasions</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/explore?occasion=BIRTHDAY" className="hover:text-white transition">Birthdays</Link></li>
                <li><Link href="/explore?occasion=WEDDING" className="hover:text-white transition">Weddings</Link></li>
                <li><Link href="/explore?occasion=CORPORATE_EVENT" className="hover:text-white transition">Corporate Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Creative Hub. All rights reserved. Made with ❤️ for every occasion.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
