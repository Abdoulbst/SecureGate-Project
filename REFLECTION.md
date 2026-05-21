# SecureGate — Reflection & Engineering Analysis

- Name: Abdulbasit Idris Ali
- Cohort: Design to MVP Bootcamp
- ive URL: [Your Vercel deployment link]
- GitHub Repo: [Your repo URL]



## Part 1 — What I Built

This is a product i built called SecureGate meant to test my ability to build a product that can be protected from hackers from gaining access. 
The product includes the following:
- Authentication flow:
Sign up form
Email verification 
Sign In form
Forget password form
- Dashboard
A protected dashboard structure preventing users that arent verified from getting access.
 


## Part 2 — What Surprised Me?

The hardest part was getting the the email verification link work after sending it to user signing up. Had to go lots of back and forth to get it fixed.

## Part 3 — Engineering Laws Quiz

### Q1 Murphy Law
- Where in SecureGate did Murphy's Law force you to add protection you would not have thought about otherwise? Name at least two specific places and explain what could have gone wrong?


- Two places where Murphy made me to add extra protection:

1-  The forgot password flow - I did not know hackers could attack the endpoint to get which emails are registered until after running an audit the agent mentioned it. 

2- The dashboard itself, i know that hackers could tap on a product but didnt how, while trying to meet the requirement to build the product i realise that by adding X-frame-options, X-content-Type-Options, and Referrer-Policy, we are strengtheniing the security level from hackers.

- What goes wrong if ignored:
Knowing that hackers could tap the system, if we didnt try to block the places they could access, they might most likely be able to.


### Q2 — Law of Leaky Abstractions
- NextAuth, Prisma, and Resend are all abstractions. Pick one and explain where it
'leaks' — where you had to understand the layer beneath it to make something
work correctly.

- Honelstly, this is still the email provider i used, we delete the verification tokens sent to new users once it's been clicked on, but understood that I can also leave the token until it expires.


### Q3 — YAGNI
SecureGate intentionally does not have social login, multi-factor auth, or audit
logs. Explain why adding those features right now would violate YAGNI, and how
you would add them correctly later


- The current build i have doesnt have social login, multi factor auth, or audit logs but doesnt stop the product from working especially if it's your primary target users arent from the socail space, so adding them might just add more to whats already working.



### Q4 — Kerckhoffs's Principle
 Look at your password hashing implementation. What is a salt, why does bcrypt use it automatically, and what would happen to your users if you stored SHA-256
hashes instead?

- I honestly dont have an idea.



### Q5 — Postel's Law / Security by Design
Your forgot-password endpoint returns a success message even if the email does not exist. Why? What law or principle governs this decision, and what would happen to user privacy if you changed it?

- The forgot-password displays "If an account is associated with this email, a reset link has been sent" whether the email exist or not in the database. This is why Postel's Law is applied to security to prevent hackers from filtering their attacks on random accounts if they can know which is a registered email or not.



### Q6 — Boy Scout Rule
Find one place in your codebase where you applied the Boy Scout Rule — where you cleaned up something that was not part of your original plan. What did you find? What did you fix?

- Simple. I found a double .env file named ''.env.example and .env.local''. I filtered which i needed and got rid of the other one.



### Q7 — Gall's Law
Your SecureGate started as a scaffold and grew phase by phase. How does this match Gall's Law? What would have happened if you tried to build all six phases at the same time

- This bit by bit build helps with proper organisation, build and less bug fixes. If to say i built everything all at once, i would have spent much more time to fixing, auditing, fixing, but this saves more time.



### Q8 — Law of Leaky Abstractions (Prisma ORM)
You built SecureGate using Prisma to talk to PostgreSQL. Identify one situation where the Prisma schema model and the actual database table structure are NOT the same thing. Why does this matter?

- With the little knowledge i have, i wouldnt say i encountered a situation like this. Even if i did, i didnt know it was it.



### Q9 — Zawinski's Law
Rate limiting is not in the core Next.js or NextAuth package. You had to add it yourself. What software engineering principle does this demonstrate, and how would Zawinski's Law warn you about what happens when apps grow without discipline?

- My understanding to this is that Rate limiting users in check on how they use the product, for example requesting password reset, it gives a limited number of request per the time you set. 



### Q10 — Principle of Least Surprise
Your login form shows an error message when credentials are wrong. What exact message do you show, and why did you choose that specific wording? What would the Principle of Least Surprise say about how error messages should behave?

- The login form shows "Invalid credentials" when the email or password is wrong. I chose this specific wording because it is what users expect to see and also a good way to prevent hackers from attacking user accounts knowing exsactly whats not correct. 



### Q11 — Murphy's Law / Defensive Programming
Look at your /dashboard route protection. How does your middleware know the user is authenticated? If a user manually deletes their session cookie, what happens? Trace the exact code path.


- This response is from the agent i used to build the product with:
  ''The middleware reads the JWT token from the request cookie using `getToken()` from next-auth/jwt. If the token exists, the user is authenticated. If a user manually deletes their session cookie, this happens: 1) The middleware runs on every /dashboard request. 2) `getToken()` returns null because there is no cookie. 3) The middleware calls `NextResponse.redirect(new URL("/login", request.url))`. 4) The user lands on the login page. Even if the middleware failed for some reason, the dashboard page itself also calls `getServerSession(authOptions)` and redirects to `/login` if the session is null. There are two layers of protection — middleware (surface-level) and server component (deep-level). If the user somehow bypasses middleware, the page itself still checks.''



### Q12 — Kerckhoffs's Principle + Technical Debt
You used environment variables to store secrets. Explain what would happen — step by step — if your NEXTAUTH_SECRET was accidentally committed to
GitHub and how you would recover from it.

- If NEXTAUTH_SECRET was accidentally allowed visible to GitHub, hackers could get access to it and do unethical wonders with it, which could cost you more than you could think.



### Q13 — Conway's Law
SecureGate required you to write code across routes, middleware, database
schema, and email templates. How does Conway's Law explain why full-stack
developers organise code the way they do? How is your folder structure a
reflection of how you think?

- Well, with my design background and because i use AI agent to build it, I would say the project mirror some of my design skills.



### Q14 — Technical Debt
Identify one piece of technical debt in your SecureGate codebase — something that works right now but will cause problems when the app grows. Describe the debt precisely, explain why you left it, and write the refactored version

- New user verification email, i had to just bypass it by allowing the database to stroe the tokens untill it expires, thou the initial plan was to delete the tokens immediately users clicks on the link, but because of the back and forth while having the link work, i just had to bypass it and leave it the way it is.




### Q15 — Synthesis: Payment Integration
If you were asked to add Flutterwave payment integration to SecureGate — so users pay to unlock a premium dashboard — walk through every engineering principle from this task that would still apply. Which ones become more critical when money is involved?


- If I have to add Flutterwave payment integration to unlock a premium dashboard, these will be the laws that will govern the process:

  - Idempotency - To avoid users from being charged twice.  
  - YAGNI Law - We shouldn't add things users do not need untill they are needed, meaning the payment gateway should be setup in a straightforward manner without doing extra.




## Part 4 — One Thing I Would Refactor
Ummm, nothing.




## Part 5 — How This Changes How I Build
- This has thought me more about security starting from authentcation flow of a product, preventing the product from hackers.
