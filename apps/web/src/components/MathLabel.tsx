import katex from "katex";
import { useMemo } from "react";

interface MathLabelProps {
  latex: string;
  label: string;
  block?: boolean;
}

export function MathLabel({ latex, label, block = false }: MathLabelProps) {
  const html = useMemo(() => {
    return katex.renderToString(latex || label, {
      displayMode: block,
      output: "html",
      throwOnError: false,
    });
  }, [block, label, latex]);

  return (
    <span
      className={`math-label ${block ? "is-block" : ""}`}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

