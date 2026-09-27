import { DotLottieReact } from "@lottiefiles/dotlottie-react"

const Loader = () => {
  return (
    <div className="min-h-screen bg-base-100 flex justify-center items-center">
          <DotLottieReact src="/loading-screen.json" loop autoplay className="w-50 h-50"/>
        </div>
  )
}

export default Loader