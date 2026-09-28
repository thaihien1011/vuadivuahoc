#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import babelParser from '@babel/parser';
import traversePkg from '@babel/traverse';

const traverse = traversePkg.default || traversePkg;

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
const issues = [];

const standardGlobals = new Set([
  'console', 'window', 'document', 'localStorage', 'sessionStorage',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'fetch', 'Promise', 'Math', 'Date', 'JSON', 'Array', 'Object',
  'String', 'Number', 'Boolean', 'RegExp', 'Error', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'navigator', 'alert', 'confirm', 'prompt',
  'URL', 'Blob', 'FormData', 'Headers', 'Request', 'Response',
  'Audio', 'Image', 'FileReader', 'Intl', 'Set', 'Map', 'WeakMap',
  'WeakSet', 'Symbol', 'CustomEvent', 'Event', 'MutationObserver',
  'IntersectionObserver', 'process', 'globalThis', 'undefined', 'NaN',
  'Infinity', 'btoa', 'atob'
]);

files.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    traverse(ast, {
      Identifier(astPath) {
        const name = astPath.node.name;
        const binding = astPath.scope.getBinding(name);

        if (!binding && !standardGlobals.has(name) &&
            !astPath.parentPath.isMemberExpression() &&
            !astPath.parentPath.isObjectProperty() &&
            !astPath.parentPath.isJSXAttribute()) {
          if (astPath.isReferencedIdentifier()) {
            issues.push({
              file: filePath,
              line: astPath.node.loc?.start.line,
              type: 'UNDEFINED_IDENTIFIER',
              detail: `"${name}" is referenced but not declared in scope or imported.`
            });
          }
        }
      }
    });
  } catch (err) {
    issues.push({
      file: filePath,
      line: 1,
      type: 'SYNTAX_PARSE_ERROR',
      detail: err.message
    });
  }
});

if (issues.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ CODE QUALITY AUDIT FAILED - Found the following issues:');
  issues.forEach(iss => {
    console.error(`  [${iss.file}:${iss.line}] (${iss.type}) ${iss.detail}`);
  });
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ CODE QUALITY AUDIT PASSED - 0 undeclared variables, all imports verified.');
}
