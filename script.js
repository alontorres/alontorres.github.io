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
            const linkElement = document.createElement('a');
            linkElement.classList.add('post-summary-link');
            linkElement.href = `#${post.filename}`;
            
            // Create inner content
            const titleElement = document.createElement('h3');
            // The h3 itself should not be a link, as the whole card is a link.
            // However, to maintain the visual styling of the title as a prominent link,
            // we might need to style the h3 directly or a span inside it if preferred.
            // For now, let's keep the inner <a> for the title as per the CSS plan,
            // but this is something to potentially simplify later if desired.
            titleElement.innerHTML = `<a href="#${post.filename}">${post.title}</a>`;
            
            const metaElement = document.createElement('p');
            metaElement.classList.add('post-meta');
            metaElement.textContent = `Date: ${post.date}`;
            
            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = post.description;
            
            // Append inner content to the link element
            linkElement.appendChild(titleElement);
            linkElement.appendChild(metaElement);
            linkElement.appendChild(descriptionElement);
            
            postListContainer.appendChild(linkElement);
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

            // Add "End of Post" cue
            const endCue = document.createElement('div');
            endCue.className = 'post-end-cue';
            endCue.textContent = '***';
            postContentContainer.appendChild(endCue);

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