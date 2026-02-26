const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando instalación de sqlite3...');

// Verificar si sqlite3 está en node_modules
const sqlite3Path = path.join(__dirname, '../../node_modules/sqlite3');
if (fs.existsSync(sqlite3Path)) {
  console.log('✅ sqlite3 encontrado en node_modules');
  
  // Verificar package.json de sqlite3
  const pkgPath = path.join(sqlite3Path, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log('📦 sqlite3 versión:', pkg.version);
  }
  
  // Verificar el binario
  const bindingPath = path.join(sqlite3Path, 'lib', 'binding', 'node-v108-win32-x64', 'node_sqlite3.node');
  console.log('🔧 Buscando binding en:', bindingPath);
  console.log('📁 Binding existe:', fs.existsSync(bindingPath));
  
} else {
  console.log('❌ sqlite3 NO encontrado en node_modules');
}

// Intentar requerir sqlite3
try {
  const sqlite3 = require('sqlite3');
  console.log('✅ sqlite3 se requiere correctamente');
  console.log('🔧 Versión:', sqlite3.VERSION);
} catch (error) {
  console.log('❌ Error al requerir sqlite3:', error.message);
}