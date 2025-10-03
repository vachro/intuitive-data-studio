# Flerspråklig innhold i Mozart Portal

Dette studioet bruker en **dokument-per-språk** modell for oversettelser.

## 🌍 Støttede språk

- 🇬🇧 **English** (en)
- 🇩🇪 **Deutsch** (de)
- 🇪🇸 **Español** (es)
- 🇫🇷 **Français** (fr)
- 🇳🇴 **Norsk** (no)

## 📚 Hvilke innholdstyper kan oversettes?

- **Post** - Blogginnlegg/artikler
- **Category** - Kategorier

## 🚀 Slik oppretter du oversettelser

### Steg 1: Opprett første språkversjon
1. Gå til **Content** → **Post** (eller **Category**)
2. Klikk **"Create"**
3. Velg språk i språkvelgeren øverst i dokumentet
4. Fyll ut innhold:
   - Title (tittel på valgt språk)
   - Slug (URL-vennlig versjon, f.eks. `getting-started`)
   - Body/Content
5. Publiser dokumentet

### Steg 2: Lag oversettelser
1. Åpne dokumentet du nettopp laget
2. Klikk på **språkvelgeren** øverst (viser nåværende språk)
3. Velg **"Create [språk] translation"**
4. Fyll ut oversatt innhold
5. **Viktig:** Lag en ny slug på det nye språket (f.eks. `komme-i-gang` for norsk)
6. Publiser oversettelsen

### Steg 3: Bytt mellom språkversjoner
- Klikk på språkvelgeren for å se alle tilgjengelige oversettelser
- Klikk på et språk for å hoppe til den versjonen
- Rediger hver versjon uavhengig

## 🔗 Slik fungerer det teknisk

### Automatisk linking
- Alle språkversjoner av samme innhold lenkes automatisk sammen
- Plugin oppretter et `translation.metadata` dokument som holder styr på linkene
- Du trenger ikke gjøre noe manuelt - plugin håndterer alt

### Slugs og SEO
- Hver språkversjon har sin egen slug
- Perfekt for SEO: `/en/getting-started` vs `/no/komme-i-gang`
- Kan brukes til å bygge hreflang-tags automatisk

## 💻 Bruk i frontend (Next.js/React)

### Hent dokument med alle oversettelser

```javascript
const query = `
  *[_type == "post" && language == $language && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body,
    language,
    author->{name, image},
    categories[]->{title},
    
    "_translations": *[_type == "translation.metadata" && references(^._id)][0]
      .translations[].value->{
        language,
        "slug": slug.current,
        title
      }
  }
`

const params = {
  language: 'no',
  slug: 'min-artikkel'
}

const post = await sanityClient.fetch(query, params)
```

### Bygg hreflang-tags for SEO

```jsx
// I Next.js Head
import Head from 'next/head'

export default function Post({ post }) {
  return (
    <>
      <Head>
        {/* Canonical URL */}
        <link 
          rel="canonical" 
          href={`https://example.com/${post.language}/${post.slug.current}`} 
        />
        
        {/* Hreflang for hver oversettelse */}
        {post._translations?.map(translation => (
          <link
            key={translation.language}
            rel="alternate"
            hrefLang={translation.language}
            href={`https://example.com/${translation.language}/${translation.slug}`}
          />
        ))}
        
        {/* x-default (fallback) */}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`https://example.com/en/${post._translations?.find(t => t.language === 'en')?.slug || post.slug.current}`}
        />
      </Head>
      
      {/* Språkvelger i frontend */}
      <nav>
        {post._translations?.map(translation => (
          <a 
            key={translation.language}
            href={`/${translation.language}/${translation.slug}`}
          >
            {translation.language.toUpperCase()}
          </a>
        ))}
      </nav>
      
      <article>
        <h1>{post.title}</h1>
        {/* ... resten av innholdet */}
      </article>
    </>
  )
}
```

### Hent alle dokumenter for ett språk

```javascript
const query = `
  *[_type == "post" && language == $language] | order(publishedAt desc) {
    _id,
    title,
    slug,
    language,
    publishedAt,
    author->{name}
  }
`

const posts = await sanityClient.fetch(query, { language: 'no' })
```

## 📋 Best practices

### ✅ Gjør dette:
- Lag unike slugs for hver språkversjon
- Oversett alt innhold, ikke bruk samme tekst på tvers av språk
- Publiser oversettelser når de er komplette
- Bruk hreflang-tags i frontend for SEO

### ❌ Unngå dette:
- Ikke bruk samme slug på tvers av språk
- Ikke kopier innhold uten å oversette det
- Ikke publiser uferdige oversettelser (bruk draft)
- Ikke rediger "Translation metadata" dokumenter manuelt

## 🛠️ Teknisk info

### Plugin
- **@sanity/document-internationalization** v4.0.0
- Automatisk metadata-håndtering
- Innebygd språkvelger i Studio

### Konfigurasjon
Se `sanity.config.ts` for plugin-konfigurasjon:
```typescript
documentInternationalization({
  supportedLanguages: [
    {id: 'en', title: 'English'},
    {id: 'de', title: 'Deutsch'},
    {id: 'es', title: 'Español'},
    {id: 'fr', title: 'Français'},
    {id: 'no', title: 'Norsk'},
  ],
  schemaTypes: ['post', 'category'],
})
```

### Schema-struktur
Hver oversettbar schema har et `language`-felt:
```typescript
defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
```

## 🆘 Feilsøking

**Q: Jeg ser ikke språkvelgeren?**  
A: Sjekk at dokumenttypen er i `schemaTypes` array i plugin-konfigurasjonen.

**Q: Oversettelser vises ikke i query?**  
A: Husk å inkludere `_translations` i din GROQ-query med referanse til `translation.metadata`.

**Q: Kan jeg endre hovedspråk?**  
A: Ja, du kan starte i hvilket som helst språk. Det er ikke lenger et "hovedspråk"-konsept.

**Q: Hva er "Translation metadata" dokumentene?**  
A: Automatisk genererte dokumenter som linker språkversjoner. Du trenger ikke røre dem.

## 📚 Ressurser

- [Sanity Document Internationalization Plugin](https://www.sanity.io/plugins/document-internationalization)
- [Sanity Localization Docs](https://www.sanity.io/docs/localization)
- [GROQ Query Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
