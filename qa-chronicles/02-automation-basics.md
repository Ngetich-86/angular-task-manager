# Writing Test Cases

Welcome to the **QA Chronicles** guide on writing test cases — a blend of traditional test case foundations and modern lean approaches. This document is aimed at helping you write effective, maintainable, and business-aligned test cases.

---

## ✨ Inspiration

This guide is inspired by the brilliant insights of **[Kumudu Gunarathne](https://www.linkedin.com/in/kumudug/)** –  
*QA Leader | Coach & Mentor*, whose work on **Lean Test Case Writing** has redefined the way we think about quality assurance.

> _"Test like a strategist, not a robot."_  
> — Kumudu Gunarathne

---

## 🧱 What Is a Test Case?

A **test case** is a documented scenario designed to verify that a specific part of the application behaves as expected. It usually contains test steps, preconditions, inputs, and expected results.

---

## 🧰 Traditional Test Case Structure

| Field             | Description |
|------------------|-------------|
| **Test Case ID**     | Unique identifier (e.g., `TC-001`) |
| **Title**           | Short description of the test |
| **Preconditions**   | Any setup needed before the test |
| **Test Steps**      | Detailed step-by-step instructions |
| **Expected Result** | What should happen after the steps |
| **Actual Result**   | What actually happened |
| **Status**          | Pass / Fail / Blocked |
| **Notes**           | Screenshots, logs, etc. |

---

## 🛑 The Problem With Long Test Cases

As Kumudu notes, traditional long test cases often suffer from:
- ❌ Being **too detailed** and tied to UI labels
- ❌ **Breaking easily** with minor UI changes
- ❌ Hard to maintain across sprints
- ❌ Misaligned with **business goals**

> Example: A 20-step test for “Search Products” breaks when the UI updates — even though the search still works.

---

## ✅ Lean Test Case Writing: The Smarter Way

**Lean Test Case Writing** is a modern, efficient approach that is:
- ✅ **Value-focused** – centered around what users/business need
- ✅ **Modular** – encourages reuse and shared preconditions
- ✅ **Intent-driven** – focuses on what’s being tested, not how
- ✅ **Resilient** – survives UI/UX changes

> Example (Lean):
> “Verify items can be added to the cart from product listings”  
> Instead of 10 steps to click each "Add to Cart" button

---

## 🔄 Real-World Comparison

### Traditional Test Case:
**Change Password**
1. Login  
2. Click Profile  
3. Click Security  
4. Enter old password  
5. Enter new password  
6. Save  
7. Logout  

🟥 7 steps for one action — prone to breakage

### Lean Version:
**Verify user can change their password**
- **Preconditions**: User is logged in  
- **Steps**: Navigate to profile → change password  
- **Expected**: Password is updated successfully  

✅ Clear. Maintainable. To the point.

---

## 🧠 How to Adopt Lean Test Case Writing

1. **Start with the business goal**  
2. **Remove low-value UI detail**  
3. **Modularize repeatable steps** (e.g., login as a precondition)  
4. **Write for intent**, not rigid click paths  

> Instead of repeating login steps in 15 test cases, extract it as a shared function or note it as a precondition.

---

## 🎯 Benefits of Lean Test Cases

- ⚡ **Faster to review**
- 🤖 **Easier to automate**
- 🧩 **UI/UX resilient**
- 🚀 **Improves sprint velocity**
- 💬 **Easier communication with PMs & devs**

---

## ✍️ Practice Example

**Test Case ID**: TC-002  
**Title**: Verify user can login with valid credentials  
**Preconditions**: User has a valid account  
**Steps**: Navigate to login, enter valid credentials, click login  
**Expected Result**: User is redirected to dashboard  

---

## 📚 Further Learning

- [Kumudu Gunarathne’s #DailyQA Series](https://www.linkedin.com/in/kumudug/)
- Explore lean QA concepts in action: TestRail, Zephyr, Xray
- Read about test design techniques (BVA, equivalence partitioning)

---

## 🧭 Final Thoughts

Writing great test cases isn't about detailing every click — it's about understanding **what matters** to users and the business. Adopt a lean mindset and test smarter.

> _“Lean Test Case Writing = Smarter testing, Faster cycles, Business-aligned quality.”_

---

Created with ❤️ in **QA Chronicles**
