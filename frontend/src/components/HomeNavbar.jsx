import { Link } from "react-router";

const HomeNavbar = () => {
  return (
    <nav className="navbar bg-base-100 px-4 sm:px-6 lg:px-10 border-b border-theme-light">
      {/* Logo */}
      <div className="flex flex-1 items-center align-middle"> 
        <img src="/logo.png" alt="Logo" className="w-7 h-7 mr-3" />
        <div className="logo max-sm:hidden">FreshMart</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="btn btn-ghost font-semibold">
          <Link to={"/login"}>Sign In</Link>
        </button>

        <button className="btn btn-primary font-bold px-5">
          <Link to={"/register"}>Get Started</Link>
        </button>
      </div>
    </nav>
  );
};

export default HomeNavbar;