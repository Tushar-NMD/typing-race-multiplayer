import ReactECharts from 'echarts-for-react';

export default function ResultChart({ data, className }) {
  if (!data || !data.time || !data.wpm || data.time.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>;
  }

  const options = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'line',
        lineStyle: {
          color: '#475569',
          width: 1,
          type: 'dashed'
        }
      },
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { 
        color: '#f1f5f9',
        fontFamily: 'monospace'
      },
      padding: [8, 12]
    },
    grid: {
      left: '1%',
      right: '2%',
      bottom: '2%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.time,
      axisLabel: {
        color: '#64748b',
        fontFamily: 'monospace',
        margin: 12
      },
      axisLine: {
        lineStyle: { color: '#334155' }
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'wpm',
      nameTextStyle: {
        color: '#64748b',
        align: 'right',
        padding: [0, 8, 0, 0]
      },
      axisLabel: { 
        color: '#64748b',
        fontFamily: 'monospace'
      },
      splitLine: {
        lineStyle: {
          color: '#1e293b',
          type: 'solid'
        }
      }
    },
    series: [
      {
        name: data.series1Name || 'WPM',
        type: 'line',
        smooth: 0.3,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: true,
        itemStyle: { color: '#facc15' },
        lineStyle: { width: 3 },
        data: data.wpm
      },
      {
        name: data.series2Name || 'Raw',
        type: 'line',
        smooth: 0.3,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: true,
        itemStyle: { color: '#6b7280' },
        lineStyle: { width: 3 },
        data: data.raw
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };

  return (
    <div className={`w-full ${className || 'h-64 md:h-80 lg:h-96'}`}>
      <ReactECharts
        option={options}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
