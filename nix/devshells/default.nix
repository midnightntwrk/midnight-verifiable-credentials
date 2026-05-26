{ perSystem, pkgs, self', ... }:

{
  perSystem =
    { pkgs, ... }:
    {
      # Placeholder — full implementation tracked by TASK-7.3
      devShells.default = pkgs.mkShell { };
    };
}