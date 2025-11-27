import { Octokit } from "https://esm.sh/@octokit/core";

/**
 * Service to handle GitHub API interactions for reading/writing data.
 */
export const githubService = {
    /**
     * Fetch data from the repository.
     * Tries to fetch from the raw GitHub content URL first.
     */
    async fetchData(owner, repo, path = 'public/data.json', token) {
        try {
            // 1. Try fetching via API to get the latest version (if token available)
            if (token) {
                const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
                const headers = {
                    'Accept': 'application/vnd.github.v3+json',
                    'Cache-Control': 'no-cache',
                    'Authorization': `token ${token}`
                };

                const response = await fetch(url, { headers });

                if (response.ok) {
                    const data = await response.json();
                    const decodedContent = atob(data.content);
                    const jsonString = decodeURIComponent(escape(decodedContent));

                    return {
                        data: JSON.parse(jsonString),
                        sha: data.sha
                    };
                }
                // If API fails, fallback to GitHub Pages
            }

            // 2. Fallback: Read from GitHub Pages (public, no auth needed)
            const publicUrl = `https://${owner}.github.io/${repo}/${path}`;
            const response = await fetch(publicUrl, {
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                data: data,
                sha: null // No SHA available from public URL
            };

        } catch (error) {
            console.error("Error fetching data:", error);
            // Return empty data instead of throwing
            return {
                data: [],
                sha: null
            };
        }
    },

    /**
     * Save data to the repository.
     */
    async saveData(owner, repo, path = 'public/data.json', token, newData, sha) {
        if (!token) throw new Error("GitHub Token is required to save data.");

        try {
            const octokit = new Octokit({ auth: token });

            // Convert data to formatted JSON string
            const jsonString = JSON.stringify(newData, null, 2);
            // Encode to Base64 (handling UTF-8)
            const content = btoa(unescape(encodeURIComponent(jsonString)));

            const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner,
                repo,
                path,
                message: `Update inventory data: ${new Date().toLocaleString()}`,
                content,
                sha, // Required to update existing file
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            return response.data.content.sha; // Return new SHA

        } catch (error) {
            console.error("Error saving data to GitHub:", error);
            throw error;
        }
    }
};
