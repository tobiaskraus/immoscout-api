# ImmosScout - API

API Service of ImmoScout project (see scraped results and organize them)

## Getting started

```
npm i
```

Copy `.env-example` file to `.env` and update values

Run `npm start`

Make a request with POSTMAN:

-   `GET localhost:8080/properties`
-   Authorization: Bearer Token (see in `auth.ts`)

## Deploy

### Deploy to DockerCloud

...

### Deploy to GCP

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

-   or in GCP Console (Browser) under Cloud Run > {Project} > Edit & Deploy new revision

more infos: https://cloud.google.com/run/docs/quickstarts/build-and-deploy
