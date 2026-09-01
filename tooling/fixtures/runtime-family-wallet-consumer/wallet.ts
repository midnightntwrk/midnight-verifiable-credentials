import {
  resolveRuntimeCredentialFamily,
  type CredentialFamilyReference,
  type RuntimeCredentialFamilyRegistryV1,
  type RuntimeCredentialFamilyTrustVerifier,
} from "@midnight-ntwrk/credential-model";
import {
  HolderAgent,
  isInjectedCredentialFamilyAdapterFor,
  type InjectedCredentialFamilyAdapter,
} from "@midnight-ntwrk/credential-exchange";

/** Generic wallet module: it has no dependency on a concrete credential family. */
export const createRuntimeHolder = async (
  reference: CredentialFamilyReference,
  registries: readonly RuntimeCredentialFamilyRegistryV1[],
  trustVerifier: RuntimeCredentialFamilyTrustVerifier,
): Promise<{
  readonly holder: HolderAgent;
  readonly adapter: InjectedCredentialFamilyAdapter;
}> => {
  const resolution = await resolveRuntimeCredentialFamily({
    reference,
    registries,
    trustVerifier,
    validateSurface: (
      value,
    ): value is InjectedCredentialFamilyAdapter =>
      isInjectedCredentialFamilyAdapterFor(reference, value),
  });
  if (resolution.status === "unsupported") {
    throw new Error(`${resolution.code}: ${resolution.diagnostic}`);
  }
  return {
    holder: new HolderAgent(resolution.surface),
    adapter: resolution.surface,
  };
};
