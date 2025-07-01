const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className=" retro-text text-2xl font-bold text-black">Login to your account</h2>
          <p className="text-gray-600 text-sm mt-1">
            Enter your email below to login to your account
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-black block">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-black">
                Password
              </label>
              <a
                href="#"
                className="text-sm text-gray-600 hover:underline underline-offset-4"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full border border-black bg-black text-white font-semibold py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              Login
            </button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline text-black underline-offset-4">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
