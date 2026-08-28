const HomeNavbar = () => {
  return (
    <nav className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light">
      {/* Logo */}
      <div className="logo flex-1">FreshMart</div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="btn btn-ghost font-semibold">
          Sign In
        </button>

        <button className="btn btn-primary font-bold px-5">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default HomeNavbar;