# FindIt: frontend

Yo'qolgan va topilgan buyumlar reyestri (universitet, savdo markazi, kutubxona, aeroport).
React + Vite, qo'shimcha UI kutubxonasiz (oddiy CSS o'zgaruvchilari), xarita: Leaflet + OpenStreetMap.

## Ishga tushirish
```cmd
npm install
copy .env.example .env
npm run dev
```
Backend (`findit_bacend`) `http://127.0.0.1:8000` da ishlab turishi kerak.

## Sozlama
| O'zgaruvchi | Izoh | Standart |
|---|---|---|
| `VITE_API_URL` | Backend manzili | `http://127.0.0.1:8000` |

`.env` o'zgarsa, `npm run dev` ni qayta ishga tushiring.

## Buyruqlar
- `npm run dev`: ishlab chiqish serveri (`http://localhost:5173`)
- `npm run build`: production yig'ish (`dist/`)
- `npm run preview`: yig'ilgan versiyani ko'rish
- `npm run lint`: kod tekshiruvi

## Tuzilma
```
src/
  api/         client.js (fetch, token, xatolar), posts.js
  context/     AuthContext.jsx
  components/  Header, Footer, Layout, Guards, PostCard, PostMap, LocationPicker, modallar
  hooks/       useCatalog, useQueue
  lib/         format.js, slug.js
  pages/       Home, Search, MapPage, PostDetail, PostForm, MyPosts, ClaimForm, MyClaims,
               Notifications, Profile, Login, How
  pages/moderation/  e'lonlar, da'volar, shikoyatlar navbati
  pages/admin/       statistika, foydalanuvchilar, kategoriya, joy, sozlamalar
```

## Rollar
- **Mehmon**: bosh sahifa, qidiruv, xarita, e'lon tafsiloti.
- **Foydalanuvchi**: e'lon berish, da'vo yuborish, xabarlar, profil.
- **Moderator**: `/moderation`, e'lon va da'volarni tekshirish, shikoyatlarni ko'rish.
- **Administrator**: `/admin`, statistika, foydalanuvchilar, kategoriya/joylar, sozlamalar.