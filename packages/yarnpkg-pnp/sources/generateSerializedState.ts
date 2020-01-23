import {LocationBlacklistData, LocationLengthData, PackageRegistryData, LocationDiscardData} from './types';
import {PackageStoreData, PnpSettings, SerializedState}                                      from './types';

// Keep this function is sync with its implementation in:
// @yarnpkg/core/sources/miscUtils.ts
export function sortMap<T>(values: Iterable<T>, mappers: ((value: T) => string) | Array<(value: T) => string>) {
  const asArray = Array.from(values);

  if (!Array.isArray(mappers))
    mappers = [mappers];

  const stringified: Array<Array<string>> = [];

  for (const mapper of mappers)
    stringified.push(asArray.map(value => mapper(value)));

  const indices = asArray.map((_, index) => index);

  indices.sort((a, b) => {
    for (const layer of stringified) {
      const comparison = layer[a] < layer[b] ? -1 : layer[a] > layer[b] ? +1 : 0;

      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  });

  return indices.map(index => {
    return asArray[index];
  });
}

function generateFallbackExclusionList(settings: PnpSettings): Array<[string, Array<string>]> {
  const fallbackExclusionList = new Map();

  const sortedData = sortMap(settings.fallbackExclusionList || [], [
    ({name, reference}) => name,
    ({name, reference}) => reference,
  ]);

  for (const {name, reference} of sortedData) {
    let references = fallbackExclusionList.get(name);

    if (typeof references === `undefined`)
      fallbackExclusionList.set(name, references = new Set());

    references.add(reference);
  }

  return Array.from(fallbackExclusionList).map(([name, references]) => {
    return [name, Array.from(references)] as [string, Array<string>];
  });
}

function generatePackageRegistryData(settings: PnpSettings): PackageRegistryData {
  const packageRegistryData: PackageRegistryData = [];

  for (const [packageName, packageStore] of sortMap(settings.packageRegistry, ([packageName]) => packageName === null ? `0` : `1${packageName}`)) {
    const packageStoreData: PackageStoreData = [];
    packageRegistryData.push([packageName, packageStoreData]);

    for (const [packageReference, {packageLocation, packageDependencies, packagePeers, linkType}] of sortMap(packageStore, ([packageReference]) => packageReference === null ? `0` : `1${packageReference}`)) {
      const normalizedDependencies: Array<[string, string | [string, string] | null]> = [];

      if (packageName !== null && packageReference !== null && !packageDependencies.has(packageName))
        normalizedDependencies.push([packageName, packageReference]);

      for (const [dependencyName, dependencyReference] of sortMap(packageDependencies.entries(), ([dependencyName]) => dependencyName))
        normalizedDependencies.push([dependencyName, dependencyReference]);

      const normalizedPeers = packagePeers && packagePeers.size > 0
        ? Array.from(packagePeers)
        : undefined;

      packageStoreData.push([packageReference, {
        packageLocation,
        packageDependencies: normalizedDependencies,
        packagePeers: normalizedPeers,
        linkType,
      }]);
    }
  }

  return packageRegistryData;
}

function generateLocationBlacklistData(settings: PnpSettings): LocationBlacklistData {
  return sortMap(settings.blacklistedLocations || [], location => location);
}

function generateLocationDiscardData(settings: PnpSettings): LocationDiscardData {
  return sortMap(settings.discardedLocations || [], location => location);
}

function generateLocationLengthData(settings: PnpSettings): LocationLengthData {
  const lengths = new Set<number>();

  for (const packageInformationStore of settings.packageRegistry.values())
    for (const {packageLocation} of packageInformationStore.values())
      if (packageLocation !== null)
        lengths.add(packageLocation.length);

  return Array.from(lengths).sort((a, b) => b - a);
}

export function generateSerializedState(settings: PnpSettings): SerializedState {
  return {
    __info: [
      `This file is automatically generated. Do not touch it, or risk`,
      `your modifications being lost. We also recommend you not to read`,
      `it either without using the @yarnpkg/pnp package, as the data layout`,
      `is entirely unspecified and WILL change from a version to another.`,
    ],

    dependencyTreeRoots: settings.dependencyTreeRoots,
    enableTopLevelFallback: settings.enableTopLevelFallback || false,
    ignorePatternData: settings.ignorePattern || null,

    fallbackExclusionList: generateFallbackExclusionList(settings),
    locationBlacklistData: generateLocationBlacklistData(settings),
    locationDiscardData: generateLocationDiscardData(settings),
    locationLengthData: generateLocationLengthData(settings),
    packageRegistryData: generatePackageRegistryData(settings),
  };
}
