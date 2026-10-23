const fs = require('fs');
const path = require('path');

function stripCssComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '');
}

function stripJsComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*/g, '');
}

const stylePath = path.join(__dirname, 'style.css');
const css = fs.readFileSync(stylePath, 'utf8');
fs.writeFileSync(stylePath, stripCssComments(css), 'utf8');

const scriptPath = path.join(__dirname, 'script.js');
const js = fs.readFileSync(scriptPath, 'utf8');
fs.writeFileSync(scriptPath, stripJsComments(js), 'utf8');

console.log('Comments stripped successfully from style.css and script.js');
