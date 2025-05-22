// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the posts.html page by looking for a specific element
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
        return; // Exit if not on the posts page
    }

    const postListSection = document.getElementById('post-list-section');
    const singlePostSection = document.getElementById('single-post-section');
    const postListContainer = document.getElementById('post-list');
    const postContentContainer = document.getElementById('post-content');
    const backToListLink = document.getElementById('back-to-list');

    // Function to display the list of posts
    function displayPostList() {
        postListSection.style.display = 'block';
        singlePostSection.style.display = 'none';
        postListContainer.innerHTML = ''; // Clear previous list

        // Check if the 'posts' array from posts_config.js is available and has content
        if (typeof posts === 'undefined' || posts.length === 0) {
            postListContainer.innerHTML = '<p>No posts available yet. Check back soon!</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.classList.add('post-summary');
            postElement.innerHTML = `
                <h3><a href="#${post.filename}">${post.title}</a></h3>
                <p class="post-meta">Date: ${post.date}</p>
                <p>${post.description}</p>
            `;
            postListContainer.appendChild(postElement);
        });
    }

    // Function to display a single post
    async function displaySinglePost(postFilename) {
        postListSection.style.display = 'none';
        singlePostSection.style.display = 'block';
        postContentContainer.innerHTML = '<p>Loading post...</p>'; // Loading indicator

        const post = posts.find(p => p.filename === postFilename);

        if (!post) {
            postContentContainer.innerHTML = '<p>Post not found. Please check the URL or go <a href="posts.html">back to the list</a>.</p>';
            return;
        }

        try {
            const response = await fetch(`content/posts/${post.filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching ${post.filename}`);
            }
            const markdownContent = await response.text();
            
            // Use Marked.js (loaded via CDN in posts.html) to convert Markdown to HTML
            if (typeof marked === 'undefined') {
                postContentContainer.innerHTML = '<p>Error: Markdown parser (Marked.js) not loaded. Please check your internet connection or the CDN link.</p>';
                console.error("Marked.js is not loaded.");
                return;
            }
            postContentContainer.innerHTML = marked.parse(markdownContent);
            document.title = `${post.title} - Alon Torres`; // Update page title

        } catch (error) {
            console.error('Error fetching or parsing post:', error);
            postContentContainer.innerHTML = `<p>Sorry, there was an error loading this post. Please try again later or go <a href="posts.html">back to the list</a>.</p>`;
        }
    }

    // Router: Handle URL hash changes to switch between post list and single post view
    function handleRouteChange() {
        const hash = window.location.hash.substring(1); // Get filename from hash (e.g., #my-first-post.md)
        if (hash) {
            displaySinglePost(hash);
        } else {
            displayPostList();
            document.title = "Blog Posts - Alon Torres"; // Reset page title
        }
    }

    // Event listener for hash changes (e.g., clicking a post link or using browser back/forward)
    window.addEventListener('hashchange', handleRouteChange);

    // Initial page load: check hash and display appropriate view
    handleRouteChange();

    // Ensure "Back to Posts List" link clears the hash to trigger list view
    if (backToListLink) {
        backToListLink.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior (which might be a full page reload)
            window.location.hash = ''; // Clear the hash, which will trigger handleRouteChange via 'hashchange' event
        });
    }
});