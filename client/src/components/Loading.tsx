const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/15 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-t-[#016630] border-b-[#db9127] border-l-transparent border-r-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full animate-bounce bg-[#016630]"></div>
          <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:.1s] bg-[#db9127]"></div>
          <div className="w-4 h-4 rounded-full animate-bounce [animation-delay:.2s] bg-[#016630]"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
