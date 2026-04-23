# Render Deployment Guide

## What this deploys
- A Python web service for the model API
- Health endpoint: `/health`
- Prediction endpoint: `/predict`

## Files prepared
- `local_inference_server.py`
- `requirements.txt`
- `render.yaml`

## Important requirement
Render deploys from a Git repository. This folder is **not** currently a Git repo, so before deploying you need to:

1. Create a GitHub repository
2. Upload this project, including `baseline_ffpp_94.pth`
3. Connect that repository to Render

## Render setup

Use these settings if you create the service manually:

- Runtime: `Python`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn local_inference_server:app`
- Health Check Path: `/health`

## Environment variables

- `MODEL_PATH=/opt/render/project/src/baseline_ffpp_94.pth`
- `MODEL_THRESHOLD=0.5`
- `MODEL_POSITIVE_CLASS=fake`

## After Render gives you a URL

Example:

`https://deepfake-model-api.onrender.com`

Set this in your Vercel frontend:

`VITE_PREDICT_URL=https://deepfake-model-api.onrender.com/predict`

Then redeploy the Vercel site.

## Notes

- The first Render response may be slow on the free plan because the service can sleep.
- The model file must exist inside the deployed repository.
- If labels appear reversed, change `MODEL_POSITIVE_CLASS` to `real` and redeploy.
