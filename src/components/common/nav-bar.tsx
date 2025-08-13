import Image from 'next/image';

export default function Navbar() {
    return (
        <nav className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20 shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo Section */}
                    <div className='flex items-center gap-3'>
                        <Image
                            src="/deto-it-logo.png"
                            alt="Detox It Logo"
                            width={40}
                            height={40}
                            className='rounded-full'
                        />
                        <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent'>
                            Detox It
                        </span>
                    </div>

                    {/* Navigation Links */}
                    <div className='hidden md:flex items-center space-x-8'>
                        <a href="#home" className='text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium'>
                            Home
                        </a>
                        <a href="#about" className='text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium'>
                            About
                        </a>
                        <a href="#programs" className='text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium'>
                            Programs
                        </a>
                        <a href="#community" className='text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium'>
                            Community
                        </a>
                        <a href="#resources" className='text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium'>
                            Resources
                        </a>
                    </div>

                    {/* Auth Buttons */}
                    <div className='flex items-center gap-4'>
                        <button className='text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200'>
                            Sign In
                        </button>
                        <button className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg'>
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className='md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200'>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}