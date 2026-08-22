const HomeNavbar = () => {
  return (
    <nav className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light">
      {/* Logo */}
      <div className="flex-1">
        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight text-primary"
        >
          Fresh<span className="text-base-content">Mart</span>
        </a>
      </div>

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