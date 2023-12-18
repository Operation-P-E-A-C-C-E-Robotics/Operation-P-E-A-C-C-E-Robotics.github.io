import { defineConfig, FieldDescription } from "tinacms";
import { date } from "zod";

// Your hosting provider likely exposes this as an environment variable
 const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'
 const clientId = process.env.TINA_PUBLIC_CLIENT_ID || null
 const token = process.env.TINA_TOKEN || null

 const searchToken = process.env.TINA_SEARCH
 
export default defineConfig({
  branch,
  clientId, // Get this from tina.io
  token, // Get this from tina.io

  build: {
    basePath: "/website-staging",
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
        name: "about",
        label: "Top Level Pages",
        path: "/",
        match: {
          include: '*',
        },
       format: "md",
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
          name: "layout",
          label: "Page Layout",
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
      name: "navigation",
      label: "Nav Bar Links",
      path: "_data",
      ui: {
        allowedActions: {

          create: false,
          delete: false,
        },
      },
      match: {
        include: "navigation",
      },
      format: "yml",
      fields: [
        {
          name: "data",
          label: "Navigation Bar Links",
          type: "object",
          list: true,
          ui: {
            // This allows the customization of the list item UI
            // Data can be accessed by item?.<Name of field>
            itemProps: (item) => {
              return { label: `${item?.name}`}
            },
          },
          fields: [
            {
              name: "name",
              label: "Name",
              type: "string",
              description: "How the button will appear on the nav bar, NOT the link it will execute"
            },

            {
              name: "link",
              label: "Link to",
              description: "When 'Enable Dropdown Menu' is 'False' this link is where the button will go, leave blank if enabeling drop down menu",
              type: "string"
            },
            {
              name: "drop",
              label: "Enable Dropdown Menu",
              type: "string",
              options: [
               "true",
                "false",
              ],
            },
            {
              name: "links",
              label: "Dropdown Menu Links",
              description: "This will only work if 'Enable Dropdown Menu' is 'True'",
              type: "object",
              list: true,
              ui: {
                // This allows the customization of the list item UI
                // Data can be accessed by item?.<Name of field>
                itemProps: (item) => {
                  return { label: `${item?.name}`}
                },
              },
              fields: [
                {
                  name: "name",
                  label: "Name",
                  type: "string",
                  description: "How the button will appear in the drop down menu, NOT the link it will execute"
                },
    
                {
                  name: "url",
                  label: "Link to",
                  description: "The link to go to",
                  type: "string"
                },
              ],
            },
          ],
        },
      ]
     },
     {
      name: "index",
      label: "Home Page Config",
      path: "_data",
      ui: {
        allowedActions: {
          create: false,
          delete: false,
        },
      },
      match: {
          // name of the data file
          include: "index",
      },
     format: "yaml",
     fields: [
      {
        label: "Banner Image",
        name: "banner",
        type: "object",
        fields: [
          {
            label: "Image",
            name: "imageurl",
            nameOverride: 'image-url',
            type: "image"
          },
          {
            label: "Image Align",
            name: "imagealign",
            nameOverride: 'image-align',
            type: "string",
            options: [{
              value: "top",
              label: "Top"
            }, 
            {
              value: "left",
              label: "Left"
            },
            {
              value: "center",
              label: "Center"
            },
            {
              value: "right",
              label: "Right"
            },
            {
              value: "bottom",
              label: "Bottom"
            },
            {
              value: "inherit",
              label: "Inherit/Default"
            },

          ]
          },
          {
            label: "Header",
            name: "header",
            type: "string"
          },
          {
            label: "Sub Header",
            name: "subheader",
            type: "string"
          },
        ]
      },
      {
        label: "Subbanner Text",
        name: "subbanner",
        type: "object",
        fields: [
          {
            label: "Header",
            name: "text",
            type: "string"
          },
          {
            label: "Sub Header",
            name: "subtext",
            type: "rich-text"
          },
        ]
      },
      {
      label: "Text/Image Columns",
      name: "content",
      type: "object",
      list: true,
      ui: {
        // This allows the customization of the list item UI
        // Data can be accessed by item?.<Name of field>
        itemProps: (item) => {
          // console.log(item)
          return { label: `${item?.header.children[0].children[0].text}`}
        },
      },
      fields: [
        {
          label: "Header",
          name: "header",
          type: "rich-text"
        },
        {
          label: "Content",
          name: "content",
          type: "rich-text"
        },
        {
          label: "Glyph",
          name: "glyph",
          type: "image",
        },
        {
          label: "Image",
          name: "image",
          type: "image",
        },
      ]
      },
     ],
     },
     //start
     {
      name: "contact",
      label: "Contact Page Config",
      path: "_data",
      ui: {
        allowedActions: {
          create: false,
          delete: false,
        },
      },
      match: {
          // name of the data file
          include: "contact",
      },
     format: "yaml",
     fields: [
      {
        label: "Contact Info",
        name: "contacts",
        type: "object",
        list: true,
        ui: {
          // This allows the customization of the list item UI
          // Data can be accessed by item?.<Name of field>
          itemProps: (item) => {
            // console.log(item)
            return { label: `${item?.address}`}
          },
        },
        fields: [
          {
            label: "Type",
            name: "type",
            type: "string"
          },
          {
            label: "Address",
            name: "address",
            type: "string"
          },
          {
            label: "Description",
            name: "name",
            type: "string",
          },
        ]
      },
      {
        name: 'images',
        label: 'Image Slideshow',
        type: 'object',
        list: true,
        ui: {
          // This allows the customization of the list item UI
          // Data can be accessed by item?.<Name of field>
          itemProps: (item) => {
            return { label: `${item?.alt}`}
          },
        },
        fields: [
          {
            name: 'src',
            label: 'Slideshow Image',
            type: 'image',
          },
          {
            name: 'alt',
            label: 'Image Description',
            type: 'string',
          },
        ]
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
            robotName: 'Unnamed Robot',
            metatitle: `${new Date(Date.now()).getFullYear()} Robot: ROBOT NAME`,
            metadesc: `GAME NAME Performance and Statistics`,
          }
        },
        ui: {
          filename: {
            // if disabled, the editor can not edit the filename
            readonly: true,
            // Example of using a custom slugify function
            slugify: values => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${values?.year}`
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
            name: 'techBinder',
            label: 'Technical Binder',
            type: 'image',
          },
          {
            name: 'buizBinder',
            label: 'Business Binder',
            type: 'image',
          },
          {
            name: 'game',
            label: 'Game Name',
            type: 'string',
          },
          {
            name: 'matchVideoPlaylist',
            label: 'Youtube Match Playlist (Just the ID, IE "PLGO1K1mUB0_vJL2rH7uOtTbCbrRHuY6us")',
            type: 'string',
          },
          {
            name: 'thumbnail',
            label: 'Thumbnail Image',
            type: 'image',
          },
          {
            name: 'slideshow',
            label: 'Top Left Corner Slideshow Photos (Supplemental, the main ones are supplied by The Blue Alliance)',
            type: 'object',
            list: true,
            ui: {
              // This allows the customization of the list item UI
              // Data can be accessed by item?.<Name of field>
              itemProps: (item) => {
                return { label: `${item?.src}`}
              },
            },
            fields: [
              {
                name: 'src',
                label: 'Slideshow Image',
                type: 'image',
              },
            ]
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

      {
        name: "committees",
        label: "Committees",
        path: "/_committees",
        fields: [
          {
            name: 'title',
            label: 'Committee Name (Top Left Text)',
            type: 'string',
          },
          {
            name: 'topcornerimage',
            label: 'Top Left Image',
            type: 'image',
          },
          {
            name: 'toprighttitle',
            label: 'Top Center Title',
            type: 'rich-text',
          },
          {
            name: 'toprighttext',
            label: 'Top Center Paragraph',
            type: 'rich-text',
          },
          {
            name: 'middlerightimage',
            label: 'Top Center Image',
            type: 'image',
          },
          {
            name: 'middlelefttitle',
            label: 'Bottom Center Title',
            type: 'rich-text',
          },
          {
            type: "rich-text",
            name: "middlelefttext",
            label: "Bottom Center Paragraph",
          },
          {
            label: "Bottom Center Image",
            name: "bottomleftimage",
            type: "image",
            },
          
            {
              label: "Useful Links / Resources",
              name: "resources",
              type: "object",
              list: true,
              ui: {
                // This allows the customization of the list item UI
                // Data can be accessed by item?.<Name of field>
                itemProps: (item) => {
                  return { label: `${item?.name}`}
                },
              },
              fields: [
                {
                  name: "name",
                  label: "Display Name",
                  type: "string",
                },
                {
                  name: "link",
                  label: "Link or URL (Can be to a page on the website or external)",
                  type: "string",
                },
              ],

            }, 
        ],
      },


 
      {
        name: "sponsors",
        label: "Sponsors",
        path: "_data",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
            // name of the data file
            include: "sponsors",
        },
      format: "yml",
      fields: [
        {
          label: "Sponsor Benefits Description",
          name: "text",
          type: "object",
          list: false,
          fields: [
            {
              label: "Header",
              name: "header",
              type: "string"
            },
            {
              label: "Explenation Paragraph",
              name: "p1",
              type: "rich-text"
            },

            {
              label: "Benefits Paragraph",
              name: "p2",
              type: "rich-text"
            }
          ]
        },
        {
        label: "Sponsors",
        name: "sponsors",
        type: "object",
        list: true,
        ui: {
          // This allows the customization of the list item UI
          // Data can be accessed by item?.<Name of field>
          itemProps: (item) => {
            return { label: `${item?.name} (${item?.sponsortier})`}
          },
        },
        fields: [
          {
            label: "Name",
            name: "name",
            type: "string"
          },
          {
            label: "Sponsor Tier",
            name: "sponsortier",
            type: "string",
            options: [
              {
                value: "Title",
                label: "Title",
              }, 
              {
                value: "Platinum",
                label: "Platinum",
              },
              {
                value: "Gold",
                label: "Gold",
              },
              {
                value: "Silver",
                label: "Silver",
              },
              {
                value: "Bronze",
                label: "Bronze",
              },
            ],
          },
          {
            label: "Sponsor Summary",
            name: "summary",
            type: "rich-text"
          },
          {
            label: "Website",
            name: "website",
            type: "string"
          },
          {
            label: "Display Name Only",
            name:"isNameOnly",
            type: "boolean",
          },
          {
            label: "Logo",
            name: "image",
            type: "image"
          },
          {
            label: "Hide from Sponsor List",
            name:"hidden",
            type: "boolean",
          },

        ]
      },

      ],
      },

      {
        name: "faq",
        label: "Frequently Asked Questions",
        path: "_data",
        ui: {
              allowedActions: {
                create: false,
                delete: false,
              },
            },
            match: {
                // name of the data file
                include: "faq",
        },
          format: "yml",
          fields: [
            {
              label: "Frequently Asked Questions",
              name: "faqs",
              type: "object",
              list: true,
              ui: {
                // This allows the customization of the list item UI
                // Data can be accessed by item?.<Name of field>
                itemProps: (item) => {
                  return { label: `${item?.question}`}
                },
              },
              fields: [
                {
                  name: "question",
                  label: "Question",
                  type: "string",
                },
                {
                  name: "answer",
                  label: "Answer",
                  type: "rich-text"
                }
              ]
            }
          ]
      },

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

     
    ],
  },

  search: {
    tina: {
      indexerToken: searchToken,
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100
  },

});
