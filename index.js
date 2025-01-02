import { writeFileSync } from "fs";
import { execSync } from "child_process";
import moment from "moment";

const path = "./data.json";

// 7 rows (Sun=0 to Sat=6) × 5 cols per letter
const letters = {
  H: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  A: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  S: [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
  ],
  E: [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  B: [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
};

const word = "HASEEB";
const letterWidth = 5;
const gap = 1;
const totalWidth = word.length * letterWidth + (word.length - 1) * gap; // 35
const startCol = Math.floor((53 - totalWidth) / 2); // 9, centered

// 2025: Jan 1 is Wednesday (day index 3, Sun=0)
const jan1Dow = 3;

function getDateFor2025(row, col) {
  const dayOffset = col * 7 + row - jan1Dow;
  if (dayOffset < 0 || dayOffset > 364) return null;
  return moment("2025-01-01").add(dayOffset, "days");
}

function isLetterPixel(row, col) {
  const relCol = col - startCol;
  if (relCol < 0 || relCol >= totalWidth) return false;
  const letterIdx = Math.floor(relCol / (letterWidth + gap));
  const posInBlock = relCol % (letterWidth + gap);
  if (posInBlock >= letterWidth || letterIdx >= word.length) return false;
  return letters[word[letterIdx]][row][posInBlock] === 1;
}

function makeCommit(dateStr, i) {
  writeFileSync(path, JSON.stringify({ date: dateStr, commit: i + 1 }));
  execSync("git add .", { cwd: process.cwd() });
  execSync(`git commit -m "${dateStr}" --date="${dateStr}"`, { cwd: process.cwd() });
}

const run = () => {
  let totalCommits = 0;

  // === 2025: HASEEB on contribution graph ===
  console.log("=== 2025: Writing HASEEB ===");
  for (let col = 0; col < 53; col++) {
    for (let row = 0; row < 7; row++) {
      const date = getDateFor2025(row, col);
      if (!date) continue;

      let commits;
      const inTextRegion = col >= startCol && col < startCol + totalWidth;

      if (isLetterPixel(row, col)) {
        commits = 15 + Math.floor(Math.random() * 6); // 15–20 → darkest green
      } else if (inTextRegion) {
        commits = 0; // empty for contrast
      } else {
        commits = Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 3) : 0; // sparse bg
      }

      if (commits === 0) continue;
      const dateStr = date.format();
      console.log(`${date.format("YYYY-MM-DD")} → ${commits} commit(s)`);
      for (let i = 0; i < commits; i++) makeCommit(dateStr, i);
      totalCommits += commits;
    }
  }

  // === 2026: Random 5-10 commits per day ===
  console.log("\n=== 2026: Random commits ===");
  const current = moment("2026-01-01");
  const end2026 = moment("2026-04-22");

  while (current.isSameOrBefore(end2026)) {
    const commits = 5 + Math.floor(Math.random() * 6); // 5–10
    const dateStr = current.format();
    console.log(`${current.format("YYYY-MM-DD")} → ${commits} commit(s)`);
    for (let i = 0; i < commits; i++) makeCommit(dateStr, i);
    totalCommits += commits;
    current.add(1, "d");
  }

  console.log(`\nDone! Total commits: ${totalCommits}`);
  console.log("Pushing to remote...");
  execSync("git push", { cwd: process.cwd() });
  console.log("Pushed!");
};

run();
