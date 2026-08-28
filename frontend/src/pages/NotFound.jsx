import {Link} from 'react-router';

const NotFound = () => {
  return (
    <>
      <nav className="flex flex-row items-start sticky top-0">Freshmart</nav>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="w-[clamp(280px, 60vw, 700px)] max-h-[60vh] aspect-3/2 p-2">
          <img src="/404.png" alt="Page not found" className="w-full h-full  object-contain" />
        </div>
        <Link className="btn btn-primary" to="/">Go to Home</Link>
      </div>
    </>
  )
}

export default NotFound