// Storage
        let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        let users = JSON.parse(localStorage.getItem('users')) || { 'admin': { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' } };
        let currentUser = null;
        let currentBlogId = null;

        function saveUsers() { localStorage.setItem('users', JSON.stringify(users)); }
        function saveBlogs() { localStorage.setItem('blogs', JSON.stringify(blogs)); }

        // Register
        // Register
        function openRegisterModal() {
            new bootstrap.Modal(document.getElementById('registerModal')).show();
        }

        function handleRegistration() {
            const n = document.getElementById('regName').value.trim();
            const u = document.getElementById('regUsername').value.trim();
            const p = document.getElementById('regPassword').value.trim();

            if (!n || !u || !p) {
                alert('Please fill all fields');
                return;
            }

            if (users[u]) {
                alert('Username already exists');
                return;
            }

            users[u] = { username: u, name: n, password: p, role: 'user' };
            saveUsers();

            alert('Registration successful!');
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            document.getElementById('registerForm').reset();
        }



        // Login/logout
        function toggleAuth() {
            if (currentUser) { currentUser = null; document.getElementById('authBtn').innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login'; document.getElementById('currentUserDisplay').textContent = ''; renderBlogs(); }
            else {
                const u = prompt('Username'); const p = prompt('Password');
                if (users[u] && users[u].password === p) { currentUser = users[u]; document.getElementById('authBtn').innerHTML = '<i class="fas fa-sign-out-alt me-2"></i>Logout'; document.getElementById('currentUserDisplay').textContent = 'Hello, ' + currentUser.name; renderBlogs(); }
                else alert('Invalid credentials');
            }
        }

        // Blog modal
        function openCreateModal() {
            if (!currentUser) { alert('Login to create posts'); return; }
            currentBlogId = null;
            document.getElementById('modalTitle').textContent = 'Create New Post';
            document.getElementById('blogForm').reset();
            document.getElementById('imagePreview').style.display = 'none'; document.getElementById('uploadPlaceholder').style.display = 'block';
            new bootstrap.Modal(document.getElementById('blogModal')).show();
        }

        // Load existing blogs from localStorage
        // Render all blogs
        // Render blogs (merged single function)
        function renderBlogs() {
            const container = document.getElementById('blogContainer');
            container.innerHTML = '';

            if (!blogs || blogs.length === 0) {
                document.getElementById('noBlogsMessage').style.display = 'block';
                return;
            } else {
                document.getElementById('noBlogsMessage').style.display = 'none';
            }

            blogs.forEach(blog => {
                const col = document.createElement('div');
                col.className = 'col-md-4 mb-4';

                const card = document.createElement('div');
                card.className = 'glass-card p-3 blog-card';

                card.innerHTML = `
      ${blog.image ? `<img src="${blog.image}" class="blog-image">` : ''}
      <h5>${blog.title}</h5>
      <p class="text-secondary">${blog.content.substring(0, 100)}...</p>
      <div>${blog.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <small class="text-muted">By ${blog.authorName}</small>
      <br>
      <button class="btn btn-sm btn-gradient mt-2" onclick="viewBlog(${blog.id})">
        See Full Content
      </button>
    `;

                col.appendChild(card);
                container.appendChild(col);
            });
        }


        // View blog in modal
        function viewBlog(id) {
            const blog = blogs.find(b => b.id === id);
            if (!blog) return;

            document.getElementById('viewBlogTitle').textContent = blog.title;
            document.getElementById('viewBlogContent').textContent = blog.content;

            if (blog.image) {
                document.getElementById('viewBlogImage').src = blog.image;
                document.getElementById('viewBlogImage').style.display = 'block';
            } else {
                document.getElementById('viewBlogImage').style.display = 'none';
            }

            document.getElementById('viewBlogTags').innerHTML =
                blog.tags.map(t => `<span class="tag">${t}</span>`).join('');
            document.getElementById('viewBlogMeta').textContent =
                `By ${blog.authorName} on ${new Date(blog.date).toLocaleString()}`;

            new bootstrap.Modal(document.getElementById('viewBlogModal')).show();
        }

        // Initial render
        renderBlogs();



        // Image preview
        document.getElementById('blogImage').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => { document.getElementById('previewImg').src = reader.result; document.getElementById('imagePreview').style.display = 'block'; document.getElementById('uploadPlaceholder').style.display = 'none'; }
                reader.readAsDataURL(file);
            }
        });
        function removeImage(e) { e.stopPropagation(); document.getElementById('previewImg').src = ''; document.getElementById('imagePreview').style.display = 'none'; document.getElementById('uploadPlaceholder').style.display = 'block'; document.getElementById('blogImage').value = ''; }

        // Save blog
        function saveBlog() {
            if (!currentUser) { alert('Login required'); return; }
            const title = document.getElementById('blogTitle').value.trim();
            const content = document.getElementById('blogContent').value.trim();
            const tags = document.getElementById('blogTags').value.split(',').map(t => t.trim()).filter(t => t);
            if (!title || !content) { alert('Fill all fields'); return; }
            const data = { title, content, tags, author: currentUser.username, authorName: currentUser.name, date: new Date().toISOString() };
            const img = document.getElementById('previewImg').src; if (img) data.image = img;
            if (currentBlogId) {
                const idx = blogs.findIndex(b => b.id === currentBlogId);
                if (idx !== -1) { if (currentUser.username !== blogs[idx].author && currentUser.role !== 'admin') { alert('Cannot edit'); return; } blogs[idx] = { ...blogs[idx], ...data }; }
            } else { data.id = Date.now(); blogs.unshift(data); }
            saveBlogs(); renderBlogs(); bootstrap.Modal.getInstance(document.getElementById('blogModal')).hide();
        }

        // Render blogs
        function renderBlogs() {
            const container = document.getElementById('blogContainer');
            container.innerHTML = '';
            if (blogs.length === 0) { document.getElementById('noBlogsMessage').style.display = 'block'; return; } else document.getElementById('noBlogsMessage').style.display = 'none';
            blogs.forEach(blog => {
                const col = document.createElement('div'); col.className = 'col-md-4 mb-4';
                const card = document.createElement('div'); card.className = 'glass-card p-3 blog-card';
                card.innerHTML = `${blog.image ? `<img src="${blog.image}" class="blog-image">` : ''}<h5>${blog.title}</h5><p class="text-secondary">${blog.content.substring(0, 100)}...</p><div>${blog.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div><small class="text-muted">By ${blog.authorName}</small>`;
                if (currentUser && (currentUser.username === blog.author || currentUser.role === 'admin')) {
                    const editBtn = document.createElement('button'); editBtn.className = 'btn btn-sm btn-outline-light mt-2 me-2'; editBtn.textContent = 'Edit'; editBtn.onclick = () => editBlog(blog.id);
                    const delBtn = document.createElement('button'); delBtn.className = 'btn btn-sm btn-outline-danger mt-2'; delBtn.textContent = 'Delete'; delBtn.onclick = () => deleteBlog(blog.id);
                    card.appendChild(editBtn); card.appendChild(delBtn);
                }
                col.appendChild(card); container.appendChild(col);
            });
        }

        // Edit/Delete
        function editBlog(id) {
            const blog = blogs.find(b => b.id === id); if (!blog) return;
            currentBlogId = id; document.getElementById('modalTitle').textContent = 'Edit Post';
            document.getElementById('blogTitle').value = blog.title; document.getElementById('blogContent').value = blog.content;
            document.getElementById('blogTags').value = blog.tags.join(',');
            if (blog.image) { document.getElementById('previewImg').src = blog.image; document.getElementById('imagePreview').style.display = 'block'; document.getElementById('uploadPlaceholder').style.display = 'none'; }
            else { document.getElementById('previewImg').src = ''; document.getElementById('imagePreview').style.display = 'none'; document.getElementById('uploadPlaceholder').style.display = 'block'; }
            new bootstrap.Modal(document.getElementById('blogModal')).show();
        }
        function deleteBlog(id) { if (confirm('Delete this post?')) { blogs = blogs.filter(b => b.id !== id); saveBlogs(); renderBlogs(); } }

        // Initial render
        document.addEventListener('DOMContentLoaded', () => { renderBlogs(); });