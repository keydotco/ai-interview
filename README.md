# AI Interview Sandbox Repository
This repository is designed to test your AI collaboration skills on practical programming challenges. You'll be working with two pricing calculator implementations that have issues needing your attention.

## Overview
The repository contains two key calculator classes:
- LosKhipPricingCalculator - Calculates pricing based on Length of Stay (LOS)
- NightlyKhipPricingCalculator - Calculates pricing based on nightly rates

## Challenges

### Challenge 1: LOS Pricing Calculator Fix
Currently, the LosKhipPricingCalculator.js implementation has an issue with how it handles LOS records. The calculator extrapolates pricing data to the maximum relevant LOS days (MAX_RELEVANT_LOS) even when the records don't have data for those days.
Your task: Update the calculator to only generate base rate blocks for days that actually exist in the LOS records. You should be able to:
- Understand why the current implementation behaves as it does
- Implement a fix that correctly handles the LOS data
- Explain your reasoning for the changes made

### Challenge 2: Nightly Pricing Calculator Debugging
There's a bug in the NightlyKhipPricingCalculator.js implementation. The test indicates that we're generating an incorrect number of pricing blocks, but that's all the information we have.
Your task:
- Debug the issue in the nightly pricing calculator
- Add test implementation in NightlyKhipPricingCalculator_test.js to verify correct behavior
- Implement a fix for the bug

## Getting Started
1. Review the code in each calculator implementation
2. Run the existing tests to observe the failing cases
3. Use AI collaboration to analyze the issues and develop solutions
4. Implement your fixes and verify with the test cases

Good luck! This challenge is designed to test not just your coding skills but also your ability to effectively collaborate with AI tools to understand and solve problems.