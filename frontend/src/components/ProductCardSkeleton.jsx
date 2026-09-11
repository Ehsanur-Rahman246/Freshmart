const ProductCardSkeleton = () => {
  return (
    <div className="w-[calc((100vw-28px)/2)] max-w-50 h-70 flex flex-col bg-base-300 rounded-[10px] shadow-md p-1 overflow-hidden">
      <div className="skeleton w-full h-30 rounded-tl-md rounded-tr-md" />
      <div className="skeleton h-5 w-3/4 mt-2 ml-1" />
      <div className="skeleton h-3 w-1/2 mt-2 ml-1" />
      <div className="skeleton h-6 w-2/3 mt-2.5 ml-1" />
      <div className="flex gap-2 mt-auto">
        <div className="skeleton h-9 flex-1 rounded-field" />
        <div className="skeleton h-9 w-9 rounded-field" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;