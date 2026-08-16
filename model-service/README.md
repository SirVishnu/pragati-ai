# Local FastAPI model service

This development-only service serves predictions from the supplied LightGBM model artefacts and `commodity_price_features.csv`. It does **not** copy model files into the website bundle.

## Run locally

From `/home/ubuntu/pragati-ai`, run:

```bash
PRAGATI_MODEL_DIR=/home/ubuntu/upload \
PRAGATI_FEATURE_DATA=/home/ubuntu/upload/commodity_price_features.csv \
python3 -m uvicorn model-service.app:app --host 127.0.0.1 --port 8000 --reload
```

The Vite development server proxies `/api/model/*` to `http://127.0.0.1:8000/api/*`.

## Available endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Checks artefacts and data availability. |
| `GET /api/commodities` | Returns supported commodity labels from the feature dataset. |
| `GET /api/predictions/latest?commodity=Onion` | Returns the latest complete feature row’s 7-day momentum and spike-probability prediction. |

The model was supplied by the user. Treat outputs as decision support, validate source observations, and do not use the local service as a production deployment.
