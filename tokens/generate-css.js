const fs = require('fs');
const path = require('path');

function kebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().replace(/\s+/g, '-');
}

function resolveReference(ref, data) {
  if (typeof ref === 'string' && ref.startsWith('{') && ref.endsWith('}')) {
    const path = ref.slice(1, -1).split('.');
    let current = data;
    for (const key of path) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else if (current) {
        const caseInsensitiveKey = Object.keys(current).find(k => k.toLowerCase() === key.toLowerCase());
        if (caseInsensitiveKey && current[caseInsensitiveKey] !== undefined) {
           current = current[caseInsensitiveKey];
        } else if (!isNaN(Number(key))) {
           // Find nearest numeric key in the palette
           const numericKeys = Object.keys(current).map(Number).filter(n => !isNaN(n));
           if (numericKeys.length > 0) {
             const targetNum = Number(key);
             const nearestKey = numericKeys.reduce((prev, curr) => Math.abs(curr - targetNum) < Math.abs(prev - targetNum) ? curr : prev);
             current = current[nearestKey.toString()];
             console.warn(`Warning: Could not resolve exact reference ${ref} at key ${key}, falling back to nearest numeric key ${nearestKey}`);
           } else {
             console.warn(`Warning: Could not resolve reference ${ref} at key ${key}`);
             return '';
           }
        } else {
           console.warn(`Warning: Could not resolve reference ${ref} at key ${key}`);
           return '';
        }
      } else {
        console.warn(`Warning: Could not resolve reference ${ref}`);
        return '';
      }
    }
    return resolveReference(current, data);
  }
  return ref;
}

function buildTokens() {
  const rootColorVars = [];
  const darkColorVars = [];
  const typoVars = [];

  // Parse color tokens
  const colorTokenPath = path.join(__dirname, 'color-tokens.json');
  if (fs.existsSync(colorTokenPath)) {
    const colorData = JSON.parse(fs.readFileSync(colorTokenPath, 'utf-8'));
    
    if (colorData.color && colorData.color.role) {
      const lightRoles = colorData.color.role.light || {};
      for (const [key, value] of Object.entries(lightRoles)) {
        const resolved = resolveReference(value, colorData);
        rootColorVars.push(`  --${kebabCase(key)}: ${resolved};`);
      }

      const darkRoles = colorData.color.role.dark || {};
      for (const [key, value] of Object.entries(darkRoles)) {
        const resolved = resolveReference(value, colorData);
        darkColorVars.push(`  --${kebabCase(key)}: ${resolved};`);
      }
    }
  } else {
    console.warn(`Could not find ${colorTokenPath}`);
  }

  // Parse typography tokens
  const typoTokenPath = path.join(__dirname, 'design-tokens.tokens.json');
  if (fs.existsSync(typoTokenPath)) {
    const typoData = JSON.parse(fs.readFileSync(typoTokenPath, 'utf-8'));
    
    function flattenTypoTokens(obj, currentVarNamePath = []) {
      for (const [key, val] of Object.entries(obj)) {
        if (val && typeof val === 'object' && val.value !== undefined) {
          const varParts = [];
          if (currentVarNamePath.length > 0) {
            varParts.push(kebabCase(currentVarNamePath[currentVarNamePath.length - 1]));
          }
          varParts.push(kebabCase(key));
          const varName = varParts.join('-');

          let cssValue = val.value;
          if (val.type === 'dimension' && typeof cssValue === 'number') {
            if (cssValue !== 0) {
              cssValue += 'px';
            }
          }
          typoVars.push(`  --${varName}: ${cssValue};`);
        } else if (val && typeof val === 'object') {
          flattenTypoTokens(val, [...currentVarNamePath, key]);
        }
      }
    }

    if (typoData.typography) {
       flattenTypoTokens(typoData.typography);
    } else if (typoData.font) {
       flattenTypoTokens(typoData.font);
    } else {
       flattenTypoTokens(typoData);
    }
  } else {
    console.warn(`Could not find ${typoTokenPath}`);
  }

  const cssOutput = `/* Auto-generated CSS from design tokens */

:root {
  /* Light Theme Colors */
${rootColorVars.join('\n')}

  /* Typography */
${typoVars.join('\n')}
}

/* Dark Theme Colors */
[data-theme="dark"], .dark {
${darkColorVars.join('\n')}
}
`;

  const outPath = path.join(__dirname, 'tokens.css');
  fs.writeFileSync(outPath, cssOutput);
  console.log(`Successfully generated ${outPath}`);
}

buildTokens();
