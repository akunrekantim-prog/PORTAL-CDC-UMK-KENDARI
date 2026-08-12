import { useId } from 'react';

interface ChartAreaProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}

// Area chart ala saham/investasi: garis + gradient fill + grid + titik + tooltip hover.
export default function ChartArea({ data, labels, color = '#0077C6', height = 180 }: ChartAreaProps) {
  const gid = useId().replace(/:/g, '');
  const W = 600;
  const H = height;
  const padX = 8;
  const padY = 16;
  const max = Math.max(1, ...data);
  const n = data.length;
  const stepX = n > 1 ? (W - padX * 2) / (n - 1) : 0;
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);
  const x = (i: number) => padX + i * stepX;

  const linePts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPath =
    n > 0
      ? `M ${x(0)},${H - padY} ` +
        data.map((v, i) => `L ${x(i)},${y(v)}`).join(' ') +
        ` L ${x(n - 1)},${H - padY} Z`
      : '';

  // grid horizontal (4 lines)
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => H - padY - f * (H - padY * 2));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* grid */}
        {gridLines.map((gy, i) => (
          <line key={i} x1={padX} y1={gy} x2={W - padX} y2={gy} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 4" />
        ))}

        {/* area + line */}
        {areaPath && <path d={areaPath} fill={`url(#grad-${gid})`} />}
        {data.length > 0 && (
          <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* dots */}
        {data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={v > 0 ? 3 : 2} fill="#fff" stroke={color} strokeWidth="2">
            <title>{`${labels[i]}: ${v}`}</title>
          </circle>
        ))}
      </svg>

      {/* labels */}
      <div className="flex justify-between mt-1 px-1">
        {labels.map((l, i) => (
          <span key={i} className="text-[9px] text-slate-400 truncate" style={{ width: `${100 / n}%`, textAlign: i === 0 ? 'left' : i === n - 1 ? 'right' : 'center' }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
