import { WaitlistForm } from "@/components/waitlist/waitlist-form";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="aurora absolute -inset-1" />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative">
        <div className="mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel border border-emerald-200/40 rounded-full text-emerald-700 font-medium text-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Coming Soon
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-8 relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
            Break Free with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              DETOX IT
            </span>
          </h1>
          <p className="font-sans text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            The revolutionary addiction recovery platform that combines
            AI-powered personalization with proven therapeutic methods.
          </p>

          <div className="hidden sm:flex justify-center">
            <WaitlistForm />
          </div>

          <div className="mt-6 text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-200 border border-white" />
              <span className="w-6 h-6 rounded-full bg-teal-200 border border-white" />
              <span className="w-6 h-6 rounded-full bg-blue-200 border border-white" />
            </div>
            <span>Trusted by early adopters</span>
          </div>
        </div>

        <div className="sm:hidden mb-12 relative z-10 w-full max-w-lg">
          <WaitlistForm />
          <p className="text-sm text-gray-500 mt-3 text-center">
            No spam, ever. Unsubscribe with one click.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto relative z-10">
          <div className="glass-panel p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              AI-Powered Plans
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Personalized recovery roadmaps that adapt to your progress,
              triggers, and goals using advanced machine learning.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              24/7 Community
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Connect with peers, mentors, and licensed professionals in a safe,
              judgment-free environment anytime you need support.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Progress Tracking
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your journey with detailed analytics, milestone
              celebrations, and evidence-based progress metrics.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center relative z-10">
          <p className="text-gray-600 mb-4">
            Ready to start your transformation?
          </p>
          <div className="inline-flex items-center text-emerald-600 font-medium">
            <span>Join the waitlist above</span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
