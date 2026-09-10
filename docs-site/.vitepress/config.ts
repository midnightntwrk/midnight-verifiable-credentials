import { defineConfig } from "vitepress";

const repoName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "midnight-verifiable-credentials";
const base =
  process.env.DOCS_BASE ?? (process.env.GITHUB_ACTIONS ? `/${repoName}/` : "/");

export default defineConfig({
  base,
  title: "Midnight Verifiable Credentials",
  description:
    "Protocol-independent VC and VP specification, conformance data, and reusable Midnight packages.",
  cleanUrls: true,
  appearance: false,
  markdown: {
    theme: "github-dark",
  },
  themeConfig: {
    siteTitle: "Midnight VC",
    search: { provider: "local" },
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Specification", link: "/spec/" },
      { text: "Conformance", link: "/conformance/" },
      { text: "Packages", link: "/packages/" },
      { text: "Development", link: "/development/" },
      {
        text: "GitHub",
        link: "https://github.com/midnightntwrk/midnight-verifiable-credentials",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Overview", link: "/guide/" },
            { text: "Quickstart", link: "/guide/quickstart" },
            { text: "Composition", link: "/guide/composition" },
          ],
        },
      ],
      "/spec/": [
        {
          text: "Core Specification",
          items: [
            { text: "Overview", link: "/spec/" },
            { text: "Terminology", link: "/spec/terminology" },
            { text: "Data Model", link: "/spec/data-model" },
            { text: "Proof Semantics", link: "/spec/proof-semantics" },
            { text: "Canonical Encoding", link: "/spec/canonical-encoding" },
            { text: "Holder Binding", link: "/spec/holder-binding" },
            {
              text: "Signer Authorization",
              link: "/spec/signer-authorization",
            },
            { text: "Status", link: "/spec/status" },
            { text: "Security", link: "/spec/security-considerations" },
            { text: "Privacy", link: "/spec/privacy-considerations" },
            { text: "Conformance", link: "/spec/conformance" },
          ],
        },
      ],
      "/conformance/": [
        {
          text: "Conformance",
          items: [{ text: "Data and Execution", link: "/conformance/" }],
        },
      ],
      "/packages/": [
        {
          text: "Packages",
          items: [
            { text: "Overview", link: "/packages/" },
            { text: "Credential Model", link: "/packages/model" },
            { text: "Credential Compact", link: "/packages/compact" },
          ],
        },
      ],
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/architecture/" },
            { text: "Core-only Decision", link: "/architecture/core-only" },
          ],
        },
      ],
      "/development/": [
        {
          text: "Development",
          items: [
            { text: "Overview", link: "/development/" },
            {
              text: "Local Development",
              link: "/development/local-development",
            },
            {
              text: "Repository Boundaries",
              link: "/development/repository-boundaries",
            },
            { text: "GitHub Pages", link: "/development/github-pages" },
            {
              text: "npmjs Publication",
              link: "/development/npmjs-publication",
            },
            {
              text: "Pi Development Loop",
              link: "/development/pi-development",
            },
            { text: "Security", link: "/development/security" },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/midnightntwrk/midnight-verifiable-credentials",
      },
    ],
    footer: {
      message: "Midnight Verifiable Credentials core",
      copyright: "Apache-2.0",
    },
  },
});
