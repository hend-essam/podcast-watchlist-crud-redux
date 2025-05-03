type PodcastCardProps = {
  id: string;
  title: string;
  host: string;
  category: string;
};

const PodcastCard = ({ id, title, host, category }: PodcastCardProps) => {
  return (
    <div key={id} className="glass p-4 rounded-[20px] border border-white/30">
      <div className="flex justify-between items-center gap-3 transition-transform duration-100 hover:scale-[1.02]">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm">Host: {host}</p>
          <p className="text-sm">Category: {category}</p>
        </div>
        <button className="px-3 py-1 cursor-pointer">
          <img src="./loupe.png" width="45px" alt="View podcast" />
        </button>
      </div>
    </div>
  );
};

export default PodcastCard;
