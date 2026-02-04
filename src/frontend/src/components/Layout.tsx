import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import Banner from './Banner';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Banner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
