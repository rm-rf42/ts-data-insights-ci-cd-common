#!/usr/bin/env node

const core = require("@actions/core");

const fs = require("fs");
const Path = require("path");
const _ = require("lodash");
const simpleGit = require("simple-git");
const rootGit = simpleGit();

const { spawn } = require("child_process");
const { getBuilder } = require("ts-lib-artifact-builder");
const UpdateListUtil = require("ts-lib-artifact-builder/helper/update-list");
const {
  ARTIFACT_BUCKET,
  ARTIFACT_PREFIX,
  SSH_KEY_PATH,
  COMMIT,
  GITHUB_JOB,
  GITHUB_RUN_NUMBER,
  GITHUB_RUN_ATTEMPT,
} = process.env;

// FIXME: add tests with jest or something similar?
// TODO: reorganize so these get put into src files
const getCodeMeta = _.once(async () => {
  const commit = rootGit.revparse(["--short", "HEAD"]);
  const curTags = (await repoGit.tag({ "--points-at": "HEAD" }))
    .trim()
    .split("\n");
  console.log(`Found tags that point at HEAD: ${curTags}`);
  return {
    commit,
    githubAction: true,
    tags: curTags,
    createdAt: new Date().toISOString(),
  };
});

const buildit = async () => {
  const cfg = {
    source: ".",
    namespace: NAMESPACE,
    slug: SLUG,
    version: VERSION,
    type: "task-scripts",
    pushToEcr: PUSH_TO_ECR || false,
    buildRecordMeta: await getCodeMeta(),
    shouldUpdateList: false,
    saveBuildLog: true,
    sshPrivateKeyPath: "/root/.ssh/id_rsa",
  };
  console.log("--- Build config ---");
  console.log(cfg);
};

// --- MAIN METHOD ---
const publish = async () => {
  console.time("TOTAL");
  const meta = await core.group("get code meta", getCodeMeta);
  console.info("CODE META:");
  console.info(meta);
  console.timeEnd("TOTAL");
  core.notice("all done!");
};

publish();
