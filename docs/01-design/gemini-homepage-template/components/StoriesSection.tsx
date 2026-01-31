
import React from 'react';

const StoriesSection: React.FC = () => {
  const stories = [
    {
      category: "Article",
      title: "How HomeCareERP is leading the digital shift in Colombian IPS agencies.",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
    },
    {
      category: "Case Study",
      title: "Case Study: Reducing clinical risk in remote elderly patient monitoring.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800",
    },
    {
      category: "Podcast",
      title: "The future of AI-driven compliance in South American healthcare markets.",
      image: "https://images.unsplash.com/photo-1478479405421-ce83c92fb3ba?auto=format&fit=crop&q=80&w=800",
    },
    {
      category: "Article",
      title: "Optimizing nurse workflows with native offline clinical documentation.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-display font-black tracking-tight text-brand-navy">Stories and inspiration</h2>
          <div className="flex gap-2">
            <button className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, idx) => (
            <div key={idx} className="group cursor-pointer flex flex-col h-full bg-slate-50 overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-700">
                  {story.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow border-b-4 border-transparent group-hover:border-brand-blue transition-all">
                <h3 className="text-sm font-bold text-brand-navy leading-snug mb-4 group-hover:text-brand-blue transition-colors">
                  {story.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
