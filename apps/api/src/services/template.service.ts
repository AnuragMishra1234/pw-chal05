import { EventTemplate, getAllTemplates, getTemplateById } from '@celebration/shared';

export class TemplateService {
  async listTemplates(): Promise<EventTemplate[]> {
    return getAllTemplates();
  }

  async getTemplateById(templateId: string): Promise<EventTemplate | null> {
    const template = getTemplateById(templateId);
    return template || null;
  }
}

export const templateService = new TemplateService();
