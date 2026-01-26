# Firebase Security & Setup Guide

## 1. Why GitHub says "API Leak"
Since your website consists of HTML/JS files, your "API Key" **must** be inside the code so the browser can find your database. This is **normal** for apps like this.
GitHub warns you because it thinks it's a secret password (like for a server), but for Firebase, it's more like a "house number" - people need it to find you.

**To make it safe:** (Do this instead of hiding it)
1. Go to **Google Cloud Console** (console.cloud.google.com).
2. Select your project `zikrullah-tv`.
3. Go to **APIs & Services > Credentials**.
4. Click on your "Browser key" (the one ending in `OWac`).
5. Under **Application restrictions**, select **Websites**.
6. Add your website URL (e.g., `https://zikrullah-tv.github.io` or `localhost`).
7. **Save**. Now, even if someone steals the key, they can't use it!

## 2. Fix "No Data Saving" (Permission Error)
Your database is likely blocking writes because we are "Anonymous". You need to allow this in your rules.

1. Go to **Firebase Console** > **Firestore Database** > **Rules**.
2. **Delete** the current code.
3. **Paste** this code instead:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write (Includes Anonymous users)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**.

## 3. Enable Anonymous Login
1. Go to **Firebase Console** > **Build** > **Authentication**.
2. Click **Sign-in method** tab.
3. Enable **Anonymous**.

---

## Alternative: Use Google Sheets?
If Firebase is too difficult, we can switch to **Google Sheets**.
- **Pros**: Easy to see data, free, no "servers".
- **Cons**: Slower, setup is a bit different.

Let me know if you want to switch to Sheets!
