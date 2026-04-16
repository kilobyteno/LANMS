import packageJson from "../package.json";

export const CURRENT_VERSION = packageJson.version;
export const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_URL as string;
export const ENV = process.env.NEXT_PUBLIC_ENV || "production";
export const MODE = process.env.NODE_ENV;

export const GITHUB_REPO = "kilobyteno/lanms";
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}`;

if (typeof window !== "undefined") {
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("ENV:", ENV);
    console.log("MODE:", MODE);
}
