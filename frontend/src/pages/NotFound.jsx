import {Link} from 'react-router';

const NotFound = () => {
  return (
    <>
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center">
        <div className='absolute top-8 logo'>FreshMart</div>
        <div className="w-[clamp(280px, 60vw, 700px)] max-h-[60vh] aspect-3/2 p-2">
          <img src="/404.png" alt="Page not found" className="w-full h-full  object-contain" />
        </div>
        <Link className="btn btn-primary" to="/">Go to Home</Link>
      </div>
    </>
  )
}

export default NotFound