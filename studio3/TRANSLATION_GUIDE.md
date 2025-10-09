# AI Translation Guide

## Setup

### 1. Add OpenAI API Key

Create a file named `.env.local` in the `studio3` folder:

```bash
# studio3/.env.local
SANITY_STUDIO_OPENAI_API_KEY=your-openai-api-key-here
```

**Get your API key:** https://platform.openai.com/api-keys

⚠️ **Important:** Never commit `.env.local` to git (it's already in .gitignore)

### 2. Restart the Studio

After adding the API key, restart your development server:
```bash
cd studio3
npm run dev
```

## How to Use AI Translation

### Overview
The translation feature uses OpenAI to automatically translate your posts and categories between languages.

### Step-by-Step Instructions

#### 1. Open a Document
- Navigate to a post or category in any language (e.g., English)
- Make sure the document is saved (draft or published)

#### 2. Start Translation
- Look for the **"Translate with AI"** button in the document actions menu (usually at the bottom of the screen)
- Click it to start the translation process

#### 3. Select Target Language
- A dialog will appear showing your current language
- Enter the target language code:
  - `en` - English
  - `de` - Deutsch (German)
  - `es` - Español (Spanish)
  - `fr` - Français (French)
  - `no` - Norsk (Norwegian)

#### 4. Wait for Translation
- The system will show a progress message
- Translation typically takes 10-30 seconds depending on content length
- Watch the browser console (F12) for progress updates

#### 5. Review Translation
- When complete, the translated content appears in the browser console
- The title and full document structure are preserved
- All links, formatting, and references remain intact

#### 6. Create New Document
- Click "+ Create" to make a new post/category
- Set the language to your target language
- Copy the translated title from the console
- Copy the translated content from the console into the body field

### What Gets Translated
✅ **Title** - Fully translated  
✅ **Body content** - All text blocks translated  
✅ **Structure** - Paragraph breaks, headings preserved  
✅ **Links** - All URL links preserved with translated link text
✅ **Formatting** - Bold, italic, and other marks preserved
✅ **Footnotes/References** - Link references kept intact

❌ **Not translated**:
- Author references (copied as-is)
- Categories (copied as-is)  
- Images (copied as-is)
- Slugs (you'll need to generate new ones)

### Important Notes

- **Link text is translated**: If you have a link that says "click here" in English, it will be translated to the target language while keeping the URL
- **Each text segment is translated individually**: Text with inline formatting is handled properly to preserve marks and links

### Customizing Translation Style

Edit `studio3/translationConfig.ts` to adjust:
- **System prompt** - Change tone, style, formality
- **Model** - Switch between GPT-4o, GPT-4o-mini, etc.
- **Temperature** - Control creativity (0.0-1.0)

Example prompt modifications:
```typescript
systemPrompt: `You are a professional translator specializing in [YOUR FIELD].
Use [FORMAL/CASUAL] tone and translate to idiomatic ${targetLanguage}...`
```

### Troubleshooting

**"OpenAI API key not found" / "API key missing"**
- Create `studio3/.env.local` with `SANITY_STUDIO_OPENAI_API_KEY=your-key`
- Restart the dev server after adding the key

**"Nothing happens when I click"**
- Check browser console (F12) for error messages
- Ensure document is saved (draft or published)
- Verify you're on a post or category document

**"Translation failed"**
- Check your OpenAI API key is valid and has the SANITY_STUDIO_ prefix
- Ensure you have API credits available  
- Check browser console (F12) for specific error details
- Verify you restarted the server after adding the API key

**Button stuck as "Translating..."**
- Refresh the page - a previous error may have left the state stuck
- Check the console for error messages

### Tips
- 💡 Translate from base language (usually English) to ensure consistency
- 💡 Review translations for technical terms and adjust if needed
- 💡 Use the document-per-language model - each translation is independent
- 💡 Links in footnotes and references are automatically preserved
