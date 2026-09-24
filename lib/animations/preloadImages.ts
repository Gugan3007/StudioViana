export interface PreloadProgress {
  completed: number;
  total: number;
  percent: number;
  url?: string;
}

export interface PreloadResult {
  loaded: string[];
  failed: string[];
  timedOut: boolean;
}

export interface PreloadOptions {
  concurrency?: number;
  timeoutMs?: number;
  createImage?: () => HTMLImageElement;
}

type AssetStatus = "failed" | "loaded" | "pending";

const decodedImageCache = new Map<string, HTMLImageElement>();

export function takePreloadedImage(url: string): HTMLImageElement | undefined {
  const image = decodedImageCache.get(url);
  decodedImageCache.delete(url);
  return image;
}

export function releasePreloadedImages(urls?: readonly string[]): void {
  if (!urls) {
    decodedImageCache.clear();
    return;
  }

  for (const url of urls) decodedImageCache.delete(url);
}

export function preloadImages(
  urls: readonly string[],
  onProgress?: (progress: PreloadProgress) => void,
  options: PreloadOptions = {},
): Promise<PreloadResult> {
  const uniqueUrls = Array.from(new Set(urls));
  const total = uniqueUrls.length;
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 6));
  const createImage = options.createImage ?? (() => new Image());
  const statuses = new Map(
    uniqueUrls.map((url) => [url, "pending" as AssetStatus]),
  );

  let completed = 0;
  let cursor = 0;
  let finished = false;
  let timedOut = false;
  const cancellations = new Set<() => void>();

  const report = (url?: string) => {
    onProgress?.({
      completed,
      total,
      percent: total === 0 ? 100 : Math.round((completed / total) * 100),
      ...(url ? { url } : {}),
    });
  };

  report();

  return new Promise<PreloadResult>((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);

      for (const cancel of cancellations) cancel();
      cancellations.clear();

      resolve({
        loaded: uniqueUrls.filter((url) => statuses.get(url) === "loaded"),
        failed: uniqueUrls.filter((url) => statuses.get(url) === "failed"),
        timedOut,
      });
    };

    if (total === 0) {
      finish();
      return;
    }

    const loadOne = (url: string) =>
      new Promise<boolean>((resolveImage) => {
        const image = createImage();
        let settled = false;

        const cleanup = () => {
          image.removeEventListener("load", handleLoad);
          image.removeEventListener("error", handleError);
          cancellations.delete(cancel);
        };

        const settle = (loaded: boolean) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolveImage(loaded);
        };

        const cancel = () => settle(false);
        const handleError = () => settle(false);
        const handleLoad = async () => {
          try {
            await image.decode?.();
            if (settled) return;
            decodedImageCache.set(url, image);
            settle(true);
          } catch {
            settle(false);
          }
        };

        cancellations.add(cancel);
        image.decoding = "async";
        image.addEventListener("load", handleLoad, { once: true });
        image.addEventListener("error", handleError, { once: true });
        image.src = url;
      });

    const worker = async () => {
      while (!finished && cursor < total) {
        const url = uniqueUrls[cursor++];
        const loaded = await loadOne(url);

        if (finished) return;

        statuses.set(url, loaded ? "loaded" : "failed");
        completed += 1;
        report(url);

        if (completed === total) finish();
      }
    };

    if (options.timeoutMs !== undefined) {
      timeoutId = setTimeout(() => {
        if (finished) return;
        timedOut = true;

        for (const url of uniqueUrls) {
          if (statuses.get(url) !== "pending") continue;
          statuses.set(url, "failed");
          completed += 1;
          report(url);
        }

        finish();
      }, options.timeoutMs);
    }

    for (let index = 0; index < Math.min(concurrency, total); index += 1) {
      void worker();
    }
  });
}
