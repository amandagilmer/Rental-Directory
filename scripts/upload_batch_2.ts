
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const IMAGES = [
    {
        slug: 'rv-rental',
        path: '/Users/amandagilmer/.gemini/antigravity/brain/895072d4-5e41-4f19-bbd3-1e371bb32c5c/category_rv_rental_1767296753443.png',
        contentType: 'image/png'
    },
    {
        slug: 'dumpster-rental',
        path: '/Users/amandagilmer/.gemini/antigravity/brain/895072d4-5e41-4f19-bbd3-1e371bb32c5c/category_dumpster_rental_1767296807048.png',
        contentType: 'image/png'
    }
];


async function uploadImages() {
    for (const img of IMAGES) {
        // Correct slugs based on DB check
        // Hotshot Trucking -> "hotshot-trucking"
        // Heavy Haul -> "heavy-haul"
        const targetSlug = img.slug === 'hotshot' ? 'hotshot-trucking' : img.slug;

        console.log(`Uploading ${img.slug} for category ${targetSlug}...`);

        try {
            const fileContent = fs.readFileSync(img.path);
            const fileName = `${targetSlug}-${Date.now()}.png`;

            const { data, error } = await supabase.storage
                .from('category-images')
                .upload(fileName, fileContent, {
                    contentType: img.contentType,
                    upsert: true
                });

            if (error) {
                console.error(`Failed to upload ${targetSlug}:`, error);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('category-images')
                .getPublicUrl(fileName);

            console.log(`SUCCESS_URL: ${targetSlug} | ${publicUrl}`);

        } catch (err) {
            console.error(`Error processing ${img.slug}:`, err);
        }
    }
}

uploadImages();
