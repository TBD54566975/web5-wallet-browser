import { CollectionsQuery, CollectionsWrite, Dwn } from "/external/background.mjs";
import { once } from "/shared/js/Function.mjs";

export * from "/shared/js/DWN.mjs";

export { CollectionsQuery, CollectionsWrite };

export let getDWN = once(async () => Dwn.create({ }));
