# Refactoring Our Store To Use Database
Current our store is call the `renderStoreDocumentsFromBackOffice` function from `backend.js`. As you can see everything is working, but if you remember from [Section 2]() I said this method is not suggested.

Here were the downsides of using the BackOffice listed in Section 2:

> If you want to use custom workspaces, view preferences, PDF export settings that change based on the document used then it is very difficult to tie these things to particular documents without a complex setup. In addition, if you require meta data for your frontend experience, such as displaying documents based on season or project, then you must use a complex folder structure which does not scale well.

Looking back at [Section 5]() try to imagine how you would tie in a specific PDF Export Settings into opening the Editor by using the BackOffice alone.

Let's review some solutions:
- You could store it in the document XML, but that makes changing the PDF Export Setting very difficult as you would need to update every document and copied document.
- You could store the ID on the document name, but then you still have the problem changing the PDF Export Setting and worse what happens when you want to use a custom Workspace or View Preference.
- You could create some type of folder naming scheme, but that just adds complexity

The real answer is you cannot tie a specific PDF Export Settings to a specific document (and all it's copies) without awkward solutions that do not scale well.

The only solution is a database.

## More database pros ✅
Remember that cleanup problem we discussed in [Section 5]() - the one about how you would clean up copied documents. Well with a database, the cleanup is easy because you can store the date of creation in the database and just query all documents before X date for a cleanup script.

Remember the users folder we setup and are storing temp files and order in? Well with a database, we do not need such a folder structure.

In fact, with a database we do not even need a store folder.

We could instead have any folder system, because the database will just map to the document ID.

What about metrics? Publisher has no built in metrics, but we could store such metrics in our database.
What about generating PDFs? There is not way to track PDF tasks IDs and link them to a specific document in Publisher, but we can store these things in a database.
What about custom meta data for document type, price, season, sale, etc.? There is no easy way to do this in Publisher, but we can with a database.

Our you starting to see my point? Creating an Publisher integration without also having a database to track these things in my opinion is a project that does not scale well.

I have seen clients do it, but they always run into workflow issues because they are limited by Publisher's limited file management system. Publisher is an editor, not a DAM or a PIM.

## Downsides 😔
It's not all upsides. I wrote in Section 02 some downsides:

>The integration is more complex as it requires a database or similar to track document IDs, but less complex that being completely external. You still need to have a the ability for a designer to to register a document created in CHILI in your system.

The complexity comes from having to update that database. A designer finishes a template, they need to now get into the database. They cannot edit the database directly, but they need to register their templates. That is the complexity, as you will need to basically build that whole workflow.

However, the downsides do not outweigh the downsides for using the BackOffice alone.

## Moving to a database
We have our fake database `database.json`, which currently has only information for caching of our API keys.