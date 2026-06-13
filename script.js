const usernameInput = document.getElementById("usernameInput");
const compareInput = document.getElementById("compareInput");
const searchBtn = document.getElementById("searchBtn");
const compareBtn = document.getElementById("compareBtn");
const themeBtn = document.getElementById("themeBtn");

const historySection = document.getElementById("historySection");
const messageBox = document.getElementById("messageBox");
const profileSection = document.getElementById("profileSection");
const quickStatsSection = document.getElementById("quickStatsSection");
const insightSection = document.getElementById("insightSection");
const scorecardSection = document.getElementById("scorecardSection");
const languageSection = document.getElementById("languageSection");
const achievementSection = document.getElementById("achievementSection");
const favoriteRepoSection = document.getElementById("favoriteRepoSection");
const controlsSection = document.getElementById("controlsSection");
const topReposSection = document.getElementById("topReposSection");
const reposSection = document.getElementById("reposSection");
const compareSection = document.getElementById("compareSection");

const repoSearchInput = document.getElementById("repoSearchInput");
const languageFilter = document.getElementById("languageFilter");
const sortFilter = document.getElementById("sortFilter");

let currentUser = null;
let allRepos = [];

function cleanUsername(value) {
    let username = value.trim();

    if (username.includes("github.com/")) {
        username = username.split("github.com/")[1].split("/")[0];
    }

    return username.replace("@", "");
}

function showMessage(text, type = "normal") {
    messageBox.innerHTML = `
        <div class="message ${type === "error" ? "error" : ""}">
            ${text}
        </div>
    `;
}

function clearMessage() {
    messageBox.innerHTML = "";
}

async function fetchGitHubData(username) {
    const userResponse = await fetch(`https://api.github.com/users/${username}`);

    if (!userResponse.ok) {
        throw new Error("User not found");
    }

    const user = await userResponse.json();

    const repoResponse = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
    );

    const repos = await repoResponse.json();

    return { user, repos };
}

async function searchUser() {
    const username = cleanUsername(usernameInput.value);

    if (!username) {
        showMessage("Please enter a GitHub username.", "error");
        return;
    }

    showMessage("Analyzing GitHub profile...");

    clearSections();

    try {
        const { user, repos } = await fetchGitHubData(username);

        currentUser = user;
        allRepos = repos;

        renderEverything(user, repos);
        saveSearch(user.login);
        renderHistory();

        controlsSection.classList.remove("hidden");
        clearMessage();

    } catch (error) {
        showMessage("User not found. Please check the username.", "error");
    }
}

function clearSections() {
    profileSection.innerHTML = "";
    quickStatsSection.innerHTML = "";
    insightSection.innerHTML = "";
    scorecardSection.innerHTML = "";
    languageSection.innerHTML = "";
    achievementSection.innerHTML = "";
    favoriteRepoSection.innerHTML = "";
    topReposSection.innerHTML = "";
    reposSection.innerHTML = "";
    compareSection.innerHTML = "";
    controlsSection.classList.add("hidden");
}

function renderEverything(user, repos) {
    renderProfile(user);
    renderQuickStats(user, repos);
    renderInsights(user, repos);
    renderScorecard(user, repos);
    renderLanguages(repos);
    renderAchievements(user, repos);
    renderFavoriteRepo(repos);
    renderTopRepos(repos);
    setupLanguageFilter(repos);
    applyRepoFilters();
}

function renderProfile(user) {
    const score = calculateProfileCompleteness(user);
    const rank = getRank(user.public_repos);

    profileSection.innerHTML = `
        <section class="profile-card">
            <div class="avatar-box">
                <img class="avatar" src="${user.avatar_url}" alt="GitHub Avatar">
                <div class="rank">${rank}</div>
            </div>

            <div class="profile-info">
                <h2>${user.name || "No Name Available"}</h2>
                <p class="username">@${user.login}</p>
                <p class="bio">${user.bio || "No bio added by this user."}</p>

                <div class="info-grid">
                    <div class="info-box">📍 ${user.location || "Location not added"}</div>
                    <div class="info-box">🏢 ${user.company || "Company not added"}</div>
                    <div class="info-box">🌐 ${user.blog || "Website not added"}</div>
                    <div class="info-box">📅 Joined ${formatDate(user.created_at)}</div>
                </div>

                <a class="profile-link" href="${user.html_url}" target="_blank">
                    Visit GitHub Profile
                </a>

                <div class="progress-box">
                    <p class="progress-text">Profile Completeness: ${score}%</p>
                    <div class="progress">
                        <div class="progress-fill" style="width:${score}%"></div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderQuickStats(user, repos) {
    const totalStars = getTotalStars(repos);
    const totalForks = getTotalForks(repos);
    const activityScore = calculateActivityScore(user, repos);

    quickStatsSection.innerHTML = `
        <section class="stats-grid">
            ${createStatCard(user.public_repos, "Repositories")}
            ${createStatCard(user.followers, "Followers")}
            ${createStatCard(totalStars, "Total Stars")}
            ${createStatCard(activityScore, "Activity Score")}
        </section>
    `;

    animateCounters();
}

function createStatCard(value, label) {
    return `
        <div class="stat-card">
            <h3 data-count="${value}">0</h3>
            <p>${label}</p>
        </div>
    `;
}

function renderInsights(user, repos) {
    const role = detectDeveloperType(repos);
    const activeThisMonth = repos.filter(repo => isThisMonth(repo.updated_at)).length;
    const createdThisYear = repos.filter(repo => isThisYear(repo.created_at)).length;
    const lang = getMostUsedLanguage(repos);

    insightSection.innerHTML = `
        <h2 class="section-title">AI-Style Developer Summary</h2>
        <section class="section-card">
            <p class="insight-text">
                ${user.name || user.login} looks like a <strong>${role}</strong>.
                The profile has <strong>${user.public_repos}</strong> public repositories,
                uses <strong>${lang || "multiple technologies"}</strong> the most,
                created <strong>${createdThisYear}</strong> repositories this year,
                and updated <strong>${activeThisMonth}</strong> repositories this month.
            </p>
        </section>
    `;
}

function renderScorecard(user, repos) {
    const projectGrade = getGrade(user.public_repos, 50, 25, 10);
    const communityGrade = getGrade(user.followers, 200, 50, 10);
    const activityGrade = getGrade(repos.filter(repo => isThisMonth(repo.updated_at)).length, 10, 5, 2);
    const impactGrade = getGrade(getTotalStars(repos), 100, 25, 5);

    scorecardSection.innerHTML = `
        <h2 class="section-title">GitHub Scorecard</h2>
        <section class="section-card score-grid">
            <div class="score-box"><h3>${projectGrade}</h3><p>Projects</p></div>
            <div class="score-box"><h3>${communityGrade}</h3><p>Community</p></div>
            <div class="score-box"><h3>${activityGrade}</h3><p>Activity</p></div>
            <div class="score-box"><h3>${impactGrade}</h3><p>Impact</p></div>
        </section>
    `;
}

function renderLanguages(repos) {
    const languageCount = {};

    repos.forEach(repo => {
        if (repo.language) {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
    });

    const entries = Object.entries(languageCount);

    if (entries.length === 0) return;

    const total = entries.reduce((sum, item) => sum + item[1], 0);

    languageSection.innerHTML = `
        <h2 class="section-title">Language Analytics</h2>
        <section class="section-card">
            ${entries.map(([language, count]) => {
                const percent = Math.round((count / total) * 100);
                return `
                    <div class="language-item">
                        <div class="language-top">
                            <strong>${language}</strong>
                            <span>${percent}%</span>
                        </div>
                        <div class="language-bar">
                            <div class="language-fill" style="width:${percent}%"></div>
                        </div>
                    </div>
                `;
            }).join("")}
        </section>
    `;
}

function renderAchievements(user, repos) {
    const badges = [];
    const totalStars = getTotalStars(repos);

    if (user.followers >= 50) badges.push("⭐ Popular Developer");
    if (user.public_repos >= 20) badges.push("🚀 Active Builder");
    if (repos.length >= 10) badges.push("📦 Project Creator");
    if (getUniqueLanguages(repos).length >= 3) badges.push("💻 Multi-Language Coder");
    if (totalStars >= 10) badges.push("🏆 Star Collector");
    if (repos.some(repo => repo.forks_count > 0)) badges.push("🌍 Open Source Impact");
    if (repos.filter(repo => isThisMonth(repo.updated_at)).length >= 3) badges.push("🔥 Recently Active");

    if (badges.length === 0) badges.push("🌱 Growing Developer");

    achievementSection.innerHTML = `
        <h2 class="section-title">Achievements</h2>
        <section class="section-card">
            <div class="badges">
                ${badges.map(badge => `<span class="badge">${badge}</span>`).join("")}
            </div>
        </section>
    `;
}

function renderFavoriteRepo(repos) {
    if (repos.length === 0) return;

    const bestRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    favoriteRepoSection.innerHTML = `
        <h2 class="section-title">Repository of the Profile</h2>
        <div class="repos-grid">
            ${createRepoCard(bestRepo, true)}
        </div>
    `;
}

function renderTopRepos(repos) {
    const topRepos = [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 4);

    if (topRepos.length === 0) return;

    topReposSection.innerHTML = `
        <h2 class="section-title">Top Repositories</h2>
        <div class="repos-grid">
            ${topRepos.map(repo => createRepoCard(repo)).join("")}
        </div>
    `;
}

function applyRepoFilters() {
    const text = repoSearchInput.value.toLowerCase();
    const language = languageFilter.value;
    const sort = sortFilter.value;

    let repos = allRepos.filter(repo => {
        const matchName = repo.name.toLowerCase().includes(text);
        const matchLanguage = language === "all" || repo.language === language;
        return matchName && matchLanguage;
    });

    if (sort === "stars") repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    else if (sort === "forks") repos.sort((a, b) => b.forks_count - a.forks_count);
    else if (sort === "issues") repos.sort((a, b) => b.open_issues_count - a.open_issues_count);
    else if (sort === "size") repos.sort((a, b) => b.size - a.size);
    else if (sort === "name") repos.sort((a, b) => a.name.localeCompare(b.name));
    else repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    renderRepositories(repos);
}

function renderRepositories(repos) {
    reposSection.innerHTML = `
        <h2 class="section-title">All Repositories (${repos.length})</h2>
        ${
            repos.length === 0
            ? `<div class="message">No repositories found.</div>`
            : `<div class="repos-grid">${repos.map(repo => createRepoCard(repo)).join("")}</div>`
        }
    `;
}

function createRepoCard(repo, favorite = false) {
    return `
        <article class="repo-card ${favorite ? "favorite" : ""}">
            <h3>
                <a href="${repo.html_url}" target="_blank">${favorite ? "🏆 " : ""}${repo.name}</a>
            </h3>
            <p>${repo.description || "No description available."}</p>
            <div class="repo-meta">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
                <span>⚠️ ${repo.open_issues_count}</span>
                <span>📦 ${repo.size} KB</span>
                <span>💻 ${repo.language || "Unknown"}</span>
                <span>📅 ${formatDate(repo.updated_at)}</span>
            </div>
        </article>
    `;
}

async function compareUsers() {
    const mainUsername = cleanUsername(usernameInput.value);
    const secondUsername = cleanUsername(compareInput.value);

    if (!mainUsername || !secondUsername) {
        showMessage("Enter both users for comparison.", "error");
        return;
    }

    showMessage("Comparing users...");

    try {
        const first = await fetchGitHubData(mainUsername);
        const second = await fetchGitHubData(secondUsername);

        compareSection.innerHTML = `
            <h2 class="section-title">User Comparison</h2>
            <section class="compare-grid">
                ${createCompareCard(first.user, first.repos)}
                ${createCompareCard(second.user, second.repos)}
            </section>
        `;

        clearMessage();

    } catch (error) {
        showMessage("Comparison failed. Check both usernames.", "error");
    }
}

function createCompareCard(user, repos) {
    return `
        <div class="compare-card">
            <h3>${user.name || user.login}</h3>
            <div class="compare-row"><span>Username</span><strong>@${user.login}</strong></div>
            <div class="compare-row"><span>Followers</span><strong>${user.followers}</strong></div>
            <div class="compare-row"><span>Repositories</span><strong>${user.public_repos}</strong></div>
            <div class="compare-row"><span>Total Stars</span><strong>${getTotalStars(repos)}</strong></div>
            <div class="compare-row"><span>Total Forks</span><strong>${getTotalForks(repos)}</strong></div>
            <div class="compare-row"><span>Main Language</span><strong>${getMostUsedLanguage(repos) || "Unknown"}</strong></div>
            <div class="compare-row"><span>Activity Score</span><strong>${calculateActivityScore(user, repos)}</strong></div>
        </div>
    `;
}

function setupLanguageFilter(repos) {
    const languages = getUniqueLanguages(repos);

    languageFilter.innerHTML = `<option value="all">All Languages</option>`;

    languages.forEach(language => {
        languageFilter.innerHTML += `<option value="${language}">${language}</option>`;
    });
}

function animateCounters() {
    document.querySelectorAll("[data-count]").forEach(counter => {
        const target = Number(counter.dataset.count);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 45));

        const timer = setInterval(() => {
            current += step;

            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = current;
            }
        }, 22);
    });
}

function calculateProfileCompleteness(user) {
    let score = 0;
    if (user.name) score += 20;
    if (user.bio) score += 20;
    if (user.location) score += 20;
    if (user.company) score += 20;
    if (user.blog) score += 20;
    return score;
}

function calculateActivityScore(user, repos) {
    return Math.round(
        user.public_repos * 2 +
        user.followers * 0.5 +
        getTotalStars(repos) * 3 +
        getTotalForks(repos) * 2
    );
}

function detectDeveloperType(repos) {
    const lang = getMostUsedLanguage(repos);

    if (!lang) return "General Developer";

    const map = {
        JavaScript: "Frontend / Full Stack Developer",
        TypeScript: "Modern Web Developer",
        Python: "Python / AI-ML Developer",
        "C++": "Competitive Programmer",
        C: "Systems Programmer",
        Java: "Backend Developer",
        HTML: "Frontend Developer",
        CSS: "Frontend UI Developer",
        PHP: "Web Backend Developer",
        Go: "Cloud Backend Developer"
    };

    return map[lang] || `${lang} Developer`;
}

function getMostUsedLanguage(repos) {
    const count = {};

    repos.forEach(repo => {
        if (repo.language) {
            count[repo.language] = (count[repo.language] || 0) + 1;
        }
    });

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0];
}

function getUniqueLanguages(repos) {
    return [...new Set(repos.map(repo => repo.language).filter(Boolean))];
}

function getTotalStars(repos) {
    return repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
}

function getTotalForks(repos) {
    return repos.reduce((sum, repo) => sum + repo.forks_count, 0);
}

function getRank(repoCount) {
    if (repoCount >= 50) return "🏆 GitHub Master";
    if (repoCount >= 25) return "🚀 Developer";
    if (repoCount >= 10) return "🧭 Explorer";
    return "🌱 Beginner";
}

function getGrade(value, a, b, c) {
    if (value >= a) return "A+";
    if (value >= b) return "A";
    if (value >= c) return "B";
    return "C";
}

function isThisMonth(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    return date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
}

function isThisYear(dateString) {
    return new Date(dateString).getFullYear() === new Date().getFullYear();
}

function formatDate(date) {
    return new Date(date).toDateString();
}

function saveSearch(username) {
    let searches = JSON.parse(localStorage.getItem("githubSearches")) || [];

    searches = searches.filter(item => item.toLowerCase() !== username.toLowerCase());
    searches.unshift(username);

    if (searches.length > 8) searches.pop();

    localStorage.setItem("githubSearches", JSON.stringify(searches));
}

function renderHistory() {
    const searches = JSON.parse(localStorage.getItem("githubSearches")) || [];

    historySection.innerHTML = searches.map(username => {
        return `<button onclick="searchFromHistory('${username}')">${username}</button>`;
    }).join("");
}

function searchFromHistory(username) {
    usernameInput.value = username;
    searchUser();
}

function toggleTheme() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "☀️ Light";
        localStorage.setItem("githubTheme", "dark");
    } else {
        themeBtn.textContent = "🌙 Dark";
        localStorage.setItem("githubTheme", "light");
    }
}

function loadTheme() {
    if (localStorage.getItem("githubTheme") === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️ Light";
    }
}

searchBtn.addEventListener("click", searchUser);
compareBtn.addEventListener("click", compareUsers);
themeBtn.addEventListener("click", toggleTheme);

usernameInput.addEventListener("keydown", event => {
    if (event.key === "Enter") searchUser();
});

compareInput.addEventListener("keydown", event => {
    if (event.key === "Enter") compareUsers();
});

repoSearchInput.addEventListener("input", applyRepoFilters);
languageFilter.addEventListener("change", applyRepoFilters);
sortFilter.addEventListener("change", applyRepoFilters);

loadTheme();
renderHistory();