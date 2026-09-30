HOW TO TURN ON AUTOMATIC LIVESTREAMS (one time, about 10 minutes)

1. Go to https://console.cloud.google.com and sign in with a Google account.
2. Create a new project (name it "NDNB Website").
3. Go to "APIs & Services" > "Library", search "YouTube Data API v3", click Enable.
4. Go to "APIs & Services" > "Credentials" > "Create credentials" > "API key".
5. Click the new key to edit it and protect it:
   - Application restrictions: "Websites". Add:
       https://ndnbchurch.org/*
       https://www.ndnbchurch.org/*
       http://127.0.0.1/*      (for testing in VS Code)
       http://localhost/*      (for testing in VS Code)
   - API restrictions: "Restrict key" > choose only "YouTube Data API v3".
   - Save.
6. Open youtube.js and paste the key where it says PEGA_TU_API_KEY_AQUI.

That's it. From then on:
- Every new livestream shows up on the home page by itself (within ~10 minutes).
- While the church is live, an "EN VIVO AHORA" player appears above the past sermons.
- If anything goes wrong, the 3 videos written in index.html show instead,
  so the page never looks broken.
