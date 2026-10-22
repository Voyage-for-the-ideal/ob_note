// Convert 学案2.md into a LaTeX document where each 大题 occupies its own page.
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT = process.argv[3];

const raw = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');

// ---- Pass 1: split into sections -------------------------------------------
// A "section" is a ## heading plus everything until the next ## heading.
const sections = [];
let cur = null;
for (const line of lines) {
  if (/^##\s+/.test(line)) {
    cur = { title: line.replace(/^##\s+/, '').trim(), body: [] };
    sections.push(cur);
  } else if (cur) {
    cur.body.push(line);
  } else {
    // Preamble before the first ## (e.g. the "以下是为您提取的四道大题" note).
    if (!sections.length) {
      sections.push({ title: '', body: [line] });
      cur = sections[0];
    }
  }
}

// ---- LaTeX escaping helpers ------------------------------------------------
function esc(s) {
  // Escape LaTeX specials, but leave already-present math untouched.
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Render plain (non-math) text: escape specials, but preserve intentional
// markdown emphasis-free content and the full-width blanks.
function escText(s) {
  let out = '';
  // split out math spans so we do not escape inside them
  const re = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
  let last = 0, m;
  while ((m = re.exec(s)) !== null) {
    out += escapePlain(s.slice(last, m.index));
    out += m[0]; // math kept verbatim
    last = re.lastIndex;
  }
  out += escapePlain(s.slice(last));
  return out;
}

// Escape plain text for LaTeX. Order matters: the backslash rule must run first
// so that the braces it introduces are not escaped again, and the brace rule
// must not touch braces that belong to a command we already emitted.
const TOKEN_OPEN = '\u0001';
const TOKEN_CLOSE = '\u0002';
const TOKEN_BOLD_OPEN = '\u0003';
const TOKEN_BOLD_CLOSE = '\u0004';
const TOKEN_ITAL_OPEN = '\u0005';
const TOKEN_ITAL_CLOSE = '\u0006';
const TOKEN_BLANK = '\u0007';

function escapePlain(t) {
  return t
    // Fill-in blanks become a single rule rather than a run of escaped underscores.
    .replace(/_{3,}/g, TOKEN_BLANK)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%#_])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\$/g, '\\$')
    .replace(/\{/g, TOKEN_OPEN)
    .replace(/\}/g, TOKEN_CLOSE);
}

// Restore sentinels to real braces once all escaping is complete.
function restoreBraces(t) {
  return t.split(TOKEN_OPEN).join('\\{').split(TOKEN_CLOSE).join('\\}');
}

// Convert markdown inline emphasis + math into LaTeX inline.
// Emphasis markers must be handled OUTSIDE math only: a '*' inside $...$ is
// math syntax (e.g. \mathbb N^*), not markdown.
function inline(s) {
  const re = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
  let out = '';
  let last = 0, m;
  while ((m = re.exec(s)) !== null) {
    out += emph(s.slice(last, m.index));
    out += m[0]; // math verbatim
    last = re.lastIndex;
  }
  out += emph(s.slice(last));
  return out;
}

function emph(seg) {
  let t = seg
    .replace(/\*\*([^*]+)\*\*/g, TOKEN_BOLD_OPEN + '$1' + TOKEN_BOLD_CLOSE)
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, TOKEN_ITAL_OPEN + '$1' + TOKEN_ITAL_CLOSE);
  return finish(escapePlainText(t));
}

function escapePlainText(t) {
  return escapePlain(t);
}

function finish(t) {
  return restoreBraces(t)
    .split(TOKEN_BLANK).join('\\blank{}')
    .split(TOKEN_BOLD_OPEN).join('\\textbf{')
    .split(TOKEN_BOLD_CLOSE).join('}')
    .split(TOKEN_ITAL_OPEN).join('\\emph{')
    .split(TOKEN_ITAL_CLOSE).join('}');
}

// ---- Problem detection -----------------------------------------------------
// 大题 lines look like:  9.（本题满分16分）...   or   第9题
function isBigProblem(line) {
  return /^(\d{1,2})\.（本题满分/.test(line) || /^###\s*第\d+题/.test(line);
}

// ---- Build LaTeX -----------------------------------------------------------
const tex = [];
tex.push(String.raw`\documentclass[11pt]{ctexart}`);
tex.push(String.raw`\usepackage{amsmath,amssymb,amsthm}`);
tex.push(String.raw`\usepackage[margin=2.2cm,top=2.4cm,bottom=2.2cm]{geometry}`);
tex.push(String.raw`\usepackage{enumitem}`);
tex.push(String.raw`\usepackage{fancyhdr}`);
tex.push(String.raw`\usepackage{titlesec}`);
tex.push(String.raw`\usepackage{needspace}`);
tex.push(String.raw`\usepackage[hidelinks]{hyperref}`);

// Chinese fonts via ctex + xeCJK fallback
tex.push(String.raw`\setCJKmainfont{SimSun}[BoldFont=SimHei,ItalicFont=KaiTi]`);
tex.push(String.raw`\setCJKsansfont{SimHei}`);
tex.push(String.raw`\setCJKmonofont{FangSong}`);

tex.push(String.raw`\linespread{1.25}`);
tex.push(String.raw`\setlength{\parindent}{0pt}`);
tex.push(String.raw`\setlength{\parskip}{0.5em}`);

// Display math: keep it centred and not broken awkwardly
tex.push(String.raw`\allowdisplaybreaks`);

// Header/footer
tex.push(String.raw`\pagestyle{fancy}`);
tex.push(String.raw`\fancyhf{}`);
tex.push(String.raw`\renewcommand{\headrulewidth}{0.4pt}`);
tex.push(String.raw`\fancyhead[L]{\small 高中数学联合竞赛一试·学案}`);
tex.push(String.raw`\fancyfoot[C]{\small\thepage}`);

// Section styling
tex.push(String.raw`\titleformat{\section}{\Large\bfseries}{}{0pt}{}`);
tex.push(String.raw`\titlespacing*{\section}{0pt}{0pt}{0.8em}`);

// Command that starts a fresh page for a big problem
tex.push(String.raw`\newcommand{\bigproblem}[1]{\clearpage\section*{#1}}`);

tex.push(String.raw`\begin{document}`);
tex.push(String.raw`\sloppy`);

// Flush marks
tex.push(String.raw`\newcommand{\blank}{\underline{\hspace{3em}}}`);

for (const sec of sections) {
  const body = sec.body.join('\n');

  if (!sec.title) {
    // preamble note -> render as a plain paragraph
    const t = body.trim();
    if (t) tex.push(inline(t) + '\n');
    continue;
  }

  // Split body into blocks: heading-before-first-big-problem, then each big problem.
  const bodyLines = sec.body;
  const idxs = [];
  bodyLines.forEach((l, i) => { if (isBigProblem(l)) idxs.push(i); });

  // Page for the section head + 填空题
  const firstIdx = idxs.length ? idxs[0] : bodyLines.length;
  const headPart = bodyLines.slice(0, firstIdx);
  const headText = headPart.join('\n').replace(/^###\s+/gm, '');

  tex.push(String.raw`\clearpage`);
  tex.push(`\\section*{${inline(sec.title)}}`);
  if (headText.trim()) tex.push(inline(headText) + '\n');

  // Each big problem on its own page
  for (let k = 0; k < idxs.length; k++) {
    const start = idxs[k];
    const end = (k + 1 < idxs.length) ? idxs[k + 1] : bodyLines.length;
    let block = bodyLines.slice(start, end).join('\n').trim();
    // drop trailing horizontal rules
    block = block.replace(/\n-{3,}\s*$/,'').trim();
    if (!block) continue;

    // Turn the leading "N.（本题满分X分）" into a bold problem heading, using
    // sentinels so the escaping stage does not mangle the command.
    block = block.replace(
      /^(\d{1,2}\.)（本题满分(\d+)分）/,
      (all, num, pts) => TOKEN_BOLD_OPEN + `${num}（本题满分${pts}分）` + TOKEN_BOLD_CLOSE
    );
    // "### 第N题" style headings
    block = block.replace(
      /^###\s*第(\d+)题\s*$/m,
      (all, n) => TOKEN_BOLD_OPEN + `第${n}题` + TOKEN_BOLD_CLOSE
    );

    tex.push(String.raw`\clearpage`);
    tex.push(inline(block) + '\n');
  }
}

tex.push(String.raw`\end{document}`);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, tex.join('\n'), 'utf8');
console.log('Wrote ' + OUT);
console.log('Sections: ' + sections.length);
