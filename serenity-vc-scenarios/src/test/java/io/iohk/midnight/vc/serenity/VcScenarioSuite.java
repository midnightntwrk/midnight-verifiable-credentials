package io.iohk.midnight.vc.serenity;

import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;
import org.junit.runner.RunWith;

@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "io.iohk.midnight.vc.serenity",
    plugin = {"pretty"})
public class VcScenarioSuite {}
