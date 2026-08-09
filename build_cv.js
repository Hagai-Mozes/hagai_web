const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, TabStopType, TabStopPosition, BorderStyle,
  HeadingLevel, ExternalHyperlink, PageOrientation,
} = require('docx');

// ---------- Design tokens ----------
const SERIF = 'Garamond';        // elegant display
const SANS  = 'Calibri';         // refined body
const INK   = '111111';          // primary text
const MUTED = '5C5C5C';          // secondary text
const ACCENT = '1F3A5F';         // deep navy accent
const RULE   = 'B7B7B7';         // hairline rule
const SUBTLE = '8A8A8A';         // dates / meta

// ---------- Helpers ----------
const t = (text, opts = {}) => new TextRun({
  text,
  font: opts.font || SANS,
  size: opts.size || 20,            // half-points: 20 = 10pt
  color: opts.color || INK,
  bold: !!opts.bold,
  italics: !!opts.italics,
  allCaps: !!opts.allCaps,
  characterSpacing: opts.tracking,
});

// Section heading: small caps tracked, with hairline rule below
const sectionHeading = (label) => new Paragraph({
  spacing: { before: 160, after: 60 },
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 },
  },
  children: [
    t(label.toUpperCase(), {
      font: SANS, size: 19, bold: true, color: ACCENT, tracking: 80,
    }),
  ],
});

// Title row: role + company on left (bold), date right-aligned (muted)
const roleRow = (role, company, dates) => new Paragraph({
  spacing: { before: 100, after: 20 },
  tabStops: [{ type: TabStopType.RIGHT, position: 10080 }], // 0.75" margins
  children: [
    t(role, { font: SANS, size: 21, bold: true, color: INK }),
    t('   '),
    t(company, { font: SANS, size: 21, color: MUTED, italics: true }),
    new TextRun({ text: '\t' }),
    t(dates, { font: SANS, size: 19, color: SUBTLE }),
  ],
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { before: 0, after: 0, line: 252 },
  children: [t(text, { size: 19, color: INK })],
});

const para = (runs, opts = {}) => new Paragraph({
  spacing: opts.spacing || { before: 0, after: 0 },
  alignment: opts.alignment,
  children: runs,
});

// ---------- Header (name + title + contact) ----------
const header = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [
      t('HAGAI MOZES', {
        font: SERIF, size: 48, bold: false, color: INK, tracking: 180,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [
      t('Tel Aviv, Israel', { size: 17, color: MUTED }),
      t('   ·   ', { size: 17, color: RULE }),
      t('052-695-8044', { size: 17, color: MUTED }),
      t('   ·   ', { size: 17, color: RULE }),
      new ExternalHyperlink({
        link: 'mailto:hagimo@gmail.com',
        children: [new TextRun({
          text: 'hagimo@gmail.com',
          font: SANS, size: 17, color: ACCENT,
        })],
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 },
    },
    children: [
      t(
        'Software developer specializing in networking and firmware — building production-grade AI agents and tools.',
        { font: SERIF, size: 20, italics: true, color: INK },
      ),
    ],
  }),
];

// ---------- Experience ----------
const experience = [
  sectionHeading('Experience'),

  roleRow('NVIDIA', '  Software Developer, Firmware Verification', '2023 — Present'),
  bullet('Owned firmware verification for Co-Packaged Optics (CPO), establishing a greenfield environment for a highly complex frontier technology through technical research, experimentation, and alignment across multiple teams.'),
  bullet('Ideated, built, and productionized CPO Monitor — an AI-assisted diagnostics and remediation tool for laser and system status — adopted broadly across CPO engineering teams.'),
  bullet('Won 2nd place in the NVIDIA Networking Hackathon for the original CPO Monitor concept.'),
  bullet('Owned Memory Map Validator end-to-end: core functionality, Confluence-based requirements tracking, automation, maintenance, user support, and reporting for production, hardware, and design LinkX teams.'),
  bullet('Built an autonomous PHY agent that takes firmware tickets from intake to code review without supervision, operating under its own identity across communication channels, hardware access, MCP, CLI, memory and skills.'),
  bullet('Enabled other engineers through training, internal demos, and hands-on knowledge sharing to accelerate broader team adoption of AI-enabled monitoring and debugging workflows.'),

  roleRow('Intel', '  SoC Physical Design Backend Developer, C2DG Core Group  ·  Student Position', '2021 — 2023'),
  bullet('Worked in a full-chip integration group across frontend-to-backend delivery, physical design, tool support, and flow development.'),
  bullet('Developed and managed automated central flows for Synopsys and Cadence signoff tools, including FlowTracer-based design execution.'),
  bullet('Supported Formal Equivalence Verification (FEV) full-chip runs and user support.'),
  bullet('Awarded department-head recognition for high-impact closure-flow tool development and mentorship of new team members.'),

  roleRow('Office of the Prime Minister', '  Classified Role', '2018 — 2020'),
];

// ---------- Education ----------
const education = [
  sectionHeading('Education'),
  roleRow('Tel Aviv University', '  B.Sc., Electrical Engineering & Computer Science', '2019 — 2023'),
  bullet('Majored in Computer Communication (EE) and Information Security (CS).'),
  bullet('Programming tutor in Python, C, and Java; private tutor and mentor in university programs.'),
  bullet('Project work spanning kernel programming, parallel programming, communication systems, and cybersecurity.'),
];

// ---------- Skills ----------
const skillsLine = (label, body) => new Paragraph({
  spacing: { before: 30, after: 30, line: 260 },
  indent: { left: 0 },
  children: [
    t(label + '   ', { font: SANS, size: 19, bold: true, color: ACCENT }),
    t(body, { size: 19, color: INK }),
  ],
});

const skills = [
  sectionHeading('Skills'),
  skillsLine('Programming',
    'Python, C, C++, Java, Tcl, Verilog'),
  skillsLine('Tools & Environments',
    'Unix/Linux, Git, Cursor, Claude Code, Codex, Cadence, Synopsys, Confluence, SharePoint, MCP, Skills, CLI, Scrum master, firmware verification & debugging tools'),
  skillsLine('Domains',
    'Co-Packaged Optics (CPO), firmware verification, computer networking, information security, kernel & parallel programming, SoC physical design, signoff flows'),
  skillsLine('Languages',
    'Hebrew (native), English (very good)'),
];

// ---------- Military & Leadership ----------
const military = [
  sectionHeading('Military & Leadership'),
  roleRow('IDF Armored Corps', '  Combat Officer, Deputy Company Commander', '2014 — 2018'),
  bullet('Captain — led operational teams as deputy company commander and platoon commander; awarded a Colonel-level excellence certificate.'),
  bullet('Reserve duty as platoon commander.'),
];

// ---------- Additional Highlights ----------
const additional = [
  sectionHeading('Additional Highlights'),
  roleRow('Amit Bar Ilan', '  Physics & Electronics; Bar Ilan University Nanotechnology Program', '2006 — 2012'),
  bullet('First place in a national Arduino/GPS final-project competition.'),
  bullet('React Native volunteer development at the Hagvurah Hackathon.'),
];

// ---------- Document ----------
const doc = new Document({
  creator: 'Hagai Mozes',
  title: 'Hagai Mozes — Curriculum Vitae',
  styles: {
    default: {
      document: { run: { font: SANS, size: 20, color: INK } },
    },
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: '–',  // en-dash bullet for elegance
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: { indent: { left: 360, hanging: 220 } },
          run: { color: ACCENT, font: SANS },
        },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter
        margin: { top: 720, right: 1080, bottom: 720, left: 1080 }, // 0.5" / 0.75"
      },
    },
    children: [
      ...header,
      ...experience,
      ...education,
      ...skills,
      ...military,
      ...additional,
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  // Source-of-truth .docx stays at the repo root (not deployed).
  // The PDF rendered from it is what the site links to, in /public.
  fs.writeFileSync('/Users/shochhauser/hagai_web/Hagai_Mozes_CV.docx', buf);
  console.log('Wrote Hagai_Mozes_CV.docx (' + buf.length + ' bytes)');
});
