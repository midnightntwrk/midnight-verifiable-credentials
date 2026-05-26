{ self, ... }:

{
  perSystem =
    { pkgs, ... }:
    {
      # Placeholder — full implementation tracked by TASK-7.1
      packages.npm-artifacts = pkgs.runCommand "npm-artifacts-placeholder" { } "mkdir $out";
    };
}