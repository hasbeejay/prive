import { writeFileSync } from "fs";
import { execSync } from "child_process";
import moment from "moment";

const path = "./data.json";

const letters = {
  H: [[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,1,1,1,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1]],
  A: [[0,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,1,1,1,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1]],
  S: [[0,1,1,1,1,1,0],[1,1,0,0,0,0,0],[1,1,0,0,0,0,0],[0,1,1,1,1,1,0],[0,0,0,0,0,1,1],[0,0,0,0,0,1,1],[0,1,1,1,1,1,0]],
  E: [[1,1,1,1,1,1,1],[1,1,0,0,0,0,0],[1,1,0,0,0,0,0],[1,1,1,1,1,1,0],[1,1,0,0,0,0,0],[1,1,0,0,0,0,0],[1,1,1,1,1,1,1]],
  B: [[1,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,1,1,1,1,0],[1,1,0,0,0,1,1],[1,1,0,0,0,1,1],[1,1,1,1,1,1,0]],
};

const word = "HASEEB", lw = 7, gap = 1;
const tw = word.length * lw + (word.length - 1) * gap;
const sc = Math.floor((53 - tw) / 2);
const jan1Dow = 3;

function isLP(r, c) {
  const rc = c - sc;
  if (rc < 0 || rc >= tw) return false;
  const li = Math.floor(rc / (lw + gap)), p = rc % (lw + gap);
  if (p >= lw || li >= word.length) return false;
  return letters[word[li]][r][p] === 1;
}

const missingBefore = moment("2025-05-26");
let total = 0;
let batchCount = 0;
let lastPushMonth = 0;

for (let day = 0; day < 365; day++) {
  const date = moment("2025-01-01").add(day, "days");
  const month = date.month();

  if (month !== lastPushMonth && batchCount > 0) {
    console.log(`Month ${lastPushMonth + 1} done (${batchCount} commits). Pushing...`);
    execSync("git push");
    console.log("Pushed!");
    batchCount = 0;
  }
  lastPushMonth = month;

  const row = (jan1Dow + day) % 7;
  const col = Math.floor((jan1Dow + day) / 7);
  const isMissing = date.isBefore(missingBefore);
  const letter = isLP(row, col);

  let n = 0;
  if (letter) {
    n = isMissing ? 22 : 4;
  } else if (isMissing) {
    n = 1;
  }

  if (n === 0) continue;

  const ds = date.format();
  for (let i = 0; i < n; i++) {
    writeFileSync(path, JSON.stringify({ date: ds, commit: i + 1 }));
    execSync(`git add . && GIT_COMMITTER_DATE="${ds}" git commit -m "c" --date="${ds}"`);
  }
  total += n;
  batchCount += n;
}

if (batchCount > 0) {
  console.log(`Month ${lastPushMonth + 1} done (${batchCount} commits). Pushing...`);
  execSync("git push");
  console.log("Pushed!");
}

console.log(`\nAll done! Total: ${total} commits.`);
