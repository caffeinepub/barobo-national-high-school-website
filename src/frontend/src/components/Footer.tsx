import { Heart } from 'lucide-react';
import { SiFacebook } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ backgroundColor: '#800000' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img 
                src="/assets/Barobo National High School Logo.gif" 
                alt="BNHS Logo" 
                className="h-12 w-auto object-contain md:h-14"
              />
              <h3 className="text-lg font-semibold text-white">Barobo National High School</h3>
            </div>
            <p className="text-sm text-white/90">
              Committed to providing quality education and nurturing future leaders.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <p className="text-sm text-white/90">
              <strong>School Address:</strong> Purok 1B Townsite, Poblacion, Barobo, Surigao del Sur<br />
              <strong>Phone:</strong> (086) 850 - 0113 (JHS), (086) 850 - 0547 (SHS)<br />
              <strong>Email:</strong> 304861@deped.gov.ph
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/BaroboNationalHighSchool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-colors"
                aria-label="Visit our Facebook page"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-8">
          <div className="overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-center text-sm text-white">
              <span className="inline-flex items-center gap-1">
                © {currentYear} BNHS. Built with <Heart className="inline h-4 w-4 fill-red-500 text-red-500" /> using Motoko Programming Language. Powered by: Bless T. Tajale and BNHS Webpage Team.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
