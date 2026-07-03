import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Online Shopping */}
          <div>
            <h4 className="text-[11px] uppercase font-bold tracking-widest text-myntra-dark dark:text-gray-100 mb-4">Online Shopping</h4>
            <ul className="space-y-2 text-xs text-myntra-gray dark:text-gray-400">
              <li><a href="/catalog?gender=Men" className="hover:text-myntra-pink transition-colors">Men</a></li>
              <li><a href="/catalog?gender=Women" className="hover:text-myntra-pink transition-colors">Women</a></li>
              <li><a href="/catalog?gender=Kids" className="hover:text-myntra-pink transition-colors">Kids</a></li>
              <li><a href="/catalog?category=Footwear" className="hover:text-myntra-pink transition-colors">Footwear</a></li>
              <li><a href="/catalog?category=Accessories" className="hover:text-myntra-pink transition-colors">Accessories</a></li>
              <li><a href="/catalog?category=Beauty" className="hover:text-myntra-pink transition-colors">Beauty</a></li>
            </ul>
          </div>

          {/* Column 2: Customer Policies */}
          <div>
            <h4 className="text-[11px] uppercase font-bold tracking-widest text-myntra-dark dark:text-gray-100 mb-4">Customer Policies</h4>
            <ul className="space-y-2 text-xs text-myntra-gray dark:text-gray-400">
              <li><a href="#" className="hover:text-myntra-pink transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-myntra-pink transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-myntra-pink transition-colors">T&C</a></li>
              <li><a href="#" className="hover:text-myntra-pink transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-myntra-pink transition-colors">Track Orders</a></li>
              <li><a href="#" className="hover:text-myntra-pink transition-colors">Shipping & Returns</a></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-[11px] uppercase font-bold tracking-widest text-myntra-dark dark:text-gray-100 mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-xs text-myntra-gray dark:text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-myntra-pink flex-shrink-0" />
                <span>123 Tech Park, Silicon Valley, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-myntra-pink flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-myntra-pink flex-shrink-0" />
                <span>support@myntrastore.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-[11px] uppercase font-bold tracking-widest text-myntra-dark dark:text-gray-100 mb-4">Keep in touch</h4>
            <p className="text-xs text-myntra-gray dark:text-gray-400 mb-3">
              Subscribe to get special discounts, outfits suggestions, and deals updates.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l outline-none focus:border-myntra-pink flex-1"
              />
              <button className="px-4 bg-myntra-pink text-white text-xs font-bold rounded-r uppercase hover:bg-rose-600 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Badges / Promises */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-b border-gray-200/50 dark:border-gray-800/50 text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-myntra text-myntra-pink">
              <ShieldCheck size={24} />
            </div>
            <h5 className="text-xs font-bold text-myntra-dark dark:text-gray-200">100% ORIGINAL guarantee</h5>
            <p className="text-[10px] text-myntra-gray max-w-[200px]">for all products on the platform</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-myntra text-myntra-pink">
              <RefreshCw size={24} />
            </div>
            <h5 className="text-xs font-bold text-myntra-dark dark:text-gray-200">Easy 14-day Returns</h5>
            <p className="text-[10px] text-myntra-gray max-w-[200px]">hassle-free self-service exchanges</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-myntra text-myntra-pink">
              <Truck size={24} />
            </div>
            <h5 className="text-xs font-bold text-myntra-dark dark:text-gray-200">Free Shipping</h5>
            <p className="text-[10px] text-myntra-gray max-w-[200px]">applicable on bills above ₹999</p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-[10px] text-myntra-gray uppercase font-bold tracking-wider">
          © {new Date().getFullYear()} Myntra Clone Store. Designed for Google DeepMind Coding Pair.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
