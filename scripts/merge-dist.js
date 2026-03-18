const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist");

// 최종 dist 폴더 구조:
// dist/
//   index.html, main.js, ... (shell)
//   header/
//     remoteEntry.js, ...    (header)
//   banner/
//     remoteEntry.js, ...    (banner)

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 기존 dist 정리
if (fs.existsSync(OUT)) {
  fs.rmSync(OUT, { recursive: true });
}
fs.mkdirSync(OUT, { recursive: true });

// shell → dist/ (루트)
copyDir(path.join(ROOT, "shell", "dist"), OUT);

// header → dist/header/
copyDir(path.join(ROOT, "header", "dist"), path.join(OUT, "header"));

// banner → dist/banner/
copyDir(path.join(ROOT, "banner", "dist"), path.join(OUT, "banner"));

console.log("✅ Merged all builds into dist/");
