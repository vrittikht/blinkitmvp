# Blinkit Category Quest (MVP)

## 1. Overview

**Category Quest** is a gamified monthly exploration challenge for Blinkit. This MVP is a **user-facing** prototype: shop, unlock spins by exploring new categories, spin for coupons, and track progress—no admin analytics or stakeholder dashboards.

| Attribute | Detail |
| --- | --- |
| Type | User MVP / prototype |
| Audience | End users only |
| Auth | Not required |
| Payments | Mock only |
| Blinkit APIs | Not required |
| Data | Mock |

---

## 2. Problem

### 2.1 Insights from user interviews

- Users shop mainly for urgent, familiar needs.
- Purchases cluster in the same categories month after month.
- Students said they would try new categories if meaningful discounts were offered.

### 2.2 Gap

Current shopping behavior gives little reason to leave routine categories. The MVP closes that motivation gap with **exploration-based gamification** (not spend-based rewards).

### 2.3 Hypothesis

> If users are rewarded for exploring new product categories through a gamified monthly challenge, they will be more likely to purchase from at least one new category—helping Blinkit’s growth objective while giving users savings and a more engaging shop.

Out of scope for this MVP: recommendation engines, ML, and AI personalization.

---

## 3. Product: Category Quest

A monthly challenge that grants **spins** (and thus coupons) when users:

1. Place their **first order of the month** → Starter Spin  
2. Order from a **category not yet purchased that month** → additional Spin  

Cap: **3 spins per month**. Rewards **exploration**, not cart value.

---

## 4. User journeys

### 4.1 First purchase of the month

After checkout → full-screen celebration:

```
🎉 Welcome to Category Quest!

You earned your Starter Spin.

[ Spin Now ]
```

**Spin Now** opens the Spin Wheel.

### 4.2 Spin Wheel

Rewards on the wheel (examples):

| Reward |
| --- |
| ₹50 OFF Pharmacy |
| ₹80 OFF Kitchen Essentials |
| ₹75 OFF Stationery |
| ₹60 OFF Beauty |
| ₹40 OFF Home Care |
| Free Delivery |

- Wheel animation: ~3–4 seconds  
- After spin:

```
Congratulations!

You won

₹60 OFF Pharmacy

Coupon Saved

Continue Shopping
```

### 4.3 Home — Quest card

Card near the top of Home:

```
Category Quest

Monthly Progress

Starter Spin ✅

Explore 1 New Category   ⬜
Explore 2 New Categories ⬜

Spins Remaining  2 / 3

View Progress
```

### 4.4 Later purchases

| Scenario | Behavior |
| --- | --- |
| Same category again (e.g. Snacks → Snacks) | No new spin. Prompt to explore another category. |
| New category (e.g. Snacks → Pharmacy) | Celebration + Spin Now → wheel |
| Second distinct new category | Final (3rd) spin unlocked |

Duplicate categories in the same month never grant extra spins.

---

## 5. Progress Dashboard

Dedicated screen for the current month (e.g. July Category Quest).

**Milestones**

```
Starter Spin        ✅
New Category #1     ✅
New Category #2     ⬜

Spins Earned  ⭐⭐☆   2 / 3
```

**Categories explored**

```
✓ Snacks
✓ Pharmacy
⬜ Kitchen Essentials
⬜ Stationery
⬜ Beauty
⬜ Home Care
```

**Active coupons**

```
My Coupons

₹60 OFF Pharmacy
Expires in 28 days
[ Redeem ]
```

---

## 6. Mock catalog

### 6.1 Categories (minimum set)

Snacks · Dairy · Fruits & Vegetables · Frozen Foods · Bakery · Pharmacy · Personal Care · Home Cleaning · Kitchen Essentials · Stationery · Pet Care · Baby Care

### 6.2 Products

≥ **5 products per category**. Examples:

| Category | Sample products |
| --- | --- |
| Snacks | Lay's Chips, Doritos, Kurkure, Pringles, Popcorn |
| Pharmacy | Crocin, Digene, Band-Aid, ORS, Vitamin C |
| Kitchen Essentials | Frying Pan, Storage Box, Knife Set, Cutting Board, Measuring Cups |
| Stationery | Notebook, Pens, Sticky Notes, Highlighter, Marker |

---

## 7. Business rules

| # | Rule |
| --- | --- |
| 1 | First order of the month → grant **Starter Spin** |
| 2 | Order from a category not purchased this month → grant **another Spin** |
| 3 | Maximum **3 spins** per month |
| 4 | Coupons stay active for **30 days** |
| 5 | Repeat purchases in an already-explored category → **no** additional spin |

---

## 8. Reward engine

~**20 reward templates**. Examples:

- ₹40 OFF Beauty  
- ₹50 OFF Pharmacy  
- ₹75 OFF Kitchen Essentials  
- ₹60 OFF Home Cleaning  
- ₹80 OFF Stationery  
- ₹50 OFF Frozen Foods  
- Free Delivery  
- 2× Reward Points  

Each spin randomly assigns one reward and persists it as a coupon.

---

## 9. Frontend requirements

### 9.1 Stack

Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion

### 9.2 Pages

| Page | Purpose |
| --- | --- |
| Home | Browse + Quest progress card |
| Product listing | Mock catalog by category |
| Cart | Review items before checkout |
| Checkout success | Celebration / spin unlock |
| Spin Wheel | Reward spin UX |
| Quest Dashboard | Milestones, explored categories |
| Rewards | Active coupons |

### 9.3 Animations

- Confetti on reward unlock  
- Smooth wheel rotation (~3–4s)  
- Progress animations  
- Coupon reveal  

### 9.4 Design system (Blinkit-native)

The UI must feel like a real Blinkit feature—not a separate game, futuristic dashboard, or admin panel.

| Token / pattern | Spec |
| --- | --- |
| Background | White |
| Primary | Green `#0C831F` |
| Accents | Yellow where appropriate |
| Cards | 12–16px radius, soft shadows |
| Layout | Mobile-first, clean spacing |
| Font | Inter |
| Patterns | Large product cards, Blinkit search bar, bottom nav, category icons, coupon cards, checkout flow |

Users should never feel they have left the Blinkit app.

---

## 10. Backend requirements

### 10.1 Stack

FastAPI · PostgreSQL · SQLAlchemy · REST APIs · Deploy on Railway

### 10.2 Data model

| Entity | Fields |
| --- | --- |
| **User** | `id`, `name` |
| **Categories** | `id`, `name` |
| **Products** | `id`, `category_id`, `name`, `price` |
| **Orders** | `id`, `user_id`, `category`, `created_at` |
| **Rewards** | `id`, `reward_name`, `discount`, `category`, `expiry_date` |
| **UserProgress** | `id`, `user_id`, `month`, `starter_spin_used`, `explored_categories`, `spins_earned`, `spins_remaining` |

### 10.3 APIs

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/categories` | All categories |
| `GET` | `/products` | Mock products |
| `POST` | `/checkout` | Save order; evaluate first purchase / new category; unlock spin if eligible |
| `POST` | `/spin` | Pick random reward; store coupon; return reward |
| `GET` | `/progress` | Explored categories, spins earned/remaining, milestones |
| `GET` | `/coupons` | Active coupons |

**`POST /checkout` input:** user, purchased category  

**`POST /checkout` response (shape):**

```json
{
  "spinUnlocked": true,
  "message": "...",
  "rewardEligible": true
}
```

---

## 11. Core user flow

End-to-end path a user should be able to complete:

1. Open Home  
2. Browse products  
3. Add Snacks → checkout  
4. Unlock Starter Spin → spin → win Pharmacy coupon  
5. Return Home → progress updates  
6. Buy Pharmacy → unlock second spin → spin again  
7. Dashboard: Starter Spin ✅ · Category 1 ✅ · Category 2 ⬜  
8. Buy Kitchen Essentials → unlock third spin → complete Quest  

---

## 12. Nice-to-haves (time permitting)

- Dark mode  
- Achievement badges  
- Spin sound effects  
- Animated coupon cards  

---

## 13. Deployment

| Layer | Platform |
| --- | --- |
| Frontend | Vercel |
| Backend | Railway |
| Database | PostgreSQL on Railway |

---

## 14. Deliverables

1. Mock shopping experience  
2. Monthly quest onboarding  
3. Starter Spin  
4. Spin-the-wheel animation  
5. Category progress tracking  
6. Extra spins after new-category purchases  
7. Coupon management  
8. Responsive UI  
9. Working backend APIs  
10. Deployed frontend (Vercel) + backend (Railway)  

Out of scope: admin panels, analytics / success-metric dashboards, and stakeholder-only views.