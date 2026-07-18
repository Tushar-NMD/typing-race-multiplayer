import Navbar from '../components/Navbar';
import ResultChart from '../components/ResultChart';
import StatsCards from '../components/StatsCards';

export default function ResultsPage({ mockData, mockStats }) {
  if (!mockData || !mockStats) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Play your first game to see your results!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <ResultChart data={mockData} />
      <StatsCards stats={mockStats} />
    </div>
  );
}
