import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router";

export default function CustomerSignIn() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // DEMO LOGIN
    // Backend authentication will be added later.
    // Any non-empty email/password is accepted.
    // -------------------------------------------------------

    if (!email || !password) {
      return;
    }

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">

      {/* =====================================================
          MAIN LOGIN AREA
      ===================================================== */}

      <main className="flex min-h-screen items-center justify-center px-5 py-10">

        <div
          className="
            grid
            w-full
            max-w-5xl
            overflow-hidden
            rounded-box
            border
            border-theme
            bg-base-100
            shadow-xl
            lg:grid-cols-2
          "
        >

          {/* =================================================
              LEFT BRAND PANEL
          ================================================= */}

          <div
            className="
              hidden
              bg-primary
              p-10
              text-primary-content
              lg:flex
              lg:flex-col
              lg:justify-between
            "
          >

            <div>

              {/* LOGO */}

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-primary-content/15
                  "
                >

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 30 30"
                    fill="none"
                  >

                    <path
                      d="
                        M15 27
                        C15 27 5 21.8 5 12.8
                        C5 7.2 9.4 3.5 15 3.5
                        C20.6 3.5 25 7.2 25 12.8
                        C25 21.8 15 27 15 27Z
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M15 27V10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="
                        M15 14
                        C15 14 10.8 13 10.8 9
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="
                        M15 17
                        C15 17 19.7 16 19.7 11
                      "
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                  </svg>

                </div>


                <div>

                  <div className="flex-1">
        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight text-accent-soft"
        >
          Fresh<span className="text-base-content">Mart</span>
        </a>
      </div>

                  <div className="text-xs opacity-75">
                    Fresh from farm to home
                  </div>

                </div>

              </div>


              {/* MESSAGE */}

              <div className="mt-20 max-w-md">

                <div
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    opacity-70
                  "
                >
                  Welcome back
                </div>


                <h1
                  className="
                    mt-3
                    text-4xl
                    font-extrabold
                    leading-tight
                  "
                >
                  Fresh food,
                  <br />
                  closer to you.
                </h1>


                <p
                  className="
                    mt-5
                    text-sm
                    leading-7
                    opacity-80
                  "
                >
                  Sign in to discover fresh products from
                  local farmers and have them delivered to
                  your doorstep.
                </p>

              </div>

            </div>


            {/* BOTTOM */}

            <div className="text-xs opacity-60">
              © 2026 FramFresh
            </div>

          </div>


          {/* =================================================
              RIGHT LOGIN PANEL
          ================================================= */}

          <div className="p-6 sm:p-10">

            {/* PROFILE SWITCHER */}

            


            {/* HEADING */}

            <div>

              <h2
                className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                "
              >
                Sign in
              </h2>


              <p
                className="
                  mt-2
                  text-sm
                  text-muted
                "
              >
                Sign in to your FramFresh customer account.
              </p>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="customer-email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                  "
                >
                  Email address
                </label>


                <div className="relative">

                  <FiMail
                    size={18}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-muted-light
                    "
                  />


                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="
                      h-12
                      w-full
                      rounded-box
                      border
                      border-theme
                      bg-base-200
                      pl-11
                      pr-4
                      text-sm
                      outline-none
                      transition
                      placeholder:text-muted-light
                      focus:border-primary
                      focus:bg-base-100
                    "
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex justify-between">

                  <label
                    htmlFor="customer-password"
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Password
                  </label>


                  <button
                    type="button"
                    className="
                      text-xs
                      font-bold
                      text-primary
                      hover:text-primary-hover
                    "
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <FiLock
                    size={18}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-muted-light
                    "
                  />


                  <input
                    id="customer-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    className="
                      h-12
                      w-full
                      rounded-box
                      border
                      border-theme
                      bg-base-200
                      pl-11
                      pr-11
                      text-sm
                      outline-none
                      transition
                      placeholder:text-muted-light
                      focus:border-primary
                      focus:bg-base-100
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-muted-light
                      hover:text-primary
                    "
                  >

                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}

                  </button>

                </div>

              </div>


              {/* DEMO NOTICE */}

              <div
                className="
                  rounded-box
                  border
                  border-theme
                  bg-primary-soft
                  px-4
                  py-3
                  text-xs
                  leading-5
                  text-primary
                "
              >
                Demo mode: enter any email and password
                to continue.
              </div>


              {/* SIGN IN */}

              <button
                type="submit"
                className="
                  btn
                  h-12
                  w-full
                  border-0
                  bg-primary
                  text-primary-content
                  hover:bg-primary-hover
                "
              >

                Sign in

                <FiArrowRight size={17} />

              </button>

            </form>


            {/* REGISTER */}

            <div
              className="
                mt-7
                text-center
                text-sm
                text-muted
              "
            >

              Don't have an account?{" "}

              <button
                type="button"
                className="
                  font-bold
                  text-primary
                  hover:text-primary-hover
                "
              >
                Create account
              </button>

            </div>


            {/* MOBILE BRAND */}

            <div
              className="
                mt-10
                text-center
                text-xs
                text-muted-light
                lg:hidden
              "
            >
              FramFresh · Fresh from farm to home
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}