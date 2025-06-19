
import { type ResourceTemplate } from '../schema';

export declare function getResourceTemplatesByType(type: 'document_template' | 'calculator'): Promise<ResourceTemplate[]>;
