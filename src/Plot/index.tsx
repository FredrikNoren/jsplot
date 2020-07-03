import * as React from 'react';
import './index.css';
import lodash from 'lodash';
import { stringToHSL, arrayReplaceIndex, clamp, interpolate } from '../Util';

type PlotWindow = [number, number];
export interface PlotLine {
  data: number[];
  label: string;
  color?: string;
  yMin?: number;
  yMax?: number;
}
function windowedData(data: number[], window: PlotWindow | undefined) {
  if (window) {
    const start = Math.floor(window[0] * data.length);
    const end = Math.ceil(window[1] * data.length);
    return { data: data.slice(start, end), start, end };
  } {
    return { data, start: 0, end: data.length };
  }
}
function drawPlotLine(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, line: PlotLine, window: PlotWindow | undefined) {
  let data = windowedData(line.data, window).data;
  if (data.length === 0) {
    return;
  }
  const dataMin = line.yMin ?? data.reduce((p, x) => Math.min(p, x));
  const dataMax = line.yMax ?? data.reduce((p, x) => Math.max(p, x));
  const dataRange = dataMax - dataMin;
  const canvasCoord = (i: number, value: number): [number, number] => {
    const x = canvas.width * i / (data.length - 1);
    const y = canvas.height - canvas.height * (value - dataMin) / dataRange;
    return [x, y];
  }
  ctx.beginPath();
  ctx.moveTo(...canvasCoord(0, data[0]));
  ctx.strokeStyle = line.color ?? stringToHSL(line.label, 0.5, 0.5);
  for (let i=1; i < data.length; i++) {
    ctx.lineTo(...canvasCoord(i, data[i]));
  }
  ctx.stroke();
}

export interface PlotProps {
  title?: string;
  lines: PlotLine[];
}
export function Plot({ lines, title }: PlotProps) {
  const dataCanvas = React.createRef<HTMLCanvasElement>();
  const uiCanvas = React.createRef<HTMLCanvasElement>();
  const [windowStack, setWindowStack] = React.useState<PlotWindow[]>([]);
  const [hidden, setHidden] = React.useState<boolean[]>([]);
  const [hover, setHover] = React.useState<number>();
  const setHoverThrottled = React.useCallback(lodash.throttle(setHover, 16), [setHover]);
  const [windowPreview, setWindowPreview] = React.useState<PlotWindow>();
  React.useEffect(() => {
    if (dataCanvas.current) {
      const ctx = dataCanvas.current.getContext('2d')!;
      ctx.clearRect(0, 0, dataCanvas.current.width, dataCanvas.current.height);
      for (let i=0; i < lines.length; i++) {
        if (hidden[i] !== true) {
          drawPlotLine(dataCanvas.current, ctx, lines[i], lodash.last(windowStack));
        }
      }
    }
  }, [lines, windowStack, hidden]);
  React.useEffect(() => {
    if (uiCanvas.current) {
      const ctx = uiCanvas.current.getContext('2d')!;
      ctx.clearRect(0, 0, uiCanvas.current.width, uiCanvas.current.height);
      if (hover !== undefined) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.moveTo(hover * uiCanvas.current.width, 0);
        ctx.lineTo(hover * uiCanvas.current.width, uiCanvas.current.height);
        ctx.stroke();
      }
      if (windowPreview) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.fillRect(windowPreview[0] * uiCanvas.current.width, 0,
          (windowPreview[1] - windowPreview[0]) * uiCanvas.current.width, uiCanvas.current.height);
      }
    }
  }, [hover, windowPreview]);
  const canvasSize = { width: 600, height: 250 };
  return <div className="Plot">
    {title && <b>{title}</b>}
    <div className="PlotCanvases">
    <canvas className="PlotDataCanvas" width={canvasSize.width} height={canvasSize.height} ref={dataCanvas} />
    <canvas
      className="PlotUICanvas"
      width={canvasSize.width}
      height={canvasSize.height}
      ref={uiCanvas}
      onMouseMove={e => {
        const c = e.target as HTMLCanvasElement;
        const b = c.getBoundingClientRect();
        setHoverThrottled((e.clientX - b.left) / b.width);
      }}
      onMouseOut={e => setHoverThrottled(undefined)}
      onMouseDown={e => {
        const c = e.target as HTMLCanvasElement;
        const b = c.getBoundingClientRect();
        const windowStart = (e.clientX - b.left) / b.width;
        setWindowPreview([windowStart, windowStart]);
        const getWindow = (e: MouseEvent): PlotWindow => {
          const windowEnd = clamp((e.clientX - b.left) / b.width, 0, 1);
          if (windowEnd < windowStart) {
            return [windowEnd, windowStart];
          } else {
            return [windowStart, windowEnd];
          }
        }
        const handleMouseMove = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setWindowPreview(getWindow(e));
        }
        const handleMouseUp = (e: MouseEvent) => {
          let window = getWindow(e);
          const lastWindow = lodash.last(windowStack);
          if (lastWindow) {
            setWindowStack([...windowStack, [
              interpolate(window[0], 0, 1, lastWindow[0], lastWindow[1]),
              interpolate(window[1], 0, 1, lastWindow[0], lastWindow[1])
            ]]);
          } else {
            setWindowStack([window]);
          }
          setWindowPreview(undefined);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('mousemove', handleMouseMove);
        }
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
      }}
      />
      {windowStack.length > 0 && <div className="PlotZoomOut"
          onClick={() => setWindowStack(windowStack.slice(0, windowStack.length - 1))}>
        Zoom out
      </div>}
    </div>
    {lines.map((line, i) => {
      const data = windowedData(line.data, lodash.last(windowStack));
      return <div
        key={i}
        className="PlotLegendItem"
        style={{
          color: line.color ?? stringToHSL(line.label, 0.5, 0.5),
          opacity: hidden[i] ? 0.5 : undefined
        }}
        onClick={() => setHidden(arrayReplaceIndex(hidden, i, !hidden[i]))}
        >
        {line.label}
        &nbsp;{hover !== undefined ?
          <span>{Math.round(hover * data.data.length)}: {data.data[Math.round(hover * data.data.length)]}</span>
          : <span>[{data.start}:{data.data[0]}, ..., {data.end - 1}:{lodash.last(data.data)}]</span>}
      </div>
    })}
  </div>
}
