{
  description = "Description for the project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devshell.url = "github:numtide/devshell";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        # To import a flake module
        # 1. Add foo to inputs
        # 2. Add foo as a parameter to the outputs function
        # 3. Add here: foo.flakeModule
        inputs.devshell.flakeModule
      ];
      systems =
        [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = { config, pkgs, ... }: {
        formatter = pkgs.alejandra;
        devshells.default = {
          env = [{
            name = "HTTP_PORT";
            value = 8080;
          }];
          commands = [
            {
              help = "start the dev mode";
              name = "start";
              command = "pnpm dev";
            }
            {
              help = "Execute tests and checks";
              name = "check";
              command = "npm run check";
            }
          ];
          packages = [ pkgs.pnpm pkgs.nodejs_22 ];
        };
      };

      flake = {
        # The usual flake attributes can be defined here, including system-
        # agnostic ones like nixosModule and system-enumerating ones, although
        # those are more easily expressed in perSystem.
      };
    };
}
