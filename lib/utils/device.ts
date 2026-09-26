export interface NavigatorSignals {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function isLowPowerDevice(navigatorLike: NavigatorSignals) {
  return Boolean(
    navigatorLike.connection?.saveData ||
    (typeof navigatorLike.hardwareConcurrency === "number" &&
      navigatorLike.hardwareConcurrency <= 4) ||
    (typeof navigatorLike.deviceMemory === "number" &&
      navigatorLike.deviceMemory <= 4),
  );
}

export function getNavigatorSignals(
  navigatorLike: Navigator = navigator,
): NavigatorSignals {
  const enhanced = navigatorLike as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return {
    connection: enhanced.connection,
    deviceMemory: enhanced.deviceMemory,
    hardwareConcurrency: enhanced.hardwareConcurrency,
  };
}
