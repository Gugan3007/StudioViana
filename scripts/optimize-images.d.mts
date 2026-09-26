export interface OptimizerOptions {
  dryRun: boolean;
  input: string;
  output: string;
  overwrite: boolean;
}

export function derivativeName(
  filename: string,
  width: number,
  format: "avif" | "webp",
): string;
export function optimizeImages(options: OptimizerOptions): Promise<
  Array<{
    destination: string;
    file: string;
    format: "avif" | "webp";
    width: number;
  }>
>;
export function parseOptimizerArgs(args: string[]): OptimizerOptions;
export function planResponsiveWidths(
  sourceWidth: number,
  candidates?: number[],
): number[];
