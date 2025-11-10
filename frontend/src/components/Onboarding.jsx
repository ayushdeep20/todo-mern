function Onboarding({ onStart }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Big blue panel */}
        <div className="rounded-2xl overflow-hidden shadow border">
          <div className="bg-[#4669f0] h-72 relative">
            {/* cute decorative shapes */}
            <div className="absolute left-6 top-16 w-16 h-16 opacity-20 border-4 border-white rounded-xl rotate-12"></div>
            <div className="absolute right-6 bottom-10 w-20 h-20 opacity-15 border-4 border-white rounded-full"></div>
          </div>

          <div className="bg-white p-5">
            <h1 className="text-lg font-semibold">Manage What To Do</h1>
            <p className="mt-1 text-sm text-gray-500">
              The best way to manage what you have to do. Don’t forget your plans.
            </p>

            <button
              onClick={onStart}
              className="mt-5 w-full bg-[#4669f0] text-white py-3 rounded-lg font-medium active:scale-95 transition"
            >
              Get Started
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Onboarding;
