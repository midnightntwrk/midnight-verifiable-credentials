{ self, ... }:

{
  perSystem =
    { pkgs, inputs', ... }:
    let
      compact-midnight = inputs'.flake-collection.packages.compact-midnight;
      compact-toolchain = inputs'.flake-collection.packages.compact-toolchain;
      midnight-circuit-params = pkgs.callPackage ./midnight-circuit-params.nix { };
      npm-artifacts = pkgs.callPackage ./npm-artifacts.nix {
        inherit compact-toolchain compact-midnight midnight-circuit-params;
        src = self;
      };
    in
    {
      packages = {
        inherit
          npm-artifacts
          compact-midnight
          compact-toolchain
          midnight-circuit-params
          ;
        default = npm-artifacts;
      };

      devShells.default = pkgs.mkShell {
        packages = [
          compact-midnight
          compact-toolchain
          pkgs.bashInteractive
          pkgs.coreutils
          pkgs.git
          pkgs.gh
          pkgs.just
          pkgs.nodejs_24
          pkgs.pnpm_10
        ];

        COMPACT_DIRECTORY = compact-toolchain;

        shellHook = ''
          # Keep the pinned Nix toolchain ahead of user-local installs.
          export PATH="${compact-midnight}/bin:${compact-toolchain}/bin:${pkgs.nodejs_24}/bin:${pkgs.pnpm_10}/bin:$PATH"

          mkdir -p "$HOME/.cache/midnight/zk-params"
          cp -Rn ${midnight-circuit-params}/. "$HOME/.cache/midnight/zk-params/" 2>/dev/null || true

          if [ "''${MVVC_SKIP_BOOTSTRAP:-0}" != "1" ] && [ "''${MVVC_SKIP_BOOTSTRAP:-}" != "true" ]; then
            just bootstrap
          else
            echo "Skipping automatic bootstrap because MVVC_SKIP_BOOTSTRAP=''${MVVC_SKIP_BOOTSTRAP:-}"
          fi

          echo "Midnight VC dev shell: node $(node --version), pnpm $(pnpm --version), compact $(compact --version 2>/dev/null || echo available), just $(just --version | awk '{print $2}')"
          echo "Run 'just targets' to list repository validation targets."
        '';
      };
    };
}
