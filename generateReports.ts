/// <reference types="./types/lighthouse" />

import { execFileSync } from "child_process";
import * as cl from "chrome-launcher";
import fs from "fs";
import lighthouse from "lighthouse";
import type { CliFlags } from "lighthouse/types/externs";

const generateReport = async (
  { url, name }: { url: string; name: string },
  dateStamp: string
) => {
  const chrome = await cl.launch({ chromeFlags: ["--headless"] });
  const options: Partial<CliFlags> = {
    logLevel: "error",
    output: ["html"],
    onlyCategories: ["performance"],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(url, options);

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report.toString();
  fs.writeFileSync("./reports/" + name + " " + dateStamp + ".html", reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log("Report is done for", runnerResult.lhr.finalUrl);
  if (runnerResult.lhr.categories.performance.score) {
    console.log(
      "Performance score was",
      runnerResult.lhr.categories.performance.score * 100
    );
  }

  await chrome.kill();
};

export const generateReports = async () => {
  const dateStamp = new Date().toString();
  console.log("Generating Reports");

  const pages = [
    {
      url: "https://demo.airbyte.io/workspaces/b734c3d7-ece6-47e0-8f07-c4be707fbcfa/connections",
      name: "Connection List Page",
    },
    {
      url: "https://demo.airbyte.io/workspaces/b734c3d7-ece6-47e0-8f07-c4be707fbcfa/source",
      name: "Sources List Page",
    },
    {
      url: "https://demo.airbyte.io/workspaces/b734c3d7-ece6-47e0-8f07-c4be707fbcfa/destination",
      name: "Destinations List Page",
    },
  ];
  for (const page of pages) {
    await generateReport(page, dateStamp);
  }

  execFileSync("git", ["add", "."]);
  execFileSync("git", ["commit", "-m", dateStamp]);
  execFileSync("git", ["push"]);

  console.log("Reports Generated");
};
