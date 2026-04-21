import { writeFileSync } from "fs";
import { execSync } from "child_process";
import moment from "moment";

const path = "./data.json";

const run = () => {
  const startDate = moment("2026-01-01");
  const endDate = moment("2026-04-21");

  let totalCommits = 0;
  const current = startDate.clone();

  while (current.isSameOrBefore(endDate)) {
    const commits = 15 + Math.floor(Math.random() * 6); // 15-20
    const dateStr = current.format();

    console.log(`${current.format("YYYY-MM-DD")} → ${commits} commit(s)`);

    for (let i = 0; i < commits; i++) {
      writeFileSync(path, JSON.stringify({ date: dateStr, commit: i + 1 }));
      execSync("git add .", { cwd: process.cwd() });
      execSync(`git commit -m "${dateStr}" --date="${dateStr}"`, { cwd: process.cwd() });
    }

    totalCommits += commits;
    current.add(1, "d");
  }

  console.log(`\nDone! Total commits: ${totalCommits}`);
  console.log("Pushing to remote...");
  execSync("git push", { cwd: process.cwd() });
  console.log("Pushed!");
};

run();
