#!/usr/bin/env node
/**
 * Generate a WDK-compatible 12-word BIP39 seed phrase.
 * Run from server/: npm run generate-seed  (or node scripts/generate-seed.mjs)
 */
import { generateMnemonic } from 'bip39';
console.log(generateMnemonic(128));
