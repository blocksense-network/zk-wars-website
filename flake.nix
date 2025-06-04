{
  description = "zk-wars website development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/release-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs
            pkgs.playwright-driver
            pkgs.git
            pkgs.jq
            pkgs.just
            pkgs.nodePackages.eslint
          ];
          shellHook = ''
            export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver}/share/playwright-browsers
          '';
        };
      });
}
