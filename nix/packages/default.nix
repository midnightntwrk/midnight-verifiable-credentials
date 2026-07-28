{ self, inputs, ... }:

let
  midnight-did = inputs.midnight-did;
in
{
  perSystem =
    { system, pkgs, ... }:
    let
      midnight-did-pkgs = midnight-did.packages.${system};
      inherit (midnight-did-pkgs) compact-toolchain compact-midnight midnight-circuit-params;
      npm-artifacts = pkgs.callPackage ./npm-artifacts.nix {
        inherit compact-toolchain compact-midnight midnight-circuit-params;
        src = self;
      };
    in
    {
      packages = {
        inherit npm-artifacts;
        default = npm-artifacts;
      };

      devShells.default = pkgs.mkShell {
        packages = [
          compact-midnight
          compact-toolchain
          pkgs.bashInteractive
          pkgs.coreutils
          pkgs.curl
          pkgs.git
          pkgs.gh
          pkgs.gnused
          pkgs.jq
          pkgs.just
          pkgs.nodejs_24
          pkgs.openssl
          pkgs.pnpm_10
          pkgs.which
        ];

        COMPACT_DIRECTORY = compact-toolchain;

        shellHook = ''
          # Keep the pinned Nix toolchain and repo-local Pi ahead of user-local installs.
          export PI_REPO_NPM_PREFIX="$PWD/.pi/nix-global"
          export NPM_CONFIG_PREFIX="$PI_REPO_NPM_PREFIX"
          export PATH="$PI_REPO_NPM_PREFIX/bin:${compact-midnight}/bin:${compact-toolchain}/bin:${pkgs.nodejs_24}/bin:${pkgs.pnpm_10}/bin:$PATH"

          mkdir -p "$HOME/.cache/midnight/zk-params" "$PI_REPO_NPM_PREFIX"
          cp -Rn ${midnight-circuit-params}/. "$HOME/.cache/midnight/zk-params/" 2>/dev/null || true

          if [ "''${MVVC_SKIP_BOOTSTRAP:-0}" != "1" ] && [ "''${MVVC_SKIP_BOOTSTRAP:-}" != "true" ]; then
            just bootstrap
          else
            echo "Skipping automatic bootstrap because MVVC_SKIP_BOOTSTRAP=''${MVVC_SKIP_BOOTSTRAP:-}"
          fi

          echo "Midnight VC dev shell: node $(node --version), pnpm $(pnpm --version), compact $(compact --version 2>/dev/null || echo available), just $(just --version | awk '{print $2}')"
          echo "Run 'pi' to start Pi, or 'just targets' to list repository validation targets."
        '';
      };
    };
}
