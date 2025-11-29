# 🍔 FoodDeliveryApp  
### An Open-Source, Real-Time Food Delivery Platform with Full Logistics & Payroll Automation  

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?logo=spring&logoColor=white)](https://spring.io)
[![Angular](https://img.shields.io/badge/Angular-DD0031?logo=angular&logoColor=white)](https://angular.io)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

> A scalable, production-ready food delivery ecosystem supporting **4 user roles**, **real-time order tracking**, **automated payroll**, and **secure financial settlements** — built entirely with modern open-source tech.

---

## 🌟 Overview

**FoodDeliveryApp** is a full-stack platform enabling end-to-end food delivery operations — from ordering and dispatch to rider management and financial reconciliation.

Unlike commercial SaaS solutions, this system is **self-hostable**, **map-cost-free** (thanks to Leaflet + OpenStreetMap), and engineered for operational transparency — ideal for startups, cooperatives, or enterprise pilots.

✅ **4 Role-Based Portals**  
✅ **Live Location Tracking** on interactive maps  
✅ **Automated Monthly Payroll & Commission Handling**  
✅ **Real-Time Updates** via WebSockets  
✅ **Geospatial Analytics** with PostGIS  
✅ **Professional PDF Reporting** via JasperReports  

---

## 🛠️ Tech Stack

| Layer             | Technologies                                                                 |
|-------------------|------------------------------------------------------------------------------|
| **Frontend**      | Angular 16+, TypeScript, Tailwind CSS, **Leaflet.js** (42 KB, mobile-friendly, no dependencies) |
| **Map Layer**     | **OpenStreetMap** (free tiles) + **Nominatim** (geocoding) + optional **OSRM** routing |
| **Backend**       | Spring Boot 3, Java 17+, Spring Security, Spring Data JPA, Spring WebSocket (STOMP), Spring Scheduler |
| **Reporting**     | **JasperReports** — for dynamic, printable **PDF receipts, payroll statements & financial reports** |
| **Security**      | JWT (stateless auth), BCrypt, RBAC, CSRF/CORS protection                   |
| **Database**      | **PostgreSQL 18.1** (latest stable, Nov 2025) with **PostGIS** extension    |
| **Realtime**      | WebSockets (STOMP over SockJS) for live order/rider status sync            |
| **DevOps**        | Docker, GitHub Actions, PostgreSQL + PostGIS Docker image                  |

> 🌍 **Why Leaflet?**  
> _“Leaflet is the leading open-source JavaScript library for mobile-friendly interactive maps. Weighing just ~42 KB of JS, it has all the mapping features most developers ever need.”_ — [leafletjs.com](https://leafletjs.com)  
> ✅ Lightweight · ✅ No external deps · ✅ Smooth on mobile · ✅ Highly extensible

> 🐘 **PostgreSQL 18.1** (Released 2025-11-13)  
> Latest stable release with security fixes & performance improvements. Fully compatible with PostGIS for geospatial operations.

---

## 🧩 Key Features

### 👤 Customer Portal
- Real-time location detection & manual pin placement on **OSM map**
- Browse restaurants, filter menus, apply coupons
- Live order tracking with OTP-secured delivery handoff
- Order history, reordering, & ratings

### 🏪 Restaurant Panel
- Manage **multiple outlets** under one account
- Add/edit food items with images & pricing
- Accept orders → mark *"Ready for Pickup"*
- Print thermal receipts (with map snapshot support)

### 🛵 Rider Dashboard
- Toggle *Online/Offline* (breaks auto-included in shift)
- Live navigation: **Restaurant → Customer** (Leaflet + routing)
- Shift management: start/end, breaks, overtime
- Earnings breakdown: base pay + bonus − late deductions
- Daily COD collection logging

### 👨‍💼 Admin Console
- Approve & pin restaurants on map
- **Drag-and-drop order → rider assignment**
- Geospatial analytics: heatmaps, delivery zones, top items
- **Automated financial engine**:
  - Record rider COD collections
  - Settle restaurant payouts (after configurable commission %)
  - Generate **monthly payroll** (scheduled via Spring `@Scheduled`)
  - Configurable pay rules (hourly rate, bonus, penalties)
  - **Dual-signed PDF receipts** (vendor + company)

### 📄 Reporting (via JasperReports)
- 🧾 Payment receipts with digital signatures
- 📊 Rider payroll statements (daily/monthly)
- 📑 Restaurant settlement summaries
- 📈 Admin financial & order analytics reports  
- Templates built in **Jaspersoft Studio** (`.jrxml`), compiled & rendered at runtime

### 🔌 System-Wide
- 🔔 WebSocket-powered real-time notifications  
- 🔐 JWT-based authentication with role guards  
- 🌐 Fully responsive UI (Tailwind + Angular Flex Layout)  
- 📊 PostGIS-powered location analytics (`ST_Distance`, `ST_Contains`, etc.)

---

## 🗺️ Architecture

```mermaid
flowchart LR
    subgraph Frontend
        A[Angular + Tailwind]
        B[Leaflet.js + OSM]
    end

    subgraph Backend
        C[Spring Boot REST API]
        D[Spring WebSocket<br/>(STOMP)]
        E[Spring Security + JWT]
        F[Spring Scheduler]
        K[JasperReports<br/>(PDF Generation)]
    end

    subgraph Database
        G[(PostgreSQL 18.1<br/>+ PostGIS)]
    end

    subgraph External
        H[OpenStreetMap<br/>Tiles & Nominatim]
        I[OSRM Routing<br/>(Optional)]
        J[Redis<br/>(Optional Cache)]
    end

    A -->|HTTP/HTTPS| C
    B -->|Map Tiles / Geocoding| H
    B -->|Routing Requests| I
    C -->|JPA / Spatial Queries| G
    D -->|Realtime Updates| A
    E -->|AuthZ / AuthN| C
    F -->|Monthly Payroll Trigger| C
    K -->|Generate PDF<br/>Receipts & Statements| C
    G -->|Geospatial Data| C
    J -->|Session / Cache| C

图表渲染失败
