# SIH25010
Smart Crop Advisory system for small and marginal Farmers-Agriculture,Food Tech&Rural Development
Problem Description:
A majority of small and marginal farmers in India rely on traditional knowledge, local shopkeepers, or guesswork for crop selection, pest control, and fertilizer use. They lack access to personalized, real-time advisory services that account for soil type, weather conditions, and crop history.This often leads to poor yield, excessive input costs, and environmental degradation due to overuse of chemicals. Language barriers, low digital literacy, and absence of localized tools further limit their access to modern agri-tech resources.

Impact / Why this problem needs to be solved:
Helping small farmers make informed decisions can significantly increase productivity, reduce costs, and improve livelihoods. It also contributes to sustainable farming practices, food security, and environmental conservation. A smart advisory solution can empower farmers with scientific insights in their native language and reduce dependency on unreliable third-party advice.

Expected Outcomes:
• A multilingual, AI-based mobile app or chatbot that provides real-time, location-specific crop advisory.
• Soil health recommendations and fertilizer guidance.
• Weather-based alerts and predictive insights.
• Pest/disease detection via image uploads.
• Market price tracking.
• Voice support for low-literate users.
• Feedback

Relevant Stakeholders / Beneficiaries:
• Small and marginal farmers
• Agricultural extension officers
• Government agriculture departments
• NGOs and cooperatives
• Agri-tech startups

Supporting Data:
• 86% of Indian farmers are small or marginal (NABARD Report, 2022).
• Studies show ICT-based advisories can increase crop yield by 20–30%.

## Live Pest Model Setup

The pest/disease detection API supports live model inference via Hugging Face.

Optional environment variables for `backend`:

- `HF_API_TOKEN`: Your Hugging Face access token (recommended for stable live inference)
- `PEST_MODEL_IDS`: Comma-separated model ids to try in order
  - Default:
    - `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`
    - `Diginsa/Plant-Disease-Detection-Project`

Example (PowerShell):

`$env:HF_API_TOKEN="your_token_here"`

Then start backend:

`npm start`
