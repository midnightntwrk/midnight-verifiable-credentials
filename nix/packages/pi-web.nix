{
  lib,
  buildNpmPackage,
  fetchurl,
  makeWrapper,
  nodejs_24,
}:

buildNpmPackage {
  pname = "pi-web";
  version = "1.202607.3";

  src = fetchurl {
    url = "https://registry.npmjs.org/@jmfederico/pi-web/-/pi-web-1.202607.3.tgz";
    hash = "sha256-rnGt0CmVuB9X1E4N9+OJL6wD45yClIVY7jbQ70CXQQY=";
  };
  sourceRoot = "package";

  postPatch = ''
    cp ${./pi-web-package.json} package.json
    cp ${./pi-web-package-lock.json} package-lock.json
  '';

  npmDepsFetcherVersion = 2;
  npmDepsHash = "sha256-Zg6Z6blt6GnZldc6p3cxSwFmu38eNGA5TIg6yzf6AKA=";
  npmInstallFlags = [ "--omit=dev" ];
  dontNpmBuild = true;

  nativeBuildInputs = [ makeWrapper ];
  propagatedBuildInputs = [ nodejs_24 ];

  installPhase = ''
    runHook preInstall

    install -d "$out/lib/node_modules/@jmfederico/pi-web" "$out/bin"
    cp -a . "$out/lib/node_modules/@jmfederico/pi-web/"

    makeWrapper "${nodejs_24}/bin/node" "$out/bin/pi-web" \
      --add-flags "$out/lib/node_modules/@jmfederico/pi-web/dist/cli.js"
    makeWrapper "${nodejs_24}/bin/node" "$out/bin/pi-web-server" \
      --add-flags "$out/lib/node_modules/@jmfederico/pi-web/dist/server/index.js"
    makeWrapper "${nodejs_24}/bin/node" "$out/bin/pi-web-sessiond" \
      --add-flags "$out/lib/node_modules/@jmfederico/pi-web/dist/server/sessiond.js"
    makeWrapper "${nodejs_24}/bin/node" "$out/bin/pi" \
      --add-flags "$out/lib/node_modules/@jmfederico/pi-web/node_modules/@earendil-works/pi-coding-agent/dist/cli.js"
    ln -s "${nodejs_24}/bin/node" "$out/bin/node"
    ln -s "${nodejs_24}/bin/npm" "$out/bin/npm"

    find "$out/lib/node_modules/@jmfederico/pi-web/node_modules/node-pty/prebuilds" \
      -type f -name spawn-helper -exec chmod +x {} + 2>/dev/null || true

    runHook postInstall
  '';

  meta = {
    description = "Browser UI and persistent session daemon for Pi Coding Agent";
    homepage = "https://pi-web.dev/";
    license = lib.licenses.mit;
    mainProgram = "pi-web";
  };
}
