# HORMI Showcase

HORMI.sk Website Redesign & Product Catalogue — Lovable Master Prompt

Redesign and rebuild the existing https://www.hormi.sk/ website into a modern, premium, clean and highly usable website for HORMI.

First, analyse the existing HORMI website and its current content, structure, products, branding and overall purpose. Preserve useful existing content and business information, but significantly improve the visual design, UX, navigation and product presentation.

1. Overall design direction

Create a website that feels:

Modern

Premium but approachable

Clean and uncluttered

Professional

Trustworthy

Easy to browse

Mobile-first and fully responsive

Avoid the typical generic "AI-generated website" look.

Use strong typography, generous whitespace, excellent image presentation, subtle animations and a clear visual hierarchy.

The design should feel like a professionally designed Slovak/Central European business website rather than a template.

Use the existing HORMI branding/logo where appropriate.

Do NOT unnecessarily introduce lots of gradients, excessive rounded cards, huge text, or flashy animations.

2. Homepage

Create a significantly improved homepage with:

Hero section

A strong, clean hero section that immediately explains what HORMI offers.

Include:

Clear headline

Short supporting statement

Primary CTA: "Produkty"

Secondary CTA: "Kontakt"

Use a high-quality visual/image if appropriate.

Featured products

Show a curated selection of products directly on the homepage.

Product cards should contain:

Product image

Product name

Short description

Price, if available

Category

"Detail produktu" CTA

Categories

Create a visually attractive category section so visitors can quickly navigate to the type of product they need.

Why HORMI

Add a concise section explaining why customers should choose HORMI.

Contact CTA

Finish the homepage with a strong contact/inquiry section.

3. Product catalogue — VERY IMPORTANT

The product catalogue must be one of the core features of the website.

Create a dedicated /produkty page.

Products should be displayed in a clean responsive grid.

Each product card should show:

Product image

Product name

Category

Short description

Price if available

Availability/status if applicable

"Zobraziť produkt" button

Clicking a product opens a dedicated product detail page.

Example URL:

/produkty/nazov-produktu

4. Product detail page

Create a beautiful product detail page with:

Large product image/gallery

Product name

Short summary

Full description

Price

Product specifications

Category

Additional images

Documents/downloads if available

Contact/inquiry CTA

The design should make the product easy to understand without overwhelming the user.

If a product does not have a price, display:

"Pre cenu nás kontaktujte"

with a clear contact button.

5. SIMPLE PRODUCT MANAGEMENT SYSTEM

This is extremely important.

I want to be able to maintain the products myself without editing the website code.

Create an /admin area where an administrator can:

Add product

Edit product

Delete/archive product

Change product image

Change product category

Change price

Change description

Change specifications

Change product status

Upload multiple product images

Reorder products

Mark products as featured

Use a proper database rather than hard-coded product data.

Use Supabase/Lovable Cloud if appropriate.

Implement authentication so the admin area is not publicly accessible.

6. EXCEL / CSV PRODUCT IMPORT

The most important administration feature is EASY PRODUCT IMPORT.

I want to be able to maintain my product catalogue primarily through Excel.

Create an "Import products" function in the admin area.

The workflow should be:

I upload an Excel .xlsx or CSV file.

The system reads the file.

It identifies the product columns.

It shows me a PREVIEW before importing.

I can see:

Number of products

New products

Products that will be updated

Products with missing/invalid data

I confirm the import.

Products are added/updated in the database.

The website immediately displays the updated catalogue.

Support a simple Excel structure such as:

SKUNameCategoryDescriptionPriceImage URLStatusFeatured

But make the importer flexible enough to map columns.

For example:

Excel column:
Product Name

can be mapped to:

Name

Allow the administrator to manually map Excel columns if the spreadsheet headers are different.

7. PRODUCT IMAGE IMPORT

The product image workflow should be extremely simple.

Support:

Option A — Image URL

If the Excel file contains:

Image URL

automatically use that image.

Option B — Upload images

Allow images to be uploaded directly in the admin interface.

Option C — Multiple images

Allow multiple image URLs/images per product.

Do not require me to manually edit code or database records.

8. IMPORT VALIDATION

Before importing Excel data, validate the data.

Show clear warnings for:

Missing product name

Missing category

Invalid price

Invalid image URL

Duplicate SKU

Duplicate product

Missing required fields

Do not silently import bad data.

Provide a clear import summary:

"47 products ready to import"

"42 new products"

"5 products will be updated"

"2 products have warnings"

Then provide:

Import products

9. PRODUCT SEARCH & FILTERING

The product catalogue should support:

Search

Category filtering

Sorting

Price sorting where relevant

Featured products

Search should be fast and work well on mobile.

Example:

Search:
"drill"

should immediately show relevant products.

10. Categories

Create a proper category structure.

Categories should be manageable from the admin interface.

Admin should be able to:

Create category

Rename category

Delete category

Change category order

Each category should have its own clean page.

Example:

/produkty/kategoria

11. Navigation

Create a very simple navigation:

HORMI logo

Domov

Produkty

O nás

Kontakt

Potentially include a prominent CTA:

Kontaktujte nás

On mobile, use a clean hamburger menu.

The navigation should remain visually simple.

12. Slovak language

The primary language should be Slovak.

Use natural, professional Slovak wording.

Do not use machine-translated sounding copy.

Structure the application so another language can be added later if required.

13. SEO

Build the website with SEO in mind.

Every product should have:

SEO-friendly URL/slug

Page title

Meta description

Product name

Structured content

Generate appropriate metadata dynamically for product pages and category pages.

Use semantic HTML.

Make sure product pages can be indexed individually by search engines.

14. Performance

The website should be fast.

Use:

Optimized images

Lazy loading

Responsive images

Efficient database queries

Minimal unnecessary JavaScript

Good mobile performance

Do not load the entire product catalogue unnecessarily.

15. Responsive design

The site must work beautifully on:

Desktop

Laptop

Tablet

Mobile

Pay particular attention to:

Product grid

Product images

Navigation

Filters

Product detail pages

Admin interface

Excel import workflow

16. Technical architecture

Use a clean maintainable architecture.

Preferred stack:

React

TypeScript

Tailwind

Supabase / Lovable Cloud

Proper database-backed products

Authentication for admin

Do not hard-code products into the frontend.

Create a proper product data model.

Suggested fields:

id

sku

name

slug

category_id

short_description

description

price

currency

status

featured

main_image

additional_images

specifications

sort_order

created_at

updated_at

Make the schema extensible so additional product fields can be added later.

17. Admin dashboard

Create a clean admin dashboard.

Dashboard should show:

Total products

Active products

Categories

Featured products

Last import

Import history

Main navigation:

Dashboard
Products
Categories
Import Excel
Settings

Products page should have:

Search

Filters

Sort

Edit

Archive/delete

Add product

18. Import history

Keep a simple import history.

Show:

Date/time

Filename

Number of products

Added

Updated

Errors/warnings

Allow the administrator to see what happened during previous imports.

19. Important UX principle

The website must be extremely easy to maintain.

Imagine a non-technical business owner saying:

"I received a new Excel spreadsheet with 150 products."

They should be able to:

Admin → Import Excel → Upload file → Review → Import

and the products should appear on the website.

No coding.

No database access.

No developer required.

This simplicity is more important than adding unnecessary advanced features.

20. Do not overbuild the first version

Do NOT add:

Complex ERP

Warehouse management

Complex customer accounts

Complicated checkout

Payment processing

Unnecessary animations

Marketplace functionality

The primary objective is:

Beautiful website + excellent product catalogue + extremely simple product management.

If ecommerce functionality is not currently required, treat the site primarily as a product catalogue with contact/inquiry functionality.

21. Product source options

Architect the product system so products can eventually come from multiple sources.

For V1 support:

Manual product entry

Excel/XLSX import

CSV import

Image URLs

Uploaded images

Design the architecture so that a future integration with an external website/API could also be added.

For example, eventually I may want:

"Import products from supplier website"

or

"Synchronize products from external source."

Do not implement this unless necessary for V1, but keep the architecture extensible.

22. Final quality requirement

Before considering the build complete, test the complete flow:

Visitor

Homepage → Products → Category → Product → Contact

Administrator

Login → Products → Add product → Edit product → Upload image → Save

Excel workflow

Login → Import Excel → Upload XLSX → Preview → Validate → Import → Products appear on website

Test mobile and desktop.

Make sure there are proper loading, empty, success and error states.

Do not use fake buttons or non-functional UI.

Where functionality requires backend configuration, implement the actual backend flow rather than creating a visual placeholder.

Start by analysing the current HORMI website and then build the redesigned version around this specification.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hormi-catalogue-master.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a344c9eb-34aa-4e17-a8d7-f13f76160aa4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
