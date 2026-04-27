# Laptop Store

**[🔗 Deployed Application Link Here](https://laptop-store-3f59e.web.app/)**  

## Test Credentials

| Field      | Value              |
|------------|--------------------|
| **Email**  | `admin1@gmail.com` |
| **Password** | `admin1`         |
## How to run the project

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project folder
cd laptop-store

# Install dependencies
npm install

# Run the development server
ng serve

# Open browser at http://localhost:4200
```


## Technology Stack

- **CI/CD:** GitHub Actions (automated build & deploy)
- **Backend & Database:** Supabase (PostgreSQL database + Authentication API)
- **Frontend:** Angular (version 16+)
- **State management:** Services with RxJS Subjects, BehaviorsSubjects, Signals
- **HTTP Client:** Supabase JS client (@supabase/supabase-js)
- **Styling:** Custom CSS (no external framework)
- **Routing:** Angular Router with route guards

## Key Angular concepts used

- TypeScript interfaces (Laptop, User)
- RxJS Observables and operators (`of`, `map`, `take` and `etc`)
- Lifecycle hooks (`ngOnInit`, `ngOnDestroy` and `etc `)
- Pipes (`asyncPipe` and `etc`)
- Signals
- Angular services (dependency injection)
- Reactive Forms with validation (on create page)
- Route guards (CanActivate, Guard services)
- Error handling (modal feedback)
- Lazy loading

## Routing Structure

| Route             | Component              | Guard 
|-------------------|----------------------- |-------
| `/home`           | HomeComponent          | Public 
| `/laptops`        | AllLaptopsComponent    | Public 
| `/create`         | AddLaptopComponent     | AuthGuard 
| `/profile`        | ProfileComponent       | AuthGuard 
| `/login`          | LoginComponent         | GuestGuard
| `/register`       | RegisterComponent      | GuestGuard
| `/laptops/:id`    | LaptopDetailsComponent | Public
| `/profile/:userId`| ProfileComponent	      | AuthGuard
| `/edit/:id`       | EditLaptopComponent	   | AuthGuard, OwnerGuard




## Purpose of the application

The application is an online laptop store where users can browse laptops, register or log in, add laptops to their cart, and create their own laptop listings. Registered users can edit and delete only the laptops they have created. The application provides a personalized experience through a profile page that shows both user-created laptops and items added to the cart.

## Main user flows

1. **Registration & Login:** New users create an account using email and password. Existing users log in to access private features. (Test credentials: `admin1@gmail.com` / `admin1`)

2. **Browsing laptops:**
   - **Home page** – displays the last 5 added laptops
   - **All laptops page** – displays the full catalog

3. **Managing laptops (authenticated users only):**
   - Add a new laptop (brand, model, price, description, specifications, image URL)
   - Edit own laptops
   - Delete own laptops (with confirmation modal)

4. **Shopping cart:**
   - Add laptops to cart
   - Remove laptops from cart
   - View cart contents in the Profile page

5. **User profile:**
   - View and manage own created laptops
   - View current cart items

6. **Logout:** Ends the user session

## Explanation of the core features

- **CRUD operations:** Full Create, Read, Update, Delete support for laptops. Users can only edit and delete their own listings.

- **Shopping cart:** Users can add and remove laptops from a personal cart. Cart contents are saved per user and visible in the Profile page.

- **Route guards:** Unauthenticated users cannot access Add Laptop, Profile, or Cart routes. Logged-in users cannot access Login or Register pages.

- **User feedback modals:** Success and error modals notify users about actions (laptop added to cart, deleted, etc.). A confirmation modal appears before deleting a laptop.

- **Form validation:** All forms (registration, login, add/edit laptop) include validation rules with clear error messages.

- **Error handling:** Network errors, invalid input, and empty states are handled gracefully with user-friendly messages.



## How the user interacts with the system

- **Navigation:** The main navigation bar provides links to Home, All Laptops, Add Laptop (visible only when logged in), Profile, Login/Register, and Logout.

- **Home page:** Shows the 5 most recently added laptops with a "View Details" button for each.

- **All laptops page:** Displays the complete laptop catalog. Each laptop card shows basic info and has "Details", "Edit", "Delete" buttons (Edit/Delete visible only to the owner).

- **Add/Edit laptop form:** Users fill out a reactive form with validation. Upon success, a modal confirms the action and redirects to All laptops page.

- **Profile page:** Split view showing:
  - "My laptops" – laptops created by the logged-in user with edit/delete options
  - "My cart" – laptops added to the user's cart with remove option

- **Confirmation modals:** Before delete actions, a modal asks for confirmation. After success/failure, an appropriate modal appears.

- **State management:** Uses Angular services with RxJS Subjects, BehaviorsSubjects, and Signals. Data flows through observables with operators like `of`, `map`, `take`.

