// Share kit + welcome emails. Posts are verbatim from the brief; [YOUR LINK] is replaced in the UI.
export const posts = [
  ["Post 1 · r/PSLF or r/StudentLoans · check the sub's self-promotion rules first", `I've spent the last two months researching the SAVE exit mess — reading hundreds of threads here about the 90-day notices. The pattern I keep seeing: the studentaid.gov calculator shows Graduated as the "cheapest" option to PSLF borrowers without mentioning it doesn't count toward forgiveness, servicer reps contradict each other, and the paid consult option is $595 and doesn't fill out the switch application. I'm building a flat-fee alternative: enter your numbers, get a written RAP vs IBR vs Standard recommendation in 48 hours with the application pre-filled, complex cases (buyback, pre-2014, MFS, self-employed) reviewed by a credentialed specialist. I put together a page for it and would honestly rather hear what's wrong with the idea than what's right. What would make you trust — or never trust — a service like this? [YOUR LINK]`],
  ['Post 2 · X or LinkedIn', `6 million federal borrowers still haven't picked a replacement for SAVE. The free help answers 12,000+ emails a year with no phone line. The paid help is $595 for one hour and won't touch the paperwork. The gap in the middle seemed obvious, so I've been building a $249 flat-fee plan picker: written recommendation in 48 hours, switch application filled out, specialist review on the complex cases. I put together a page for it — if you know someone staring at a 90-day notice, I'd genuinely value their take. [YOUR LINK]`],
  ['Post 3 · Facebook student loan or PSLF group', `Question for this group: if you got your 90-day notice after SAVE ended, what did you actually do — servicer call, studentaid.gov calculator, wait it out? I've been researching this decision and talking to borrowers about it, and I'm building a flat-fee service that models RAP vs IBR vs Standard on your real numbers and delivers a written recommendation plus the filled-out switch application in two days, at less than half the $595 the big consultants charge. I put together a page for it here and would really value honest feedback from people living this: [YOUR LINK]`],
  ['DM version · reply or direct message', `Saw your post about picking a plan after SAVE — I've been researching that exact decision and am building a flat-fee service that models RAP vs IBR vs Standard on your real numbers and preps the switch application in 48 hours. I put together a page for it and would genuinely value your honest take: [YOUR LINK]`],
]

export const emails = [
  { when: 'Email 1 · send instantly after signup', subjects: ["You're in: your $149 price is locked", "Here's what happens next with Forvest"], body: `Thanks for signing up for Forvest.

Your founding price is locked to this email address: the Plan Picker at $149 instead of $249. You haven't paid anything, and you won't until intake opens. Today you reserved a spot.

Here's what happens next:

1. Within 7 days, we'll send you a preview of the 10-minute intake, so you can gather your loan balances, income, filing status and PSLF payment count ahead of time.
2. When intake opens, you're first in line.
3. Two business days after you submit your numbers, you get a written recommendation comparing RAP, IBR and Standard, plus your switch application filled out and ready for you to sign and submit.

One thing that helps: reply and tell us the deadline date on your 90-day notice. It shows us how much time people really have.

— Forvest` },
  { when: 'Email 2 · send on day 2', subjects: ['The cheapest plan may cost you PSLF', "Why the lowest payment isn't cheapest"], body: `If you've used the studentaid.gov loan simulator lately, you may have seen Graduated repayment listed as your cheapest option.

Here's the part that's easy to miss: Graduated payments don't count toward PSLF. If you're partway through your 120 qualifying payments, picking the lowest monthly number can stall your forgiveness clock while the months keep passing.

It gets harder because servicer reps can give you one answer on Monday and another on Thursday, and neither will put it in writing. That gap is the reason Forvest exists: your real numbers, every plan modeled, and the trade-offs written down.

Before you switch to any plan, check two things. Does each payment on that plan count toward PSLF? And what is the payment on your actual income?

If you'd like a second set of eyes, reply with a few lines: your loan types, your income range, and how many PSLF payments you've made. We read every reply.

— Forvest` },
  { when: 'Email 3 · send on day 5', subjects: ['Is it safe to share your numbers?', 'How Forvest handles your loan details'], body: `The question we hear most is a fair one: is it safe to share your loan and income details with a company you've never heard of?

Here is how Forvest is set up, so you don't have to take our word for it:

- We give advice and documents. You stay in control.
- We never take power of attorney.
- We never touch your loans or contact your servicer.
- You review, sign and submit your switch application yourself, through studentaid.gov or your servicer.
- You don't log in to your servicer for us. You enter your own numbers: balances, income, filing status and PSLF payment count.

Nothing we do can change your account, because we never act on it.

The plan from here: when intake opens, you enter your numbers in about 10 minutes, and two business days later you have a written recommendation and a filled-out application. Your $149 price stays locked to this email.

If safety is what's holding you back, reply with the question you'd want answered first. We'll answer it in writing.

— Forvest` },
]
