import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getAllTemplates, getTemplateById, EventTemplateSchema } from '../src/index.js';

describe('Event Template Registry Tests', () => {
  it('should load all 6 required canonical templates', () => {
    const templates = getAllTemplates();
    assert.strictEqual(templates.length, 6);

    const ids = templates.map(t => t.id).sort();
    assert.deepStrictEqual(ids, [
      'birthday',
      'college_hackathon',
      'community_event',
      'corporate_conference',
      'custom',
      'wedding'
    ]);
  });

  it('should have unique stable IDs for every template', () => {
    const templates = getAllTemplates();
    const ids = new Set(templates.map(t => t.id));
    assert.strictEqual(ids.size, templates.length);
  });

  it('should conform every template to the EventTemplateSchema', () => {
    const templates = getAllTemplates();
    for (const tmpl of templates) {
      const result = EventTemplateSchema.safeParse(tmpl);
      assert.strictEqual(
        result.success,
        true,
        `Template '${tmpl.id}' failed validation: ${!result.success ? JSON.stringify(result.error.issues) : ''}`
      );
    }
  });

  it('should provide required fields, default modules, and task categories for each template', () => {
    const templates = getAllTemplates();
    for (const tmpl of templates) {
      assert.ok(tmpl.requiredFields.length > 0, `Template ${tmpl.id} has no requiredFields`);
      assert.ok(tmpl.defaultModules.length > 0, `Template ${tmpl.id} has no defaultModules`);
      assert.ok(tmpl.taskCategories.length > 0, `Template ${tmpl.id} has no taskCategories`);
      assert.ok(tmpl.suggestedTasks.length > 0, `Template ${tmpl.id} has no suggestedTasks`);
    }
  });

  it('should retrieve individual template by ID', () => {
    const wedding = getTemplateById('wedding');
    assert.ok(wedding);
    assert.strictEqual(wedding?.name, 'Wedding & Anniversary');

    const hackathon = getTemplateById('college_hackathon');
    assert.ok(hackathon);
    assert.strictEqual(hackathon?.name, 'College Hackathon');
  });
});
