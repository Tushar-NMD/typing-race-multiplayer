export default function StatsCards({ stats }) {
  const {
    wpm = 0,
    accuracy = 0,
    raw = 0,
    consistency = 0,
    characters = { correct: 0, incorrect: 0, extra: 0, missed: 0 },
    time = 0,
    language = 'english',
    difficulty = 'normal',
    testType = 'time'
  } = stats || {};

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-between items-start mt-8 p-4">
      
      {/* Primary Stats */}
      <div className="flex gap-12">
        <div className="flex flex-col">
          <span className="text-slate-500 text-sm md:text-xl font-mono mb-1">wpm</span>
          <span className="text-5xl md:text-7xl font-bold text-yellow-400">{wpm}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-slate-500 text-sm md:text-xl font-mono mb-1">acc</span>
          <span className="text-5xl md:text-7xl font-bold text-indigo-400">{accuracy}%</span>
        </div>
      </div>

      {/* Secondary Stats Group */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 flex-1 w-full mt-4 md:mt-0 md:ml-12">
        
        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-mono mb-1">test type</span>
          <span className="text-lg font-bold text-slate-300">{testType}</span>
          <span className="text-sm font-bold text-slate-400">{language}</span>
          <span className="text-sm font-bold text-slate-400">{difficulty}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-mono mb-1">raw</span>
          <span className="text-2xl font-bold text-slate-300">{raw}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-mono mb-1">characters</span>
          <span className="text-2xl font-bold text-slate-300">
            {characters.correct}/{characters.incorrect}/{characters.extra}/{characters.missed}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-mono mb-1">consistency</span>
          <span className="text-2xl font-bold text-slate-300">{consistency}%</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-slate-500 text-xs font-mono mb-1">time</span>
          <span className="text-2xl font-bold text-slate-300">{time}s</span>
        </div>
        
      </div>
    </div>
  );
}
