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

// Resume from Sept 8 (day offset 250)
const resumeFrom = moment("2025-09-08");

function getDate(r, c) {
  const d = c * 7 + r - jan1Dow;
  if (d < 0 || d > 364) return null;
  return moment("2025-01-01").add(d, "days");
}

function isLP(r, c) {
  const rc = c - sc;
  if (rc < 0 || rc >= tw) return false;
  const li = Math.floor(rc / (lw + gap)), p = rc % (lw + gap);
  if (p >= lw || li >= word.length) return false;
  return letters[word[li]][r][p] === 1;
}

function commit(dateStr, i) {
  writeFileSync(path, JSON.stringify({ date: dateStr, commit: i + 1 }));
  execSync("git add .");
  execSync(`git commit --author="hasbeejay <hasbeejayleo@gmail.com>" -m "${dateStr}" --date="${dateStr}"`);
}

let total = 0;

for (let col = 0; col < 53; col++) {
  for (let row = 0; row < 7; row++) {
    const date = getDate(row, col);
    if (!date || date.isBefore(resumeFrom)) continue;

    let n;
    if (isLP(row, col)) {
      n = 18 + Math.floor(Math.random() * 3);
    } else {
      n = 1;
    }

    const ds = date.format();
    console.log(`${date.format("YYYY-MM-DD")} [${isLP(row, col) ? "LTR" : "bg "}] → ${n}`);
    for (let i = 0; i < n; i++) commit(ds, i);
    total += n;
  }
}

console.log(`\nDone! ${total} commits.`);
console.log("Pushing...");
execSync("git push");
console.log("Pushed!");
