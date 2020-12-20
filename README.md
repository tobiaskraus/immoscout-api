# ImmoScout - API

API Service of ImmoScout project (scrape, see results and organize them)

## Getting started

```
npm i
```

Copy `.env-example` file to `.env` and update values

Download or Copy and Paste the **Service Account Key** file from [Google Cloud / Service Account](https://console.cloud.google.com/iam-admin/serviceaccounts) or from another device where the project is already set up and paste it in the root as `/google-cloud-service-account-key.json`.

-   this authenticates this API to upload files to the Storage from your localhost.

Run `npm start`

Make a request with POSTMAN:

-   `GET localhost:8080/properties`
-   Authorization: `"Bearer ${process.env.AUTH_TOKEN}"` (see in you environments)

## Deploy

### Continuous Deployment to Google Cloud Run

-   always on Branch `main`

### Deploy manual to Google Cloud Run

**Build your container image using Cloud Build**

```sh
# gcloud builds submit --tag gcr.io/{PROJECT_ID}/{SERVICE_NAME}
gcloud builds submit --tag gcr.io/tk-immoscout/immoscout-api
```

**Deploy Container Image**

```sh
# gcloud run deploy --image gcr.io/{PROJECT_ID}/{SERVICE_NAME} --platform managed
gcloud run deploy --image gcr.io/tk-immoscout/immoscout-api --platform managed
```

**Deploy new revision of existing Service**

gcloud run deploy SERVICE --image IMAGE_URL

```sh
# gcloud run deploy {SERVICE_NAME} --image {IMAGE_URL}
gcloud run deploy immoscout-api --image gcr.io/tk-immoscout/immoscout-api
```

-   or in GCP Console (Browser) under Cloud Run > {Project} > Edit & Deploy new revision

more infos: https://cloud.google.com/run/docs/quickstarts/build-and-deploy
