# Tayara Travel Insurance — End-to-End Process Workflow

This document provides a comprehensive technical and operational breakdown of the entire **Tayara Travel Insurance** lifecycle: from the initial quote calculation and pricing engine algorithms, through traveler passport entry and order creation, to payment processing, live policy issuance, and public QR verification.

---

## High-Level Lifecycle Overview

```
[1. Trip Inputs] ────────> [2. Pricing Engine] ───────> [3. Plan Selection]
Destination, Dates,         Multipliers: Age, Dest,       Start (€30k), Comfort (€50k)
Travelers, Travel Type       Travel Type, Add-ons          Premium (€100k)
                                  │                               │
                                  ▼                               ▼
[6. Policy Issuance] <──── [5. Payment Checkout] <──── [4. Traveler Info & Order]
Consular Policy Number,     Stripe / Mock Gateway,        Passport Details, Lead Buyer,
A4 PDF Certificate,         Status: PAID -> ISSUED        Status: PENDING_PAYMENT
Scannable Public QR                                       (Idempotent Creation)
```

---

## Phase 1: Input Collection & Trip Parameters

The user enters trip details in the quote calculator (`HeroQuoteCalculator.jsx`).

### Captured Parameters:
1. **Destination (`destination_id`)**: Selected country or region (e.g., Schengen Zone, Worldwide, Turkey, UAE).
2. **Travel Dates (`start_date`, `end_date`)**: ISO date format (`YYYY-MM-DD`).
   - Duration in days is computed as:
     $$\text{Duration} = (\text{end\_date} - \text{start\_date}) + 1$$
3. **Travelers (`travelers_ages`)**: Array of passenger ages (e.g., `[30, 28, 5]`).
4. **Travel Purpose / Activity Tier (`travel_type_id`)**:
   - `CALM` (Relaxed sightseeing, leisure)
   - `ACTIVE` (Winter sports, trekking, cycling)
   - `EXTREME` (High-risk sports, mountaineering, diving)
   - `VISIT_VISA` (Family/tourist visit visa, embassy compliance)

### Frontend State Persistence:
All search parameters and generated quotes are synchronized to `sessionStorage` via `BookingContext.jsx`. This ensures that refreshing the browser does not clear quotes or reset the user's booking step.

---

## Phase 2: Pricing Engine & Multi-Plan Quote Calculation

When the user clicks **"Calculate Quote"**, the frontend sends a request to the backend pricing engine:

- **Endpoint**: `POST /api/v1/quotes/calculate/`
- **Backend Controller**: `CalculateQuoteView` (`backend/apps/quotations/views.py`)
- **Core Service**: `PricingEngine.calculate_plan_price` (`backend/apps/pricing/services.py`)

### Pricing Formula:
For each active insurance plan ($p$), the price per traveler ($t$) per day is determined by:

$$\text{Daily Rate}_t = \text{Base Price}_p \times \text{Age Multiplier}_t \times \text{Destination Multiplier} \times \text{Travel Type Multiplier}$$

1. **Base Price per Day (`base_price_per_day`)**: Set on the `Plan` model (e.g., €1.50 for Start, €2.20 for Comfort, €3.50 for Premium).
2. **Age Multipliers**:
   - Age 0 – 17: **0.85x** (Child rate)
   - Age 18 – 64: **1.00x** (Standard adult)
   - Age 65 – 70: **1.50x** (Senior tier 1)
   - Age 71 – 75: **2.00x** (Senior tier 2)
   - Age 76+: **3.00x** (Senior tier 3)
3. **Destination Risk Multipliers**:
   - Schengen Zone: **1.00x**
   - Worldwide (excluding US/Canada): **1.25x**
   - Worldwide (including US/Canada): **1.50x**
4. **Travel Type Multipliers**:
   - `CALM`: **1.00x**
   - `ACTIVE`: **1.25x**
   - `EXTREME`: **1.75x**
   - `VISIT_VISA`: **1.00x**
5. **Add-on Coverages**: Sum of selected daily or fixed add-on costs.
6. **Promotions**: If a promo code is provided, percentage or fixed discounts are deducted:
   $$\text{Final Total} = (\text{Subtotal} + \text{Add-ons}) - \text{Discount}$$

### Database Output:
- Creates a `Quote` record in PostgreSQL with `status = CALCULATED` and a unique `quote_number` (format: `QT-YYYY-XXXXXX`).
- Creates associated `QuoteTraveler` records for each insured passenger.
- Returns a list of quotes for all active plan options with breakdown breakdowns.

---

## Phase 3: Plan Selection & Discount Validation

In `PlanComparisonCards.jsx` (Step 2 of the booking process):
- Displays plan comparison cards side-by-side with cover limits, deductible (€0), and included benefits.
- **Promo Code Validation**: `POST /api/v1/promotions/validate/` checks promo validity and recalculates plan totals in real time.
- Clicking **"Select Plan"** records `selectedPlanOption` into `BookingContext` and fetches the active quote via `GET /api/v1/quotes/<quote_number>/`.
- Advances the user smoothly to Step 3.

---

## Phase 4: Traveler Information & Idempotent Order Creation

In `TravelerForm.jsx` (Step 3 of the booking process):
- **Lead Buyer Information**: Full Name, Email, Phone (WhatsApp support).
- **Traveler Information (for each passenger)**:
  - First Name & Last Name (as in machine-readable passport zone).
  - Date of Birth & Gender.
  - Passport Number & Passport Expiration Date.
  - Citizenship / Nationality.

### Order Creation API:
- **Endpoint**: `POST /api/v1/orders/create/`
- **Backend Controller**: `CreateOrderView` (`backend/apps/orders/views.py`)

### Idempotency & Re-entry Guarantee:
To prevent quote-conversion errors when users edit passenger details or retry checkout:
1. `CreateOrderFromQuoteSerializer` checks if an order already exists for this quote in `status = PENDING_PAYMENT`.
2. If an order exists in `PENDING_PAYMENT`, `CreateOrderView` **updates the contact details and travelers in-place** and returns HTTP 200 OK with the existing order.
3. If no order exists, a new `Order` record is created with:
   - Unique order number (e.g., `ORD-YYYY-XXXXXX`).
   - `status = PENDING_PAYMENT`.
   - `order_snapshot`: An immutable JSON snapshot capturing the exact destination, dates, plan code, medical limit display (`€30,000` / `€50,000` / `€100,000`), and traveler breakdown.
   - Quote status is transitioned to `CONVERTED`.

---

## Phase 5: Payment Processing

The user is presented with the checkout modal (`PaymentModal.jsx`).

- **Endpoint**: `POST /api/v1/payments/checkout/`
- **Backend Controller**: `CheckoutView` (`backend/apps/payments/views.py`)
- **Supported Providers**: Stripe, Card Simulator (Mock Gateway).

### Workflow:
1. Validates that the order is in `PENDING_PAYMENT` status and total > 0.
2. Interacts with the payment provider to process the transaction.
3. Creates a `Payment` record with transaction ID and provider response.
4. Transitions order status:
   $$\text{PENDING\_PAYMENT} \longrightarrow \text{PAID} \longrightarrow \text{ISSUED}$$
5. Automatically triggers `PolicyService.issue_policy_for_order(order)`.

---

## Phase 6: Live Policy Underwriting & Issuance

- **Service**: `PolicyService.issue_policy_for_order` (`backend/apps/policies/services.py`)

### Issuance Steps:
1. Checks if a policy has already been issued for this order (prevents duplicate policies).
2. Generates a unique consular policy number:
   $$\text{TAYARA-YYYY-XXXXXXX}$$
3. Assembles the immutable `certificate_data` dictionary:
   - Consular compliance declaration under **Regulation (EC) No 810/2009**.
   - Insured travelers with masked passport numbers (e.g., `AB****67`).
   - Coverage territory, valid start and end dates.
   - 24/7 International Assistance hotlines, WhatsApp, and email.
   - Medical indemnity limits (`€30,000`, `€50,000`, or `€100,000`).
4. Creates the `Policy` model record in PostgreSQL with `status = ISSUED`.
5. Sets `order.status = ISSUED`.

---

## Phase 7: Document Formatting & Public QR Verification

### A4 Document Formatting (`PolicyCertificate.jsx`):
- Designed strictly to fit **on a single A4 page** in print and PDF export.
- Features `@page { size: A4 portrait; margin: 6mm 8mm; }` with non-printable components (`Navbar`, `Footer`, celebration banner) set to `display: none !important;`.
- Uses `break-inside: avoid;` to prevent awkward splits across sections.
- Contains:
  - Official Tayara crest, logo, and European Parliament & Council accreditation notice.
  - Trip parameters grid (Territory, Plan, Valid From, Valid Until).
  - Insured travelers table with medical limits.
  - Summary of covered benefits (Hospitalization, Repatriation 100%, COVID-19, €0 Deductible).
  - 24/7 Emergency Coordinator assistance box.
  - Authorized electronic seal stamp and digital signature.

### Public QR Verification (`PublicPolicyModal.jsx`):
- The document dynamically generates a high-resolution QR code encoding the public verification URL:
  ```text
  https://<domain>/?verify=TAYARA-YYYY-XXXXXXX
  ```
- **When scanned with any smartphone camera**:
  1. The browser opens the Tayara domain with `?verify=TAYARA-...`.
  2. `App.jsx` intercepts the parameter on page load.
  3. Queries the public verification API (`/api/v1/policies/validate/<number>/` and `/api/v1/policies/<number>/`).
  4. Launches `PublicPolicyModal.jsx` showing the verified consular validity status, covered travelers, and printable official certificate.
  5. **No login or password is required** — accessible to consular officers, border agents, and travelers worldwide.

---

## Phase 8: Quote & Order Lifecycle Management

Clients can manage their quotes and orders through the Client Dashboard (`UserDashboard.jsx`).

### 1. Removing Unconverted Quotes:
- **API**: `DELETE /api/v1/quotes/<quote_number>/` (`QuoteDetailView.delete`)
- **Rules**:
  - Only quotes in `CALCULATED` or `EXPIRED` status can be deleted.
  - Quotes in `CONVERTED` status are locked to protect the order audit trail.
  - In the dashboard **Saved Quotes** tab, users have a **"Discard"** trash icon to remove unconverted quotes.

### 2. Cancelling Unissued Orders:
- **API**: `POST /api/v1/orders/<order_number>/cancel/` (`CancelOrderView`)
- **Rules**:
  - Orders in `PENDING_PAYMENT` or `DRAFT` can be cancelled by the customer.
  - Cancelling an order **automatically reverts the linked quote status from `CONVERTED` back to `CALCULATED`**, allowing the user to either reuse the quote or discard it.
  - In the dashboard **My Orders** tab, pending orders display a **"Cancel Order"** button.

### 3. Deleting Cancelled Orders:
- **API**: `DELETE /api/v1/orders/<order_number>/` (`OrderDetailView.delete`)
- **Rules**:
  - Users can delete `CANCELLED` or `PENDING_PAYMENT` orders from their list.
  - **Strict Safeguard**: Orders in `PAID`, `ISSUED`, or `REFUNDED` status can **never** be deleted to preserve the legal and financial records required by payment gateways and consular authorities.

---

## System State Machine Summary

### Quote Statuses:
$$\text{DRAFT} \longrightarrow \text{CALCULATED} \overset{\text{Checkout}}{\longrightarrow} \text{CONVERTED}$$
$$\text{CALCULATED} \overset{\text{Timeout}}{\longrightarrow} \text{EXPIRED}$$
$$\text{CALCULATED} \overset{\text{User action}}{\longrightarrow} \text{DELETED}$$
$$\text{CONVERTED} \overset{\text{Order Cancelled}}{\longrightarrow} \text{CALCULATED (Reverted)}$$

### Order Statuses:
$$\text{PENDING\_PAYMENT} \overset{\text{Payment}}{\longrightarrow} \text{PAID} \overset{\text{Underwrite}}{\longrightarrow} \text{ISSUED}$$
$$\text{PENDING\_PAYMENT} \overset{\text{User / Timeout}}{\longrightarrow} \text{CANCELLED} \overset{\text{User action}}{\longrightarrow} \text{DELETED}$$
$$\text{ISSUED} \overset{\text{Refund request}}{\longrightarrow} \text{REFUNDED (Locked from deletion)}$$
