import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';

// Layout base: Sidebar + Navbar + área de conteúdo (páginas via <Outlet/>).
export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
