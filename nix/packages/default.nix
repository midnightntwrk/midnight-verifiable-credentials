{ self, inputs, ... }:

let
  midnight-did = inputs.midnight-did;
in
{
  perSystem =
    { system, pkgs, ... }:
    let
      midnight-did-pkgs = midnight-did.packages.${system};
    in
    {
      packages.npm-artifacts = pkgs.callPackage ./npm-artifacts.nix {
        inherit (midnight-did-pkgs) compact-toolchain compact-midnight midnight-circuit-params;
        src = self;
      };
    };
}
