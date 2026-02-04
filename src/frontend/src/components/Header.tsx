import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, ChevronDown, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

// Data-driven menu structure
interface MenuLink {
  title: string;
  href: string;
  external?: boolean;
}

interface MenuItem {
  title: string;
  href?: string;
  links?: MenuLink[];
}

const menuData: MenuItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    links: [
      { title: 'History', href: '/about/history' },
      { title: 'Organizational Structure', href: '/about/organizational-structure' },
      { title: 'Citizen Charter', href: '/about/citizen-charter' },
      { title: 'Student Corner', href: '/about/student-corner' },
      { title: 'Clubs and Organization', href: '/about/clubs-organizations' },
      { title: 'Alumni', href: '/about/alumni' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Learning Materials and Resources', href: 'https://1drv.ms/f/c/bac784056b95594f/IgB25szVm3tfQJwK0KpTVfB3AdNyOkxnOty8rbrcufL06I0?e=zbZ9hC', external: true },
      { title: 'SDS Division Portal', href: 'https://depedsurigaodelsur.com', external: true },
      { title: 'DepEd LRMDS Portal', href: 'https://lrmds.deped.gov.ph', external: true },
      { title: 'DepEd Website', href: 'https://www.deped.gov.ph', external: true },
      { title: 'DepEd TV', href: 'https://www.youtube.com/@DepEdTV', external: true },
      { title: 'DepEd EdTech Unit', href: 'https://www.youtube.com/@EducationalTechnologyUnit', external: true },
    ],
  },
  {
    title: 'Issuances',
    links: [
      { title: 'DepEd Orders', href: '/issuances/deped-orders' },
      { title: 'DepEd Memoranda', href: '/issuances/deped-memoranda' },
      { title: 'Division Orders/Memoranda', href: '/issuances/division-orders-memoranda' },
      { title: 'School Orders/Memoranda', href: '/issuances/school-orders-memoranda' },
      { title: 'Advisories/Circulars', href: '/issuances/advisories-circulars' },
      { title: 'Archived Issuances', href: '/issuances/archived-issuances' },
    ],
  },
  {
    title: 'PAPs',
    links: [
      { title: 'School SIP Projects', href: '/paps/sip' },
      { title: 'Special Programs', href: '/paps/learning-curriculum' },
      { title: 'School-Based Management (SBM)', href: '/paps/sbm' },
      { title: 'Learning and Development', href: '/paps/inset' },
      { title: 'ARAL Program', href: '/paps/aral-program' },
      { title: 'PRAISE', href: '/paps/praise' },
      { title: 'Infrastructure and Facilities', href: '/paps/infrastructure' },
      { title: 'School Health and Nutrition Programs', href: '/paps/school-health' },
      { title: 'WINS', href: '/paps/wins' },
      { title: 'Child Protection Policy', href: '/paps/child-protection-policy' },
      { title: 'Prefect of Discipline', href: '/paps/prefect-of-discipline' },
      { title: 'GPP', href: '/paps/gpp' },
      { title: 'BKD', href: '/paps/bkd' },
      { title: 'Brigada Eskwela', href: '/paps/brigada-eskwela' },
      { title: 'ESWM', href: '/paps/eswm' },
    ],
  },
  {
    title: 'Publications & Accomplishments',
    links: [
      { title: 'The Inkspirer', href: '/publications/the-inkspirer' },
      { title: 'Tintang Balobo', href: '/publications/tintang-balobo' },
      { title: 'SOSA', href: '/publications/sosa' },
      { title: 'School Activities', href: '/' },
    ],
  },
  {
    title: 'Research & Innovations',
    links: [
      { title: 'Action Research', href: '/research/action-research' },
      { title: 'School-Based Research', href: '/research/school-based-research' },
      { title: 'Research Outputs', href: '/research/research-outputs' },
    ],
  },
  {
    title: 'Monitoring & Transparency',
    links: [
      { title: 'Instructional Supervision', href: '/monitoring/instructional-supervision' },
      { title: 'Physical Evaluation', href: '/monitoring/physical-evaluation' },
      { title: 'Division Monitoring', href: '/monitoring/division-monitoring' },
      { title: 'SMEA', href: '/monitoring/smea' },
      { title: 'SPTA', href: '/monitoring/spta' },
      { title: 'Financial Board', href: '/monitoring/financial-board' },
    ],
  },
  {
    title: 'Others',
    links: [
      { title: 'MDL Feedback and MOV\'s', href: '/others/mdl-feedback' },
      { title: 'NAT Resources', href: '/others/nat-resources' },
      { title: 'NCAE Resources', href: '/others/ncae-resources' },
      { title: 'Khan Academy', href: '/others/khan-academy' },
      { title: 'Downloadable School Forms', href: '/others/downloadable-forms' },
      { title: 'Support Services', href: '/others/support-services' },
    ],
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
        navigate({ to: '/admin/dashboard' });
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-md" style={{ backgroundColor: '#800000' }}>
      <div className="container mx-auto flex h-14 items-center justify-between px-2">
        {/* Desktop Navigation - Data-Driven Dropdown System */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {menuData.map((item) => (
            <div key={item.title} className="relative">
              {item.href ? (
                // Simple link without dropdown
                <Link to={item.href}>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-transparent px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#a52a2a] focus:bg-[#a52a2a] focus:outline-none">
                    {item.title}
                  </button>
                </Link>
              ) : (
                // Dropdown menu
                <>
                  <button
                    onClick={() => toggleDropdown(item.title)}
                    className={`inline-flex h-9 items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#a52a2a] focus:bg-[#a52a2a] focus:outline-none ${
                      openDropdown === item.title ? 'bg-[#a52a2a]' : 'bg-transparent'
                    }`}
                  >
                    {item.title}
                    <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.title && (
                    <>
                      {/* Backdrop to close dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={closeDropdown}
                      />
                      {/* Dropdown content */}
                      <div className="absolute left-0 top-full z-50 mt-1 animate-dropdown-slide-down">
                        <div className="maroon-dropdown-content rounded-md border border-white/15 shadow-lg">
                          <ul className={`grid gap-1 p-3 ${
                            item.links && item.links.length > 6 
                              ? 'w-[400px] md:w-[500px] md:grid-cols-2' 
                              : 'w-[300px]'
                          }`}>
                            {item.links?.map((link) => (
                              <li key={link.href}>
                                {link.external ? (
                                  <a
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={closeDropdown}
                                    className="block select-none rounded-md p-2.5 text-xs font-medium leading-none text-white transition-colors hover:bg-[#d4af37] hover:text-[#800000] focus:bg-[#d4af37] focus:text-[#800000] focus:outline-none"
                                  >
                                    {link.title}
                                  </a>
                                ) : (
                                  <Link
                                    to={link.href}
                                    onClick={closeDropdown}
                                    className="block select-none rounded-md p-2.5 text-xs font-medium leading-none text-white transition-colors hover:bg-[#d4af37] hover:text-[#800000] focus:bg-[#d4af37] focus:text-[#800000] focus:outline-none"
                                  >
                                    {link.title}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Admin Section - Desktop */}
        <div className="hidden lg:flex ml-auto items-center gap-2">
          {isAuthenticated && (
            <Button
              onClick={() => navigate({ to: '/admin/dashboard' })}
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium bg-white/10 text-white border-white/20 hover:bg-[#a52a2a] hover:text-white hover:border-white/30"
            >
              <LayoutDashboard className="mr-1.5 h-3.5 w-3.5" />
              Dashboard
            </Button>
          )}
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            size="sm"
            className={`h-9 px-3 text-xs font-medium transition-colors ${
              isAuthenticated 
                ? 'bg-white/10 text-white border border-white/20 hover:bg-[#a52a2a] hover:text-white hover:border-white/30' 
                : 'bg-white text-black border-0 hover:bg-[#d4af37] hover:text-[#800000] active:bg-[#c9a332]'
            }`}
          >
            {isLoggingIn ? (
              <>Logging in...</>
            ) : isAuthenticated ? (
              <>
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Admin Login
              </>
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex w-full items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-white">Menu</span>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                onClick={() => navigate({ to: '/admin/dashboard' })}
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs bg-white/10 text-white border-white/20 hover:bg-[#a52a2a] hover:text-white"
              >
                <LayoutDashboard className="h-3 w-3" />
              </Button>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className={`h-8 px-2 text-xs transition-colors ${
                isAuthenticated 
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-[#a52a2a] hover:text-white' 
                  : 'bg-white text-black border-0 hover:bg-[#d4af37] hover:text-[#800000] active:bg-[#c9a332]'
              }`}
            >
              {isLoggingIn ? (
                <>Logging in...</>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="mr-1 h-3 w-3" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="mr-1 h-3 w-3" />
                  Admin
                </>
              )}
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#a52a2a] hover:text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] overflow-y-auto mobile-menu-maroon">
                <nav className="flex flex-col gap-4">
                  {menuData.map((item) => (
                    <div key={item.title}>
                      {item.href ? (
                        <Link 
                          to={item.href} 
                          onClick={() => setIsOpen(false)} 
                          className="text-lg font-semibold text-white hover:text-[#d4af37] transition-colors"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <MobileMenuSection 
                          title={item.title} 
                          links={item.links || []} 
                          onClose={() => setIsOpen(false)} 
                        />
                      )}
                    </div>
                  ))}
                  {isAuthenticated && (
                    <Link 
                      to="/admin/dashboard" 
                      onClick={() => setIsOpen(false)} 
                      className="text-lg font-semibold text-white hover:text-[#d4af37] transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileMenuSection({ 
  title, 
  links, 
  onClose 
}: { 
  title: string; 
  links: MenuLink[]; 
  onClose: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between text-lg font-semibold text-white hover:text-[#d4af37] transition-colors"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div className="ml-4 flex flex-col gap-2">
          {links.map((link) => (
            <div key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="text-sm text-white/80 hover:text-[#d4af37] transition-colors"
                >
                  {link.title}
                </a>
              ) : (
                <Link
                  to={link.href}
                  onClick={onClose}
                  className="text-sm text-white/80 hover:text-[#d4af37] transition-colors"
                >
                  {link.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
