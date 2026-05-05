package io.iohk.midnight.vc.serenity;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public final class ScenarioBridge {
  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  public SerenityScenarioResult runNodeScenario(String relativeScriptPath)
      throws IOException, InterruptedException {
    Path repoRoot = Path.of(System.getProperty("vc.repo.root")).toAbsolutePath().normalize();
    Path script = repoRoot.resolve(relativeScriptPath);

    Process process =
        new ProcessBuilder("node", script.toString())
            .directory(repoRoot.toFile())
            .redirectErrorStream(true)
            .start();

    String output = new String(process.getInputStream().readAllBytes());
    int exitCode = process.waitFor();
    if (exitCode != 0) {
      throw new IllegalStateException(
          "Scenario bridge failed (exit " + exitCode + "):\n" + output);
    }

    return OBJECT_MAPPER.readValue(output, SerenityScenarioResult.class);
  }

  public void assertBuildPrerequisitesPresent() {
    Path repoRoot = Path.of(System.getProperty("vc.repo.root")).toAbsolutePath().normalize();
    Map<String, String> requiredArtifacts = Map.of(
        "credentials-birth dist", "credentials-birth/dist/testing.js",
        "credentials-demo-contract dist", "credentials-demo-contract/dist/testing.js");

    for (Map.Entry<String, String> entry : requiredArtifacts.entrySet()) {
      if (!Files.exists(repoRoot.resolve(entry.getValue()))) {
        throw new IllegalStateException(
            entry.getKey()
                + " is missing. Run `npm run test:serenity:smoke` from the repo root so the build prerequisites are prepared first.");
      }
    }
  }
}
