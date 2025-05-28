import { OCTOKIT_USERNAME } from "astro:env/server";
import { createError } from "http-errors-enhanced";
import { RequestError } from "octokit";

import { octokit } from "@/lib/api";

export const prerender = false;

export const GET = handle(async () => {
  try {
    const response = await octokit.rest.repos.get({
      owner: OCTOKIT_USERNAME,
      repo: "princemuel.dev",
    });
    return Response.json({ payload: response.data.stargazers_count }, { status: 200 });
  } catch (error) {
    if (error instanceof RequestError) throw createError(error.status, error.message);
    throw error;
  }
});
