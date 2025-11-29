<h1>Content-Based Filtering - Giải thích cho người mới</h1>
<h2>🎯 Ý tưởng cơ bản</h2>
<p><strong>Content-Based = Gợi ý dựa trên ĐẶC ĐIỂM của items</strong></p>
<h3>Ví dụ đời thường:</h3>
<pre><code>Bạn thích ăn:
- Phở: Món Việt, Nóng, Có nước, Giá 50k
- Bún bò: Món Việt, Nóng, Có nước, Giá 45k
- Hủ tiếu: Món Việt, Nóng, Có nước, Giá 40k

→ Hệ thống gợi ý: Bánh canh (Món Việt, Nóng, Có nước, Giá 35k)
→ Lý do: Giống với những món bạn đã thích!
</code></pre>
<hr>
<h2>📊 So sánh CF vs Content-Based</h2>
<h3>Collaborative Filtering (CF):</h3>
<pre><code>"Người khác thích gì?"

User A thích: Phở, Bún bò
User B thích: Phở, Bún bò, Hủ tiếu
→ Gợi ý cho A: Hủ tiếu (vì B giống A và B thích Hủ tiếu)
</code></pre>
<h3>Content-Based:</h3>
<pre><code>"Item có đặc điểm gì?"

Bạn thích: Phở (Việt, Nóng, Nước)
→ Gợi ý: Bún bò (Việt, Nóng, Nước) - Giống Phở!
</code></pre>
<hr>
<h2>🎬 Ví dụ 1: Gợi ý Phim</h2>
<h3>Bước 1: Mô tả đặc điểm phim</h3>
<pre><code class="language-python"># Phim bạn đã xem và thích
phim_da_xem = {
    "The Godfather": {
        "thể_loại": ["Crime", "Drama"],
        "đạo_diễn": "Francis Ford Coppola",
        "diễn_viên": ["Marlon Brando", "Al Pacino"],
        "năm": 1972,
        "rating": 5  # Bạn cho 5 sao
    },
    
    "Scarface": {
        "thể_loại": ["Crime", "Drama"],
        "đạo_diễn": "Brian De Palma",
        "diễn_viên": ["Al Pacino"],
        "năm": 1983,
        "rating": 5
    }
}

# Phim chưa xem
phim_chua_xem = {
    "The Irishman": {
        "thể_loại": ["Crime", "Drama"],
        "đạo_diễn": "Martin Scorsese",
        "diễn_viên": ["Robert De Niro", "Al Pacino"],
        "năm": 2019
    },
    
    "Toy Story": {
        "thể_loại": ["Animation", "Comedy"],
        "đạo_diễn": "John Lasseter",
        "diễn_viên": ["Tom Hanks"],
        "năm": 1995
    }
}
</code></pre>
<h3>Bước 2: Tạo profile của bạn</h3>
<pre><code class="language-python"># Phân tích những phim bạn thích
profile_cua_ban = {
    "thể_loại_yêu_thích": {
        "Crime": 2,    # Xuất hiện 2 lần
        "Drama": 2     # Xuất hiện 2 lần
    },
    "diễn_viên_yêu_thích": {
        "Al Pacino": 2,      # Xuất hiện 2 lần
        "Marlon Brando": 1
    },
    "năm_trung_bình": 1977.5  # (1972 + 1983) / 2
}
</code></pre>
<h3>Bước 3: Tính độ tương đồng</h3>
<pre><code class="language-python">def tinh_do_tuong_dong(phim_moi, profile):
    """
    Tính xem phim mới giống profile bạn bao nhiêu %
    """
    diem = 0
    
    # Check thể loại
    for the_loai in phim_moi["thể_loại"]:
        if the_loai in profile["thể_loại_yêu_thích"]:
            diem += 10  # +10 điểm cho mỗi thể loại match
    
    # Check diễn viên
    for dien_vien in phim_moi["diễn_viên"]:
        if dien_vien in profile["diễn_viên_yêu_thích"]:
            diem += 5   # +5 điểm cho mỗi diễn viên match
    
    return diem

# Tính điểm
the_irishman_score = tinh_do_tuong_dong(
    phim_chua_xem["The Irishman"],
    profile_cua_ban
)
# → Crime: +10, Drama: +10, Al Pacino: +5 = 25 điểm

toy_story_score = tinh_do_tuong_dong(
    phim_chua_xem["Toy Story"],
    profile_cua_ban
)
# → Không match gì = 0 điểm

# Gợi ý
print("Gợi ý: The Irishman (25 điểm)")
print("Không gợi ý: Toy Story (0 điểm)")
</code></pre>
<hr>
<h2>💼 Ví dụ 2: Gợi ý Jobs (Thực tế)</h2>
<h3>Bước 1: Mô tả Worker và Jobs</h3>
<pre><code class="language-python"># Profile của Worker
worker = {
    "id": 1,
    "kỹ_năng": ["Dọn dẹp", "Nấu ăn"],
    "kinh_nghiệm": 2,  # 2 năm
    "vị_trí": "Quận 1",
    "lương_mong_muốn": 150000,
    "lịch_sử": [
        {"category": "Dọn dẹp", "rating": 5},
        {"category": "Nấu ăn", "rating": 4}
    ]
}

# Jobs có sẵn
jobs = [
    {
        "id": 1,
        "title": "Dọn dẹp nhà",
        "category": "Dọn dẹp",
        "location": "Quận 1",
        "salary": 150000,
        "yêu_cầu_kinh_nghiệm": 1
    },
    {
        "id": 2,
        "title": "Chăm sóc trẻ",
        "category": "Chăm sóc",
        "location": "Quận 2",
        "salary": 200000,
        "yêu_cầu_kinh_nghiệm": 3
    },
    {
        "id": 3,
        "title": "Nấu ăn gia đình",
        "category": "Nấu ăn",
        "location": "Quận 1",
        "salary": 180000,
        "yêu_cầu_kinh_nghiệm": 2
    }
]
</code></pre>
<h3>Bước 2: Tính điểm cho từng job</h3>
<pre><code class="language-python">def content_based_score(worker, job):
    """
    Tính điểm phù hợp giữa worker và job
    """
    score = 0
    
    # 1. Category match (quan trọng nhất)
    worker_categories = [h["category"] for h in worker["lịch_sử"]]
    if job["category"] in worker_categories:
        score += 50  # +50 điểm
    
    # 2. Location match
    if job["location"] == worker["vị_trí"]:
        score += 20  # +20 điểm
    
    # 3. Salary match
    salary_diff = abs(job["salary"] - worker["lương_mong_muốn"])
    if salary_diff &lt; 50000:
        score += 15  # +15 điểm
    
    # 4. Experience match
    if job["yêu_cầu_kinh_nghiệm"] &lt;= worker["kinh_nghiệm"]:
        score += 15  # +15 điểm
    
    return score

# Tính điểm cho từng job
for job in jobs:
    score = content_based_score(worker, job)
    print(f"Job {job['id']}: {job['title']} - {score} điểm")
</code></pre>
<h3>Kết quả:</h3>
<pre><code>Job 1: Dọn dẹp nhà - 100 điểm
  ✅ Category match: +50 (Dọn dẹp)
  ✅ Location match: +20 (Quận 1)
  ✅ Salary match: +15 (150k = 150k)
  ✅ Experience match: +15 (yêu cầu 1 năm, có 2 năm)

Job 2: Chăm sóc trẻ - 0 điểm
  ❌ Category: Không match
  ❌ Location: Quận 2 (khác Quận 1)
  ❌ Salary: 200k (cao hơn mong muốn)
  ❌ Experience: Yêu cầu 3 năm (chỉ có 2)

Job 3: Nấu ăn gia đình - 85 điểm
  ✅ Category match: +50 (Nấu ăn)
  ✅ Location match: +20 (Quận 1)
  ❌ Salary: 180k (hơi cao)
  ✅ Experience match: +15 (yêu cầu 2 năm, có 2 năm)

→ Gợi ý: Job 1 (100 điểm), Job 3 (85 điểm)
</code></pre>
<hr>
<h2>🔢 Ví dụ 3: Vector và Cosine Similarity (Nâng cao)</h2>
<h3>Cách biểu diễn bằng vector:</h3>
<pre><code class="language-python"># Biểu diễn phim bằng vector
# [Crime, Drama, Action, Comedy, Al_Pacino, Tom_Hanks]

the_godfather = [1, 1, 0, 0, 1, 0]
# Crime: có (1), Drama: có (1), Action: không (0), 
# Comedy: không (0), Al Pacino: có (1), Tom Hanks: không (0)

scarface = [1, 1, 0, 0, 1, 0]
# Giống The Godfather

the_irishman = [1, 1, 0, 0, 1, 0]
# Cũng giống!

toy_story = [0, 0, 0, 1, 0, 1]
# Hoàn toàn khác

# Tính độ tương đồng (Cosine Similarity)
from sklearn.metrics.pairwise import cosine_similarity

similarity_godfather_irishman = cosine_similarity(
    [the_godfather], 
    [the_irishman]
)
# → 1.0 (100% giống)

similarity_godfather_toystory = cosine_similarity(
    [the_godfather], 
    [toy_story]
)
# → 0.0 (0% giống)
</code></pre>
<hr>
<h2>💡 Code thực tế đơn giản</h2>
<pre><code class="language-python">class ContentBasedRecommender:
    """
    Content-Based Recommender đơn giản
    """
    
    def __init__(self):
        self.worker_profile = None
    
    def build_profile(self, worker_id):
        """
        Xây dựng profile từ lịch sử
        """
        # Lấy lịch sử applications
        applications = get_applications(worker_id)
        
        # Đếm categories
        category_counts = {}
        for app in applications:
            job = get_job(app.job_id)
            category = job.category
            
            if category not in category_counts:
                category_counts[category] = 0
            
            # Tăng count dựa trên status
            if app.status == 'ACCEPTED':
                category_counts[category] += 3
            elif app.status == 'PENDING':
                category_counts[category] += 1
        
        self.worker_profile = category_counts
        return category_counts
    
    def recommend(self, worker_id, top_n=10):
        """
        Gợi ý jobs
        """
        # 1. Build profile
        profile = self.build_profile(worker_id)
        # → {'Dọn dẹp': 6, 'Nấu ăn': 4}
        
        # 2. Get all active jobs
        jobs = get_active_jobs()
        
        # 3. Score each job
        scored_jobs = []
        for job in jobs:
            score = profile.get(job.category, 0)
            scored_jobs.append((job, score))
        
        # 4. Sort by score
        scored_jobs.sort(key=lambda x: x[1], reverse=True)
        
        # 5. Return top N
        return [job for job, score in scored_jobs[:top_n]]


# Sử dụng
recommender = ContentBasedRecommender()
jobs = recommender.recommend(worker_id=1, top_n=5)

print("Gợi ý jobs:")
for job in jobs:
    print(f"- {job.title} ({job.category})")
</code></pre>
<hr>
<h2>📊 Ưu nhược điểm</h2>
<h3>✅ Ưu điểm:</h3>
<ol>
<li><p><strong>Không cần data của users khác</strong></p>
<ul>
<li>Chỉ cần biết bạn thích gì</li>
<li>Không cần biết người khác thích gì</li>
</ul>
</li>
<li><p><strong>Giải thích được</strong></p>
<ul>
<li>"Gợi ý vì bạn thích Crime movies"</li>
<li>Rõ ràng, dễ hiểu</li>
</ul>
</li>
<li><p><strong>Không có cold start cho items mới</strong></p>
<ul>
<li>Job mới vẫn có category</li>
<li>Có thể gợi ý ngay</li>
</ul>
</li>
<li><p><strong>Đơn giản, nhanh</strong></p>
<ul>
<li>Không cần train model phức tạp</li>
<li>Chỉ cần tính điểm</li>
</ul>
</li>
</ol>
<h3>❌ Nhược điểm:</h3>
<ol>
<li><p><strong>Không khám phá mới</strong></p>
<ul>
<li>Chỉ gợi ý giống cũ</li>
<li>Không có surprise</li>
</ul>
</li>
<li><p><strong>Cần mô tả items tốt</strong></p>
<ul>
<li>Phải có đầy đủ features</li>
<li>Khó với items phức tạp</li>
</ul>
</li>
<li><p><strong>Cold start cho users mới</strong></p>
<ul>
<li>User mới chưa có lịch sử</li>
<li>Không biết gợi ý gì</li>
</ul>
</li>
</ol>
<hr>
<h2>🎯 Khi nào dùng Content-Based?</h2>
<h3>✅ Nên dùng khi:</h3>
<ul>
<li>Items có đặc điểm rõ ràng (category, tags, features)</li>
<li>Ít users (không đủ data cho CF)</li>
<li>Items mới liên tục (như jobs)</li>
<li>Cần giải thích recommendations</li>
</ul>
<h3>❌ Không nên dùng khi:</h3>
<ul>
<li>Items khó mô tả (như âm nhạc, nghệ thuật)</li>
<li>Muốn khám phá mới</li>
<li>Có nhiều users và interactions (CF tốt hơn)</li>
</ul>
<hr>
<h2>🔥 Kết hợp CF + Content-Based (Hybrid)</h2>
<pre><code class="language-python">def hybrid_recommend(worker_id):
    # 1. CF recommendations (personalized)
    cf_jobs = cf_recommender.recommend(worker_id, top_n=10)
    
    # 2. Content-based (profile matching)
    content_jobs = content_recommender.recommend(worker_id, top_n=10)
    
    # 3. Merge
    all_jobs = cf_jobs + content_jobs
    
    # 4. Remove duplicates và rank
    unique_jobs = remove_duplicates(all_jobs)
    ranked_jobs = rank_by_score(unique_jobs)
    
    return ranked_jobs[:10]
</code></pre>
<hr>
<h2>📝 Tóm tắt</h2>
<h3>Content-Based = Gợi ý dựa trên ĐẶC ĐIỂM</h3>
<pre><code>Bạn thích: Phở (Việt, Nóng, Nước)
         ↓
Hệ thống tìm: Items giống Phở
         ↓
Gợi ý: Bún bò (Việt, Nóng, Nước)
</code></pre>
<h3>So với CF:</h3>
<table>
<thead>
<tr>
<th></th>
<th>Content-Based</th>
<th>Collaborative Filtering</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Dựa vào</strong></td>
<td>Đặc điểm items</td>
<td>Hành vi users</td>
</tr>
<tr>
<td><strong>Cần</strong></td>
<td>Features của items</td>
<td>Interactions của users</td>
</tr>
<tr>
<td><strong>Gợi ý</strong></td>
<td>Items giống cũ</td>
<td>Items users khác thích</td>
</tr>
<tr>
<td><strong>Khám phá</strong></td>
<td>Ít</td>
<td>Nhiều</td>
</tr>
<tr>
<td><strong>Giải thích</strong></td>
<td>Dễ</td>
<td>Khó</td>
</tr>
</tbody></table>
<h3>Kết hợp cả 2 = Tốt nhất! 🎯</h3>
<hr>
<p><strong>Hy vọng giải thích này giúp bạn hiểu Content-Based Filtering!</strong> 🚀</p>
