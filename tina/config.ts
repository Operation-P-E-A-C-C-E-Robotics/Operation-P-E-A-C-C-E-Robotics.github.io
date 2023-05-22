import { defineConfig } from "tinacms";
import { date } from "zod";

// Your hosting provider likely exposes this as an environment variable
 const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  ''
 const clientId = process.env.TINA_PUBLIC_CLIENT_ID || null
 const token = process.env.TINA_TOKEN || null
 
export default defineConfig({
  branch,
  clientId, // Get this from tina.io
  token, // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "/",
  },
  media: {
    tina: {
      mediaRoot: "/assets",
      publicFolder: "/",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "/_posts",
        ui: {
          filename: {
            // if disabled, the editor can not edit the filename
            readonly: true,
            // Example of using a custom slugify function
            slugify: values => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${new Date(Date.now()).toISOString().split('T')[0] ||
                'no-topic'}-${values?.title?.toLowerCase().replace(/ /g, '-')}`
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
          {
          label: "Published",
          name: "published",
          type: "boolean",
          },
        ],
      },
      {
        name: "robots",
        label: "Robot Profiles",
        path: "/_robots",
        defaultItem: () => {
          return {
            // When a new post is created the title field will be set to "New post"
            year: `${new Date(Date.now()).getFullYear()}`,
            metatitle: `${new Date(Date.now()).getFullYear()} Robot: ROBOT NAME`,
            metadesc: `GAME NAME Performance and Statistics`,
          }
        },
        ui: {
          filename: {
            // if disabled, the editor can not edit the filename
            readonly: false,
            // Example of using a custom slugify function
            slugify: values => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${new Date(Date.now()).getFullYear()}`
            },
          },
        },
        fields: [
          {
            name: 'year',
            label: 'Year',
            type: 'number',
          },
          {
            name: 'robotName',
            label: 'Robot Name',
            type: 'string',
          },
          {
            name: 'game',
            label: 'Game Name',
            type: 'string',
          },
          {
            name: 'thumbnail',
            label: 'Thumbnail Image',
            type: 'image',
          },
          {

            name: 'metatitle',
            label: 'Meta Title',
            type: 'string',
          },
          {
            name: 'metadesc',
            label: 'Meta Description',
            type: 'string',
          },
          {
            type: "rich-text",
            name: "body",
            label: "Write Up",
            isBody: true,
          },
          {
            label: "Published",
            name: "published",
            type: "boolean",
            },
        ],
      },

    ],
  },
});
