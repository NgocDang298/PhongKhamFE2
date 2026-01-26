const fs = require('fs');
const path = require('path');

// Icon mapping from SVG patterns to Tabler Icons
const iconMappings = [
  // Layout Grid
  {
    pattern: /<svg[^>]*>\s*<rect x="3" y="3" width="7" height="7"[^>]*\/>\s*<rect x="14" y="3" width="7" height="7"[^>]*\/>\s*<rect x="14" y="14" width="7" height="7"[^>]*\/>\s*<rect x="3" y="14" width="7" height="7"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconLayoutGrid size={20} />',
    import: 'IconLayoutGrid'
  },
  // Users
  {
    pattern: /<svg[^>]*>\s*<path d="M17 21v-2 a4 4 0 0 0-4-4H5 a4 4 0 0 0-4 4v2"[^>]*\/>\s*<circle cx="9" cy="7" r="4"[^>]*\/>\s*<path d="M23 21v-2 a4 4 0 0 0-3-3\.87"[^>]*\/>\s*<path d="M16 3\.13 a4 4 0 0 1 0 7\.75"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconUserSquareRoundeds size={20} />',
    import: 'IconUserSquareRoundeds'
  },
  // Calendar
  {
    pattern: /<svg[^>]*>\s*<rect x="3" y="4" width="18" height="18" rx="2" ry="2"[^>]*\/>\s*<line x1="16" y1="2" x2="16" y2="6"[^>]*\/>\s*<line x1="8" y1="2" x2="8" y2="6"[^>]*\/>\s*<line x1="3" y1="10" x2="21" y2="10"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconCalendar size={20} />',
    import: 'IconCalendar'
  },
  // Chart Bar
  {
    pattern: /<svg[^>]*>\s*<line x1="18" y1="20" x2="18" y2="10"[^>]*\/>\s*<line x1="12" y1="20" x2="12" y2="4"[^>]*\/>\s*<line x1="6" y1="20" x2="6" y2="14"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconChartBar size={20} />',
    import: 'IconChartBar'
  },
  // Clock
  {
    pattern: /<svg[^>]*>\s*<circle cx="12" cy="12" r="10"[^>]*\/>\s*<polyline points="12 6 12 12 16 14"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconClock size={20} />',
    import: 'IconClock'
  },
  // File Text
  {
    pattern: /<svg[^>]*>\s*<path d="M14 2H6 a2 2 0 0 0-2 2v16 a2 2 0 0 0 2 2h12 a2 2 0 0 0 2-2V8z"[^>]*\/>\s*<polyline points="14 2 14 8 20 8"[^>]*\/>\s*<line x1="16" y1="13" x2="8" y2="13"[^>]*\/>\s*<line x1="16" y1="17" x2="8" y2="17"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconFileText size={20} />',
    import: 'IconFileText'
  },
  // Plus
  {
    pattern: /<svg[^>]*>\s*<line x1="12" y1="5" x2="12" y2="19"[^>]*\/>\s*<line x1="5" y1="12" x2="19" y2="12"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconPlus size={16} />',
    import: 'IconPlus'
  },
  // Currency Dollar
  {
    pattern: /<svg[^>]*>\s*<line x1="12" y1="1" x2="12" y2="23"[^>]*\/>\s*<path d="M17 5H9\.5 a3\.5 3\.5 0 0 0 0 7h5 a3\.5 3\.5 0 0 1 0 7H6"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconCurrencyDollar size={20} />',
    import: 'IconCurrencyDollar'
  },
  // Check Circle
  {
    pattern: /<svg[^>]*>\s*<path d="M22 11\.08V12 a10 10 0 1 1-5\.93-9\.14"[^>]*\/>\s*<polyline points="22 4 12 14\.01 9 11\.01"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconCircleCheck size={20} />',
    import: 'IconCircleCheck'
  },
  // Alert Circle
  {
    pattern: /<svg[^>]*>\s*<circle cx="12" cy="12" r="10"[^>]*\/>\s*<line x1="12" y1="8" x2="12" y2="12"[^>]*\/>\s*<line x1="12" y1="16" x2="12\.01" y2="16"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconAlertCircle size={20} />',
    import: 'IconAlertCircle'
  },
  // Refresh
  {
    pattern: /<svg[^>]*>\s*<polyline points="23 4 23 10 17 10"[^>]*\/>\s*<polyline points="1 20 1 14 7 14"[^>]*\/>\s*<path d="M3\.51 9 a9 9 0 0 1 14\.85-3\.36L23 10M1 14l4\.64 4\.36A9 9 0 0 0 20\.49 15"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconRefresh size={16} />',
    import: 'IconRefresh'
  },
  // Eye
  {
    pattern: /<svg[^>]*>\s*<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"[^>]*\/>\s*<circle cx="12" cy="12" r="3"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconEye size={16} />',
    import: 'IconEye'
  },
  // Chevron Right
  {
    pattern: /<svg[^>]*>\s*<polyline points="9 18 15 12 9 6"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconChevronRight size={20} />',
    import: 'IconChevronRight'
  },
  // X (Close)
  {
    pattern: /<svg[^>]*>\s*<line x1="18" y1="6" x2="6" y2="18"[^>]*\/>\s*<line x1="6" y1="6" x2="18" y2="18"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconX size={16} />',
    import: 'IconX'
  },
  // Settings/Circle with lines
  {
    pattern: /<svg[^>]*>\s*<circle cx="12" cy="12" r="10"[^>]*\/>\s*<line x1="12" y1="2" x2="12" y2="6"[^>]*\/>\s*<line x1="12" y1="18" x2="12" y2="22"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconSettings size={20} />',
    import: 'IconSettings'
  },
  // Package/Box
  {
    pattern: /<svg[^>]*>\s*<rect x="3" y="8" width="18" height="4" rx="1"[^>]*\/>\s*<path d="M12 8v13"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconPackage size={20} />',
    import: 'IconPackage'
  },
  // Trending Up
  {
    pattern: /<svg[^>]*>\s*<polyline points="23 6 13\.5 15\.5 8\.5 10\.5 1 18"[^>]*\/>\s*<polyline points="17 6 23 6 23 12"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconTrendingUp size={16} />',
    import: 'IconTrendingUp'
  },
  // Check (simple)
  {
    pattern: /<svg[^>]*>\s*<polyline points="9 11 12 14 22 4"[^>]*\/>\s*<path d="M21 12v7 a2 2 0 0 1-2 2H5 a2 2 0 0 1-2-2V5 a2 2 0 0 1 2-2h11"[^>]*\/>\s*<\/svg>/gs,
    replacement: '<IconCheck size={20} />',
    import: 'IconCheck'
  }
];

// Files to process
const files = [
  'app/admin/dashboard/page.tsx',
  'app/admin/schedules/page.tsx',
  'app/admin/statistics/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/services/page.tsx',
  'app/doctor/appointments/page.tsx',
  'app/doctor/dashboard/page.tsx',
  'app/doctor/examinations/page.tsx',
  'app/lab/dashboard/page.tsx',
  'app/lab/test-requests/page.tsx',
  'app/lab/test-results/page.tsx',
  'app/patient/appointments/book/page.tsx',
  'app/patient/invoices/page.tsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  const usedIcons = new Set();

  // Replace SVG patterns with Tabler Icons
  iconMappings.forEach(({ pattern, replacement, import: iconImport }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      usedIcons.add(iconImport);
    }
  });

  // Check if any replacements were made
  if (content === originalContent) {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return;
  }

  // Add imports if not already present
  if (usedIcons.size > 0) {
    const importStatement = `import {\n  ${Array.from(usedIcons).join(',\n  ')},\n} from "@tabler/icons-react";\n`;

    // Check if @tabler/icons-react import already exists
    if (!content.includes('@tabler/icons-react')) {
      // Add after the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
    } else {
      // Merge with existing import
      const existingImportRegex = /import\s*{([^}]+)}\s*from\s*["']@tabler\/icons-react["'];?/;
      const match = content.match(existingImportRegex);

      if (match) {
        const existingIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
        const allIcons = new Set([...existingIcons, ...Array.from(usedIcons)]);
        const newImport = `import {\n  ${Array.from(allIcons).join(',\n  ')},\n} from "@tabler/icons-react";`;
        content = content.replace(existingImportRegex, newImport);
      }
    }
  }

  // Write back to file
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅ Updated: ${filePath} (${usedIcons.size} icons replaced)`);
}

// Process all files
console.log('🚀 Starting SVG to Tabler Icons replacement...\n');
files.forEach(processFile);
console.log('\n✨ Done!');
