// ABOUTME: Validates the shared Renovate presets against the fleet's dependency safety rules.
// ABOUTME: Fails when automerge, stability delays, or framework grouping drift from policy.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const repositoryRoot = new URL('../', import.meta.url);

async function readPreset(fileName) {
  return JSON.parse(await readFile(new URL(fileName, repositoryRoot), 'utf8'));
}

function findRule(preset, predicate, message) {
  const rule = preset.packageRules?.find(predicate);
  assert.ok(rule, message);
  return rule;
}

const base = await readPreset('default.json');
const astro = await readPreset('astro.json');
const strapi = await readPreset('strapi.json');

assert.ok(base.extends.includes('config:recommended'));
assert.equal(base.timezone, 'America/Merida');
assert.equal(base.platformAutomerge, false);
assert.notEqual(base.ignoreTests, true);
assert.equal(base.vulnerabilityAlerts.enabled, true);
assert.equal(base.vulnerabilityAlerts.automerge, false);
assert.equal(base.vulnerabilityAlerts.prCreation, 'immediate');

for (const [updateType, age] of [
  ['patch', '7 days'],
  ['minor', '14 days'],
  ['major', '30 days'],
]) {
  const rule = findRule(
    base,
    (candidate) => candidate.matchUpdateTypes?.includes(updateType),
    `Missing ${updateType} stability rule`,
  );
  assert.equal(rule.minimumReleaseAge, age);
}

const actionsRule = findRule(
  base,
  (candidate) => candidate.matchManagers?.includes('github-actions'),
  'Missing GitHub Actions review rule',
);
assert.equal(actionsRule.automerge, false);

assert.deepEqual(astro.extends, ['./default']);
const astroPatchRule = findRule(
  astro,
  (candidate) => candidate.automerge === true,
  'Missing Astro patch automerge rule',
);
assert.deepEqual(astroPatchRule.matchUpdateTypes, ['patch']);
assert.deepEqual(astroPatchRule.matchManagers, ['npm']);
assert.deepEqual(astroPatchRule.matchDepTypes, [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
]);

assert.deepEqual(strapi.extends, ['./default']);
const strapiRule = findRule(
  strapi,
  (candidate) => candidate.groupName === 'Strapi ecosystem',
  'Missing Strapi ecosystem grouping rule',
);
assert.equal(strapiRule.automerge, false);
assert.ok(strapiRule.matchPackageNames.includes('@strapi/**'));

console.log('Shared Renovate policy is valid.');
