import { useRef, useEffect } from "react";

// @ts-ignore
import * as Plot from "@observablehq/plot";

export const PlotFigure = ({ options }: { options: any }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("rerender");
    const plot = Plot.plot(options);
    if (ref.current) {
      if (ref.current.children[0]) {
        ref.current.children[0].remove();
      }
      ref.current.appendChild(plot);
    }
  }, [ref, options]);

  return <div ref={ref} />;
};

export { Plot };
