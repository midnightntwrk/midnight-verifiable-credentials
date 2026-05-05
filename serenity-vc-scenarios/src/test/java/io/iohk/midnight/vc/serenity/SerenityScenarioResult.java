package io.iohk.midnight.vc.serenity;

public record SerenityScenarioResult(
    String scenario,
    boolean approved,
    String claimDecision,
    long issuedCredentialCount,
    long verifiedPresentationCount,
    long consumedAccessCapabilityCount,
    String lastVerifiedCredentialRoot,
    String expectedCredentialRoot,
    String lastVerifiedRequestChallenge) {}
