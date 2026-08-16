"""
Pragati AI — XGBoost modelling pipeline
=========================================
Dataset: commodity_price_features_extended.csv (~203K rows, 7 commodities,
12 reporting centres, 2020-01-01 to 2026-08-14)

Two models are trained, both using a strict time-based (walk-forward) split
so nothing from the future leaks into training:

  1. REGRESSOR  -> target_return_7d_pct
     "Rolling momentum" target: % change in modal price over the NEXT 7 days,
     computed as (price[t+7] - price[t]) / price[t] * 100. This smooths out
     the day-to-day administrative/reporting noise that makes 1-day-ahead
     price targets unreliable.

  2. CLASSIFIER -> target_spike_7d
     Binary flag: does the commodity experience a "spike" (large adverse
     move) within the next 7 days? Framed as price-risk early warning.

Feature set already includes the domain-engineered blocks requested:
  - Lagged prices:            price_lag_1d/7d/14d/30d, rolling_mean_price_7d,
                               rolling_std_price_14d
  - Cumulative rainfall:      rainfall_anom_sum_30d/60d/90d, dryness_wetness_index
  - Growing Degree Days:      gdd_daily, gdd_cum_30d/60d, heatwave_days_30d/60d
  - Fuel/logistics lags:      fuel_price_lag_7d/14d/30d, fuel_price_change_30d_pct
  - Market buffers:           distance_to_hub_km, freight_sensitivity,
                               buffer_stock_tonnes, stock_release_flag
  - Seasonality (cyclical):   doy_sin, doy_cos
  - Categorical context:      commodity, category, centre, state, hub_name
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    roc_auc_score, average_precision_score, classification_report
)
import json

pd.set_option("display.width", 140)

# ---------------------------------------------------------------------------
# 1. Load & basic prep
# ---------------------------------------------------------------------------
df = pd.read_csv("/mnt/user-data/uploads/commodity_price_features_extended.csv",
                  parse_dates=["date"])
df = df.sort_values(["commodity", "centre", "date"]).reset_index(drop=True)

CATEGORICAL = ["commodity", "category", "centre", "state", "hub_name"]
for c in CATEGORICAL:
    df[c] = df[c].astype("category")

# Columns that are themselves future targets / would leak into each other
TARGET_COLS = [
    "target_price_7d_ahead", "target_price_30d_ahead",
    "target_return_5d_pct", "target_return_7d_pct",
    "target_spike_7d", "price_spike_flag",
]
NON_FEATURE = ["date"] + TARGET_COLS

FEATURES = [c for c in df.columns if c not in NON_FEATURE]
print(f"Total candidate features: {len(FEATURES)}")

# ---------------------------------------------------------------------------
# 2. Time-based split (walk-forward, not random) — avoids leakage
#    Train : 2020-01-01 -> 2024-12-31
#    Valid : 2025-01-01 -> 2025-08-31   (early stopping)
#    Test  : 2025-09-01 -> 2026-08-14   (final, untouched evaluation)
# ---------------------------------------------------------------------------
train_end = "2024-12-31"
valid_end = "2025-08-31"

def split(frame, target):
    d = frame.dropna(subset=[target]).copy()
    tr = d[d["date"] <= train_end]
    va = d[(d["date"] > train_end) & (d["date"] <= valid_end)]
    te = d[d["date"] > valid_end]
    return tr, va, te

results = {}

# ===========================================================================
# MODEL 1 — Regressor: target_return_7d_pct  (rolling 7-day forward momentum)
# ===========================================================================
target = "target_return_7d_pct"
tr, va, te = split(df, target)
print(f"\n[Regressor] train={len(tr):,}  valid={len(va):,}  test={len(te):,}")

dtrain = xgb.DMatrix(tr[FEATURES], label=tr[target], enable_categorical=True)
dvalid = xgb.DMatrix(va[FEATURES], label=va[target], enable_categorical=True)
dtest  = xgb.DMatrix(te[FEATURES], label=te[target], enable_categorical=True)

reg_params = {
    "objective": "reg:squarederror",
    "eval_metric": "rmse",
    "max_depth": 6,
    "eta": 0.03,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 5,
    "reg_lambda": 1.5,
    "reg_alpha": 0.5,
    "tree_method": "hist",
    "seed": 42,
}

reg_model = xgb.train(
    reg_params, dtrain,
    num_boost_round=2000,
    evals=[(dtrain, "train"), (dvalid, "valid")],
    early_stopping_rounds=50,
    verbose_eval=False,
)

pred = reg_model.predict(dtest, iteration_range=(0, reg_model.best_iteration + 1))
rmse = mean_squared_error(te[target], pred) ** 0.5
mae = mean_absolute_error(te[target], pred)
r2 = r2_score(te[target], pred)
# Directional accuracy: did we get the sign of the 7-day move right?
dir_acc = float(np.mean(np.sign(pred) == np.sign(te[target])))

results["regressor"] = {
    "best_iteration": reg_model.best_iteration,
    "test_rmse_pct_points": round(rmse, 3),
    "test_mae_pct_points": round(mae, 3),
    "test_r2": round(r2, 4),
    "directional_accuracy": round(dir_acc, 4),
    "n_test": len(te),
}
print(json.dumps(results["regressor"], indent=2))

imp = reg_model.get_score(importance_type="gain")
imp_df = (pd.Series(imp).sort_values(ascending=False).head(15)
          .rename("gain").reset_index().rename(columns={"index": "feature"}))
print("\nTop 15 features (gain) — 7-day return regressor:")
print(imp_df.to_string(index=False))

reg_model.save_model("/home/claude/pragati_xgb_return7d.json")

# ===========================================================================
# MODEL 2 — Classifier: target_spike_7d  (price-spike early warning)
# ===========================================================================
target_c = "target_spike_7d"
tr2, va2, te2 = split(df, target_c)
print(f"\n[Classifier] train={len(tr2):,}  valid={len(va2):,}  test={len(te2):,}")

pos_rate = tr2[target_c].mean()
scale_pos_weight = (1 - pos_rate) / pos_rate
print(f"Train spike rate: {pos_rate:.3%}  -> scale_pos_weight={scale_pos_weight:.2f}")

dtrain_c = xgb.DMatrix(tr2[FEATURES], label=tr2[target_c], enable_categorical=True)
dvalid_c = xgb.DMatrix(va2[FEATURES], label=va2[target_c], enable_categorical=True)
dtest_c  = xgb.DMatrix(te2[FEATURES], label=te2[target_c], enable_categorical=True)

clf_params = {
    "objective": "binary:logistic",
    "eval_metric": "aucpr",
    "max_depth": 5,
    "eta": 0.03,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 5,
    "reg_lambda": 1.5,
    "scale_pos_weight": scale_pos_weight,
    "tree_method": "hist",
    "seed": 42,
}

clf_model = xgb.train(
    clf_params, dtrain_c,
    num_boost_round=2000,
    evals=[(dtrain_c, "train"), (dvalid_c, "valid")],
    early_stopping_rounds=50,
    verbose_eval=False,
)

proba = clf_model.predict(dtest_c, iteration_range=(0, clf_model.best_iteration + 1))
auc = roc_auc_score(te2[target_c], proba)
ap = average_precision_score(te2[target_c], proba)
pred_label = (proba >= 0.5).astype(int)

results["classifier"] = {
    "best_iteration": clf_model.best_iteration,
    "test_roc_auc": round(auc, 4),
    "test_avg_precision": round(ap, 4),
    "n_test": len(te2),
    "test_spike_rate": round(te2[target_c].mean(), 4),
}
print(json.dumps(results["classifier"], indent=2))
print("\nClassification report (threshold=0.5):")
print(classification_report(te2[target_c], pred_label, target_names=["No spike", "Spike"]))

imp_c = clf_model.get_score(importance_type="gain")
imp_c_df = (pd.Series(imp_c).sort_values(ascending=False).head(15)
            .rename("gain").reset_index().rename(columns={"index": "feature"}))
print("\nTop 15 features (gain) — spike classifier:")
print(imp_c_df.to_string(index=False))

clf_model.save_model("/home/claude/pragati_xgb_spike7d.json")

# ===========================================================================
# MODEL 3 — Regressor: target_price_7d_ahead  (absolute price level, 7d ahead)
#   This is the practically useful "Forecast Price ₹/quintal" model — price
#   levels are strongly autocorrelated (unlike returns), so lag/rolling
#   features carry real signal here.
# ===========================================================================
target_p = "target_price_7d_ahead"
tr3, va3, te3 = split(df, target_p)
print(f"\n[Price-level regressor] train={len(tr3):,}  valid={len(va3):,}  test={len(te3):,}")

FEATURES_P = [c for c in FEATURES if c != "modal_price_rs_per_quintal"] + ["modal_price_rs_per_quintal"]
dtrain_p = xgb.DMatrix(tr3[FEATURES], label=tr3[target_p], enable_categorical=True)
dvalid_p = xgb.DMatrix(va3[FEATURES], label=va3[target_p], enable_categorical=True)
dtest_p  = xgb.DMatrix(te3[FEATURES], label=te3[target_p], enable_categorical=True)

price_params = dict(reg_params)
price_model = xgb.train(
    price_params, dtrain_p,
    num_boost_round=3000,
    evals=[(dtrain_p, "train"), (dvalid_p, "valid")],
    early_stopping_rounds=50,
    verbose_eval=False,
)

pred_p = price_model.predict(dtest_p, iteration_range=(0, price_model.best_iteration + 1))
rmse_p = mean_squared_error(te3[target_p], pred_p) ** 0.5
mae_p = mean_absolute_error(te3[target_p], pred_p)
r2_p = r2_score(te3[target_p], pred_p)
mape_p = float(np.mean(np.abs((te3[target_p] - pred_p) / te3[target_p]))) * 100

# naive persistence baseline: "price in 7 days == price today"
naive_rmse = mean_squared_error(te3[target_p], te3["modal_price_rs_per_quintal"]) ** 0.5
naive_mape = float(np.mean(np.abs((te3[target_p] - te3["modal_price_rs_per_quintal"]) / te3[target_p]))) * 100

results["price_level_regressor"] = {
    "best_iteration": price_model.best_iteration,
    "test_rmse_rs_per_quintal": round(rmse_p, 1),
    "test_mae_rs_per_quintal": round(mae_p, 1),
    "test_mape_pct": round(mape_p, 2),
    "test_r2": round(r2_p, 4),
    "naive_persistence_rmse": round(naive_rmse, 1),
    "naive_persistence_mape_pct": round(naive_mape, 2),
    "n_test": len(te3),
}
print(json.dumps(results["price_level_regressor"], indent=2))

imp_p = price_model.get_score(importance_type="gain")
imp_p_df = (pd.Series(imp_p).sort_values(ascending=False).head(15)
            .rename("gain").reset_index().rename(columns={"index": "feature"}))
print("\nTop 15 features (gain) — 7-day price-level forecaster:")
print(imp_p_df.to_string(index=False))

price_model.save_model("/home/claude/pragati_xgb_price7d.json")

with open("/home/claude/model_results_summary.json", "w") as f:
    json.dump(results, f, indent=2)

print("\nSaved: pragati_xgb_return7d.json, pragati_xgb_spike7d.json, pragati_xgb_price7d.json, model_results_summary.json")
