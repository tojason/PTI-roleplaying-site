# Quick Database Setup with Supabase

## 1. Create Free Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create new project (name: "police-training-app")
4. Wait for database to provision (~2 minutes)

## 2. Get Connection String
1. Go to Settings → Database
2. Copy the "Connection string" from the URI section
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 3. Update .env File
Replace the DATABASE_URL in your .env file with the Supabase connection string:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public"
```

## 4. Push Schema to Supabase
```bash
npx prisma db push
```

## 5. Start Your App
```bash
npm run dev
```

That's it! Your app will now use the cloud database.