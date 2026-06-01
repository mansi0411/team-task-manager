/**
 * Layout — Navbar + page content for authenticated pages
 */

import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
};

export default Layout;
