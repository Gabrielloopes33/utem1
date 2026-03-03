#!/usr/bin/env node
/**
 * Script to generate embeddings for all documents without embeddings
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../src/lib/ai/embeddings';

async function generateEmbeddings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Fetching documents without embeddings...\n');

  // Get all documents without embeddings
  const { data: documents, error: fetchError } = await supabase
    .from('knowledge_documents')
    .select('id, title, content')
    .is('embedding', null);

  if (fetchError) {
    console.error('❌ Error fetching documents:', fetchError.message);
    process.exit(1);
  }

  if (!documents || documents.length === 0) {
    console.log('✅ All documents already have embeddings!');
    return;
  }

  console.log(`📝 Found ${documents.length} documents without embeddings\n`);

  // Generate embeddings in batches
  const batchSize = 5;
  let generated = 0;
  let errors = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    console.log(`⚙️  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}...`);
    
    await Promise.all(
      batch.map(async (doc) => {
        try {
          const text = `${doc.title}\n\n${doc.content}`;
          const embedding = await generateEmbedding(text);

          const { error: updateError } = await supabase
            .from('knowledge_documents')
            .update({ embedding })
            .eq('id', doc.id);

          if (updateError) {
            console.error(`  ❌ Error saving embedding for "${doc.title.substring(0, 50)}...":`, updateError.message);
            errors++;
          } else {
            console.log(`  ✅ ${doc.title.substring(0, 60)}...`);
            generated++;
          }
        } catch (err) {
          console.error(`  ❌ Error generating embedding for "${doc.title.substring(0, 50)}...":`, err);
          errors++;
        }
      })
    );
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📈 Total: ${documents.length}`);

  if (errors === 0) {
    console.log('\n🎉 All embeddings generated successfully!');
  } else {
    console.log('\n⚠️  Some embeddings failed. Check the errors above.');
    process.exit(1);
  }
}

generateEmbeddings().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
