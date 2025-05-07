# Pricing Calculator Bug: Artificially Extended Stay Availability

## Background

You're working on a vacation rental pricing system that calculates nightly rates based on "Length of Stay" (LOS) pricing data. The system processes records for each date that specify different rates based on how many nights a guest stays.

For example, a one-night stay might cost $195/night, while a seven-night stay might cost only $96/night per day.

The LosKhipPricingCalculator class processes this data and produces pricing blocks with start/end dates and calculated nightly rates.

## Current Issue

The calculator has a bug: it's generating pricing blocks that extend beyond the actual available dates in the source data.
For the last few days of January 2026, our data shows:

- Jan 29: Only offers up to 3-night stays
- Jan 30: Only offers up to 2-night stays
- Jan 31: Only offers 1-night stays

However, the calculator is producing pricing blocks that extend into February 7th, 2026 - dates for which we have no pricing data!

This is happening because the calculator is always artificially extending the maximum length of stay (LOS) to 7 nights, regardless of what's actually available in the data.

## Expected Behavior

The calculator should respect the actual maximum length of stay available in each data record and limit pricing blocks accordingly:

- If a date only offers bookings up to 3 nights, the pricing block should end after 3 days
- Pricing blocks should never extend into dates for which we have no data

The MAX_RELEVANT_LOS constant (7) should be used as an upper bound, not to artificially extend stays

## Task

Review the LosKhipPricingCalculator class, focusing on the _parseRecordPairsIntoMap method, to identify and fix the issue causing pricing blocks to extend beyond available data. The solution should ensure that pricing blocks accurately reflect the actual available stay options in the data.

Note: This is a critical fix because our booking system is currently allowing reservations for dates when the property isn't actually available for booking.
