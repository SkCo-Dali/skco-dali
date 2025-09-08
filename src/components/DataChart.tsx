
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
  FunnelChart, Funnel, LabelList,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'treemap' | 'funnel' | 'composed' | 'sankey';
  data: Array<{ [key: string]: string | number }>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
  title?: string;
  yKey2?: string;
  radarKeys?: string[];
  sankeyNodes?: Array<{ name: string }>;
  sankeyLinks?: Array<{ source: number; target: number; value: number }>;
}

interface DataChartProps {
  chartData: ChartData;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

// Custom content for Treemap
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
          {name}
        </text>
      ) : null}
      {depth === 1 && payload ? (
        <text x={x + width / 2} y={y + height / 2 + 21} textAnchor="middle" fill="#fff" fontSize={12}>
          {payload.value || payload.size || ''}
        </text>
      ) : null}
    </g>
  );
};

export const DataChart: React.FC<DataChartProps> = ({ chartData }) => {
  const { type, data, xKey, yKey, nameKey, valueKey, title, yKey2, radarKeys } = chartData;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey={xKey} className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey={yKey} fill="#3B82F6" />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey={xKey} className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          ) : type === 'area' ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey={xKey} className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey={yKey} stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          ) : type === 'scatter' ? (
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey={xKey} type="number" className="text-gray-600 dark:text-gray-400" />
              <YAxis dataKey={yKey} type="number" className="text-gray-600 dark:text-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Scatter name="Datos" data={data} fill="#3B82F6" />
            </ScatterChart>
          ) : type === 'radar' ? (
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={nameKey || 'subject'} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              {radarKeys?.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              )) || <Radar name="Valor" dataKey={valueKey || 'value'} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />}
            </RadarChart>
          ) : type === 'treemap' ? (
            <Treemap
              data={data}
              dataKey={valueKey || 'size'}
              stroke="#fff"
              content={<CustomizedContent colors={COLORS} />}
            />
          ) : type === 'funnel' ? (
            <FunnelChart data={data}>
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Funnel dataKey={valueKey || 'value'} data={data} isAnimationActive>
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          ) : type === 'composed' ? (
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
              <XAxis dataKey={xKey} className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey={yKey} fill="#3B82F6" />
              <Line type="monotone" dataKey={yKey2 || 'gastos'} stroke="#FF8042" strokeWidth={2} />
            </ComposedChart>
          ) : type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={valueKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill as string || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Tipo de gráfica no soportado: {type}
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
