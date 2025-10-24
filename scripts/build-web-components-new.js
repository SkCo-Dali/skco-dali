#!/usr/bin/env node

import { generateWebComponents } from './web-components/index.js';

// Ejecutar la generación
generateWebComponents().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
