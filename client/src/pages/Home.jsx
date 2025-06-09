import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { title: "Cleaning", img: "/assets/14.jpg" },
    { title: "Pest Control", img: "/assets/image-2.png" },
    { title: "AC Repairing", img: "/assets/17123933957.webp" },
    { title: "Cooler Repairing", img: "/assets/download.jpg" },
    { title: "Electrician", img: "/assets/electrician.jpg" },
    { title: "Plumbering", img: "/assets/plumbering.jpg" },
    { title: "Carpenter", img: "/assets/images (2).jpg" },
    { title: "Painting", img: "/assets/room paint.jpeg" },
    { title: "TV Repairing", img: "/assets/Become Our Partner If You Repair (3) (1).png" },
  ];

  const featuredServices = [
    { title: "AC Repair", img: "/img/AC repairingg.jpg", desc: "Expert AC repair services for all brands" },
    { title: "Plumbing", img: "/img/plumberingg.avif", desc: "24/7 emergency plumbing solutions" },
    { title: "Carpentry", img: "/img/carpenter.jpg", desc: "Custom woodwork and furniture repair" },
    { title: "TV Repair", img: "/img/tv repairrr.jpg", desc: "Flat screen and smart TV specialists" },
    { title: "House Cleaning", img: "/img/cleaninggg.jpg", desc: "Deep cleaning and sanitization" },
    { title: "Electrical", img: "/img/electrician org.jpg", desc: "Certified electricians for all needs" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile App-like Header - Only shows on mobile */}
   {/* Hero Section - Responsive with mobile card design */}
<div className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-12 md:py-20">
  {/* Desktop View (unchanged) */}
  {!isMobile && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        Premium Home Services <br />On Demand
      </h1>
      <p className="text-xl max-w-2xl mx-auto mb-8">
        Trusted professionals for all your home maintenance and repair needs
      </p>
      <Link 
        to="/products" 
        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
      >
        Explore Services
      </Link>
    </div>
  )}

  {/* Mobile View - Card Design */}
  {isMobile && (
    <div className="mx-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          Premium Home Services On Demand
        </h1>
        <p className="text-base mb-6">
          Trusted professionals for all your home maintenance and repair needs
        </p>
        <div className="flex flex-col space-y-3">
          <Link 
            to="/products" 
            className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg text-center"
          >
            Explore Services
          </Link>
          <Link 
            to="/contact" 
            className="w-full bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300 text-center"
          >
            Contact Us
          </Link>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">4.9/5 (2k+ Reviews)</span>
          </div>
        </div>
      </div>
      
      {/* Floating Service Icons */}
      <div className="flex justify-center mt-6 space-x-4">
        {['Cleaning', 'Repair', 'Plumbing'].map((service, index) => (
          <div key={index} className="bg-white/20 backdrop-blur-sm rounded-full p-3 flex flex-col items-center">
            <div className="bg-white rounded-full p-2 mb-1">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium">{service}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

      {/* Search Bar for Mobile - Only shows on mobile */}
      {isMobile && (
        <div className="px-4 py-3 bg-white shadow-md -mt-4 mx-4 rounded-lg z-20 relative">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="What service do you need?" 
              className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
        </div>
      )}

      {/* Categories Section - Original desktop view with mobile modifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Service Categories</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
        </div>
        
        {/* Original desktop grid */}
        {!isMobile && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {categories.map((cat, idx) => (
              <Link 
                to={`/products?category=${cat.title}`} 
                key={idx} 
                className="group flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-2xl bg-white p-4 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <h3 className="text-white font-semibold text-lg">{cat.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Mobile-specific categories grid */}
        {isMobile && (
          <div className="grid grid-cols-3 gap-4">
            {categories.slice(0, 6).map((cat, idx) => (
              <Link 
                to={`/products?category=${cat.title}`} 
                key={idx} 
                className="group flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-xl bg-white p-2 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                    <h3 className="text-white font-medium text-sm text-center w-full">{cat.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
            <Link 
              to="/products" 
              className="flex flex-col items-center justify-center bg-gray-100 rounded-xl p-4"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View All</span>
            </Link>
          </div>
        )}
      </div>

      {/* Promo Banner - Original desktop view with mobile modifications */}
      <div className="bg-blue-50 py-12 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Original desktop layout */}
          {!isMobile && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/2">
                  <img 
                    src="/img/tv repairrr.jpg" 
                    alt="Professional Service" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Our Services?</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Certified and background-checked professionals</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Same-day service availability</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">100% satisfaction guarantee</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">Transparent pricing with no hidden fees</span>
                    </li>
                  </ul>
                  <Link 
                    to="/about" 
                    className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300 self-start"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile layout */}
          {isMobile && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img 
                    src="/img/tv repairrr.jpg" 
                    alt="Professional Service" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Why Choose Our Services?</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Certified professionals</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Same-day service</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 text-sm">Satisfaction guarantee</span>
                    </li>
                  </ul>
                  <Link 
                    to="/about" 
                    className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured Services - Original desktop view with mobile modifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most popular services trusted by thousands of homeowners
          </p>
        </div>
        
        {/* Original desktop grid */}
        {!isMobile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-xl font-bold">{service.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{service.desc}</p>
                  <Link
                    to="/products"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Mobile layout */}
        {isMobile && (
          <div className="grid grid-cols-1 gap-4">
            {featuredServices.slice(0, 3).map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex">
                  <div className="w-1/3 h-32 overflow-hidden">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{service.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-blue-600 font-bold">From ₹199</span>
                      {/* <Link
                        to="/products"
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition duration-300"
                      >
                        Book Now
                      </Link> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <Link 
                to="/products" 
                className="inline-block text-blue-600 font-medium text-sm"
              >
                View All Services →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Testimonials - Original desktop view with mobile modifications */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
          </div>
          
          {/* Original desktop grid */}
          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Sarah Johnson", comment: "The electrician arrived on time and fixed my wiring issue in no time. Highly professional service!", rating: 5 },
                { name: "Michael Chen", comment: "Best plumbing service I've ever used. They went above and beyond to fix my leak.", rating: 5 },
                { name: "Emma Williams", comment: "My AC was fixed within an hour of booking. The technician was very knowledgeable.", rating: 4 },
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Mobile layout */}
          {isMobile && (
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {[
                  { name: "Sarah Johnson", comment: "The electrician arrived on time and fixed my wiring issue in no time. Highly professional service!", rating: 5 },
                  { name: "Michael Chen", comment: "Best plumbing service I've ever used. They went above and beyond to fix my leak.", rating: 5 },
                  { name: "Emma Williams", comment: "My AC was fixed within an hour of booking. The technician was very knowledgeable.", rating: 4 },
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm min-w-[280px]">
                    <div className="flex items-center mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 italic">"{testimonial.comment}"</p>
                    <p className="font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section - Original desktop view */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Book a Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their home services
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/products" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Book Now
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile - Only shows on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 flex justify-around items-center p-2 z-10">
          <Link to="/" className="flex flex-col items-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs mt-1">Services</span>
          </Link>
          <Link to="/my-orders" className="flex flex-col items-center text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs mt-1">Orders</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Cart</span>
          </Link>
        </div>
      )}
    </div>
  );
}