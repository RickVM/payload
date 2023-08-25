import path from 'path';
import { CollectionConfig } from '../../../../src/collections/config/types';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const Uploads: CollectionConfig = {
  slug: 'uploads',
  upload: {
    staticDir: path.resolve(__dirname, './uploads'),
  },
  fields: [
    {
      type: 'text',
      name: 'text',
    },
    {
      type: 'upload',
      name: 'media',
      relationTo: 'uploads',
      filterOptions: {
        mimeType: {
          equals: 'image/png',
        },
      },
    },
    {
      type: 'richText',
      name: 'richText',
    },
  ],
};

export const uploadsDoc = {
  text: 'An upload here',
};

export default Uploads;
