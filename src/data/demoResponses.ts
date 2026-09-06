/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DemoPreset {
  id: string;
  conceptId: string;
  title: string;
  subtitle: string;
  expectedVerdict: 'PARTIALLY_CORRECT' | 'CORRECT';
  response: string;
}

export const DEMO_PRESETS: Record<string, DemoPreset[]> = {
  'rice-prioritization': [
    {
      id: 'rice-step1-baseline',
      conceptId: 'rice-prioritization',
      title: 'Demo Step 1: Baseline Attempt',
      subtitle: 'Triggers PARTIALLY_CORRECT (Calculates raw RICE, accepts 100% verbal certainty, misses unit mismatch)',
      expectedVerdict: 'PARTIALLY_CORRECT',
      response: `1. Baseline RICE Calculations:
- Project Titan: Reach 520 accounts × Impact 2 × Confidence 0.8 / Effort 4 = 208
- Project Bedrock: Reach 148 accounts × Impact 3 × Confidence 0.5 / Effort 3 = 74
- Project Apex: Reach 5 accounts × Impact 3 × Confidence 1.0 / Effort 2 = 7.5

2. Capacity Constraints & Packaging:
Our engineering sprint budget is capped at 6 engineer-months.
Comparing combinations:
- Option A: Titan (4 mo) + Apex (2 mo) = 6 engineer-months. Total combined score = 215.5.
- Option B: Bedrock (3 mo) + Apex (2 mo) = 5 engineer-months. Total combined score = 81.5.

3. Recommendation:
Prioritize Project Titan and Project Apex to exhaust the 6-month budget. Cut Project Bedrock because its RICE score of 74 is significantly lower than Titan's 208, and Apex is guaranteed by the Sales Director with 100% verbal certainty.`
    },
    {
      id: 'rice-step2-revised',
      conceptId: 'rice-prioritization',
      title: 'Demo Step 2: Revised with Hints',
      subtitle: 'Triggers CORRECT (Normalizes sensor/ARR reach, applies 40% pipeline discount, defines sensitivity threshold)',
      expectedVerdict: 'CORRECT',
      response: `Executive Prioritization Brief:

1. Unit Normalization (Sensor Fleet & ARR Reach):
Measuring Reach strictly by legal accounts skews the model against Enterprise tiers. Bedrock covers 62% of all active telematics sensors (18,600 sensors) and $4.8M ARR. Titan covers 520 accounts at $6k each ($3.12M ARR). Apex represents 5 marquee enterprises at $1.2M ARR ($240k each).
Evaluating Reach normalized by ARR ($100k blocks):
- Titan: 31.2 reach × 2 impact × 0.8 confidence / 4 effort = 12.48
- Bedrock: 48.0 reach × 3 impact × 0.5 confidence / 3 effort = 24.0
- Apex (Discounted): 12.0 reach × 3 impact × 0.4 confidence / 2 effort = 7.2

2. Confidence Correction & Discount:
The Sales Director's 100% verbal claim must be penalized down to an empirical B2B pipeline discount factor of 40% (0.4) due to lack of signed contracts or escrow penalties.

3. Capacity Packaging (6 Engineer-Month Budget):
- Titan (4 mo) + Apex (2 mo) = 6 mo.
- Bedrock (3 mo) + Apex (2 mo) = 5 mo.
We recommend shipping Titan + Apex this quarter to lock in the mid-market core while defending the $1.2M enterprise renewal.

4. Mathematical Inversion Sensitivity Threshold:
The recommendation inverts to Bedrock + Apex if Titan effort expands past 4.8 months, or if field telemetry proves that enterprise sensor churn risk exceeds $2.1M ARR.`
    }
  ],

  'sql-joins': [
    {
      id: 'sql-step1-naive',
      conceptId: 'sql-joins',
      title: 'Demo Step 1: Naive Multi-Join',
      subtitle: 'Triggers PARTIALLY_CORRECT (Exhibits Cartesian fan-out row explosion)',
      expectedVerdict: 'PARTIALLY_CORRECT',
      response: `SELECT m.merchant_id,
       m.business_name,
       SUM(t.gross_amount) AS total_gross,
       SUM(r.refunded_amount) AS total_refunded,
       SUM(f.fee_amount) AS total_fees
FROM merchants m
LEFT JOIN transactions t ON m.merchant_id = t.merchant_id
LEFT JOIN refunds r ON m.merchant_id = r.merchant_id
LEFT JOIN fee_surcharges f ON m.merchant_id = f.merchant_id
WHERE m.status = 'ACTIVE'
GROUP BY m.merchant_id, m.business_name;`
    },
    {
      id: 'sql-step2-cte',
      conceptId: 'sql-joins',
      title: 'Demo Step 2: CTE Pre-Aggregation',
      subtitle: 'Triggers CORRECT (Pre-aggregates in CTEs, preserves zero-transaction merchants with COALESCE)',
      expectedVerdict: 'CORRECT',
      response: `WITH daily_txns AS (
  SELECT merchant_id,
         SUM(gross_amount) AS total_gross
  FROM transactions
  WHERE created_at >= '2026-09-01 00:00:00' AND created_at < '2026-09-02 00:00:00'
  GROUP BY merchant_id
),
daily_refunds AS (
  SELECT merchant_id,
         SUM(refunded_amount) AS total_refunded
  FROM refunds
  WHERE created_at >= '2026-09-01 00:00:00' AND created_at < '2026-09-02 00:00:00'
  GROUP BY merchant_id
),
daily_fees AS (
  SELECT merchant_id,
         SUM(fee_amount) AS total_fees
  FROM fee_surcharges
  WHERE created_at >= '2026-09-01 00:00:00' AND created_at < '2026-09-02 00:00:00'
  GROUP BY merchant_id
)
SELECT m.merchant_id,
       m.business_name,
       COALESCE(dt.total_gross, 0) AS total_gross,
       COALESCE(dr.total_refunded, 0) AS total_refunded,
       COALESCE(df.total_fees, 0) AS total_fees
FROM merchants m
LEFT JOIN daily_txns dt ON m.merchant_id = dt.merchant_id
LEFT JOIN daily_refunds dr ON m.merchant_id = dr.merchant_id
LEFT JOIN daily_fees df ON m.merchant_id = df.merchant_id
WHERE m.status = 'ACTIVE'
ORDER BY m.merchant_id;`
    }
  ]
};

// Also register alias
DEMO_PRESETS['sql-join-logic'] = DEMO_PRESETS['sql-joins'];

export function getDemoPresetsForConcept(conceptId: string): DemoPreset[] {
  return DEMO_PRESETS[conceptId] || [];
}
