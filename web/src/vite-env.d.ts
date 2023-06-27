/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string
	readonly VITE_COGNITO_REGION: string
	readonly VITE_COGNITO_POOL_ID: string
	readonly VITE_COGNITO_CLIENT_ID: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
