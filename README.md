# intuitive-data-studio

# Intuitive Data Studio (Sanity)

Sanity Studio for flere nettsteder (først ut: Mozart Portal).

Studioet ligger i undermappe /studio1

## Struktur
schemaTypes/
  index.ts
  models/ (page, chapter, siteSettings)
  objects/ (imageWithCaption)

## Content model
- page: publiserbar underside (eks. “Kinder Room”) som består av en ordnet liste chapters[] (drag-and-drop).
- chapter: gjenbrukbar byggekloss (tittel, ingress, bilde m/caption, brødtekst). Felt theme styrer stripe-bakgrunn i frontend.
- siteSettings: global konfig; håndteres som singleton i Desk.

Lettvekts i18n: language (nb, en, …) + translationKey (samme nøkkel binder oversettelser).

## Kjør lokalt
npm install
npm run dev

## Next.js (GROQ-fetch for en side)
*[_type == "page" && slug.current == $slug && language == $lang][0]{
  title, "slug": slug.current,
  chapters[]->{
    title, subtitle, theme, order, language, translationKey,
    hero{image, alt, caption},
    body
  }
}

Bruk ISR + webhooks fra Sanity for revalidate, og Preview Mode for utkast.


Deummy endring