const Sidebar = ({ sidebarOpen, setSidebarOpen}) => {
  return (
    <>
    <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed left-0 top-16 z-40 w-full h-[calc(100vh-4rem)]
        bg-overlay transition-opacity duration-300
        ${sidebarOpen ? "opacity-90" : "pointer-events-none opacity-0"}`}
    />
    <div
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-base-100
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
        Sidebar
    </div>
    </>
  );
};

export default Sidebar;